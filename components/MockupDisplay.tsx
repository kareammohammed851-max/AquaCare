// This file is repurposed as HomeView.tsx
import React, { useState, useEffect, useMemo, useContext, useRef } from 'react';
import type { ConsumptionRecord, Reward } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import { readWaterMeter, generateWaterSavingTips } from '../services/geminiService';
import ConsumptionChart from './ConsumptionChart';


interface HomeViewProps {
  history: ConsumptionRecord[];
  onAddRecord: (record: ConsumptionRecord | ConsumptionRecord[]) => void;
  rewards: Reward[];
  onAddReward: (reward: Reward) => void;
}

type ComparisonResult = 'success' | 'success-special' | 'warning' | 'first' | null;

const possibleRewards: Omit<Reward, 'id' | 'date'>[] = [
  { title: 'Eco-Warrior Badge', description: 'Awarded for your first successful water reduction!', type: 'badge', icon: '🛡️' },
  { title: '5% Off Eco-Friendly Soap', description: 'A coupon for our partner, "Green Suds".', type: 'coupon', icon: '🧼' },
  { title: 'Splash Saver Medal', description: 'You have consistently saved water. Keep it up!', type: 'badge', icon: '💧' },
  { title: 'Garden Guru Discount', description: '10% off water-saving sprinklers.', type: 'coupon', icon: '🌱' },
  { title: 'Conservation Champion', description: 'You are a true hero for the planet!', type: 'badge', icon: '🏆' },
];

const amazonReward: Omit<Reward, 'id' | 'date'> = {
  title: 'Amazon Coupon!',
  description: 'You reduced your consumption by over 10%!',
  type: 'coupon',
  icon: '📦'
};

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-slate-800/50 rounded-2xl border border-slate-700/80 shadow-lg p-5 ${className}`}>
        {children}
    </div>
);


const HomeView: React.FC<HomeViewProps> = ({ history, onAddRecord, rewards, onAddReward }) => {
  const { t } = useContext(LanguageContext)!;
  const [previousConsumption, setPreviousConsumption] = useState('');
  const [currentConsumption, setCurrentConsumption] = useState('');
  const [result, setResult] = useState<ComparisonResult>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [isProcessingImage, setIsProcessingImage] = useState(false);
  const [imageError, setImageError] = useState<string | null>(null);
  const [dailyTip, setDailyTip] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isNewUser = history.length === 0;

  const stats = useMemo(() => {
    const lastMonth = history.length > 0 ? history[history.length - 1].consumption : 0;
    const secondLastMonth = history.length > 1 ? history[history.length - 2].consumption : 0;
    let savings = 0;
    let savingsPercentage = 0;
    if(secondLastMonth > 0) {
      savings = secondLastMonth - lastMonth;
      savingsPercentage = (savings / secondLastMonth) * 100;
    }
    return {
      lastMonth,
      savings,
      savingsPercentage,
    };
  }, [history]);

    useEffect(() => {
        const getDailyTip = async () => {
            const today = new Date().toISOString().split('T')[0]; // YYYY-MM-DD
            try {
                const cachedData = localStorage.getItem('dailyTipsCache');
                let tips: string[] = [];
                
                if (cachedData) {
                    const { date, tips: cachedTips } = JSON.parse(cachedData);
                    if (date === today && Array.isArray(cachedTips) && cachedTips.length > 0) {
                        tips = cachedTips;
                    }
                }

                if (tips.length === 0) {
                    const newTips = await generateWaterSavingTips();
                    if (newTips && newTips.length > 0) {
                        tips = newTips;
                        localStorage.setItem('dailyTipsCache', JSON.stringify({ date: today, tips }));
                    }
                }

                if (tips.length > 0) {
                    const dayOfMonth = new Date().getDate();
                    const tipIndex = (dayOfMonth - 1) % tips.length;
                    setDailyTip(tips[tipIndex]);
                }

            } catch (error) {
                console.error("Failed to get daily tip:", error);
                setDailyTip(null); // Fail gracefully without showing an error to the user
            }
        };

        if (!isNewUser) {
            getDailyTip();
        }
    }, [isNewUser]);
  
  const processComparison = (newValue: number, oldValue: number) => {
      if (newValue < oldValue) {
         const reductionPercentage = (oldValue - newValue) / oldValue;
         if (reductionPercentage >= 0.1) {
             setResult('success-special');
              onAddReward({
                ...amazonReward,
                id: `reward-amazon-${Date.now()}`,
                date: new Date().toISOString(),
              });
         } else {
             setResult('success');
             const rewardToAdd = possibleRewards[rewards.length % possibleRewards.length];
             if (rewardToAdd) {
               onAddReward({
                 ...rewardToAdd,
                 id: `reward-${Date.now()}`,
                 date: new Date().toISOString(),
               });
             }
         }
      } else {
        setResult('warning');
      }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const consumptionValue = parseFloat(currentConsumption);
    if (isNaN(consumptionValue) || consumptionValue < 0) return;

    if (isNewUser) {
        const prevConsumptionValue = parseFloat(previousConsumption);
        if (isNaN(prevConsumptionValue) || prevConsumptionValue < 0) return;
        
        const now = new Date();
        const prevMonth = new Date();
        prevMonth.setMonth(now.getMonth() - 1);

        const newRecords: ConsumptionRecord[] = [
            { date: prevMonth.toISOString(), consumption: prevConsumptionValue },
            { date: now.toISOString(), consumption: consumptionValue }
        ];
        onAddRecord(newRecords);
        processComparison(consumptionValue, prevConsumptionValue);
    } else {
        const newRecord: ConsumptionRecord = {
          date: new Date().toISOString(),
          consumption: consumptionValue,
        };
        const lastMonthRecord = history[history.length - 1];
        processComparison(consumptionValue, lastMonthRecord.consumption);
        onAddRecord(newRecord);
    }

    setCurrentConsumption('');
    setPreviousConsumption('');
    clearImage();
  };

  const handleImageSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    clearImage();
    setIsProcessingImage(true);

    const reader = new FileReader();
    reader.onloadend = async () => {
        const base64String = reader.result as string;
        setImagePreview(base64String);

        const base64Data = base64String.split(',')[1];
        if (!base64Data) {
            setImageError(t('homeImageError'));
            setIsProcessingImage(false);
            return;
        }

        try {
            const meterReading = await readWaterMeter(base64Data, file.type);
            if (meterReading && !isNaN(parseFloat(meterReading))) {
                setCurrentConsumption(meterReading);
            } else {
                setImageError(t('homeImageError'));
            }
        } catch (error) {
            console.error("Error reading water meter:", error);
            setImageError(t('homeImageError'));
        } finally {
            setIsProcessingImage(false);
        }
    };
    reader.readAsDataURL(file);
};

  const handleUploadClick = () => {
      fileInputRef.current?.click();
  };

  const clearImage = () => {
      setImagePreview(null);
      setImageError(null);
      if (fileInputRef.current) {
          fileInputRef.current.value = "";
      }
  };

  const TipOfTheDay = () => {
      if (!dailyTip) return null;
      return (
          <Card>
              <h3 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span role="img" aria-label="lightbulb">💡</span>
                  {t('homeTipOfTheDay')}
              </h3>
              <p className="text-slate-300 text-sm">{dailyTip}</p>
          </Card>
      );
  };

  const MonthlyGreeting = () => (
      <Card>
          <h3 className="font-bold text-white mb-2">{t('homeGreetingTitle')}</h3>
          <p className="text-slate-300 text-sm">
             {history.length < 2 ? t('homeGreetingFirst') : stats.savingsPercentage >= 0 ? t('homeGreetingSuccess') : t('homeGreetingWarning')}
          </p>
          {history.length > 0 && <p className="text-cyan-300 font-semibold mt-3 text-sm">{t('homeChallengeAmazon')}</p>}
      </Card>
  );

  const QuickStats = () => (
    <div className="grid grid-cols-2 gap-4">
        <Card className="text-center">
            <p className="text-sm text-slate-400">{t('homeStatLastMonth')}</p>
            <p className="text-2xl font-bold text-white mt-1">{stats.lastMonth} <span className="text-base font-normal text-slate-400">m³</span></p>
        </Card>
         <Card className="text-center">
            <p className="text-sm text-slate-400">{t('homeStatSavings')}</p>
            <p className={`text-2xl font-bold mt-1 ${stats.savings > 0 ? 'text-green-400' : stats.savings < 0 ? 'text-red-400' : 'text-white'}`}>
                {stats.savings > 0 ? `+${stats.savings.toFixed(1)}` : stats.savings.toFixed(1)} 
                <span className="text-base font-normal text-slate-400"> m³</span>
            </p>
        </Card>
    </div>
  );


  const ResultCard = () => {
    if (!result) return null;

    let title = '', description = '', bgColor = '', borderColor = '', textColor = '';
    switch (result) {
        case 'first': [title, description, bgColor, borderColor, textColor] = [t('homeResultFirstTitle'), t('homeResultFirstDesc'), 'bg-blue-900/50', 'border-blue-700', 'text-blue-200']; break;
        case 'success': [title, description, bgColor, borderColor, textColor] = [t('homeResultSuccessTitle'), t('homeResultSuccessDesc'), 'bg-green-900/50', 'border-green-700', 'text-green-200']; break;
        case 'success-special': [title, description, bgColor, borderColor, textColor] = [t('homeResultSuccessSpecialTitle'), t('homeResultSuccessSpecialDesc'), 'bg-yellow-900/50', 'border-yellow-600', 'text-yellow-200']; break;
        case 'warning': [title, description, bgColor, borderColor, textColor] = [t('homeResultWarningTitle'), t('homeResultWarningDesc'), 'bg-red-900/50', 'border-red-700', 'text-red-200']; break;
    }
    
    return (
      <div className={`mt-6 p-4 rounded-xl ${bgColor} border ${borderColor} ${textColor} animate-slide-in-up`}>
        <h3 className="font-bold text-lg">{title}</h3>
        <p className="text-sm">{description}</p>
      </div>
    );
  };
  
  return (
    <div className="space-y-6 animate-slide-in-up">
      {!isNewUser && (
        <>
          <QuickStats />
          <TipOfTheDay />
          <MonthlyGreeting />
          <ConsumptionChart history={history} />
        </>
      )}
      
      <Card>
        <h2 className="text-lg font-bold text-white">{t('homeTitle')}</h2>
        <p className="text-sm text-slate-400 mb-4">{isNewUser ? t('homeSubtitleNewUser') : t('homeSubtitle')}</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
            {isNewUser && (
                <div>
                     <label htmlFor="previous_consumption" className="block text-sm font-medium text-slate-300 mb-1">{t('homePreviousMonth')}</label>
                     <input
                      id="previous_consumption"
                      type="number"
                      step="0.001"
                      value={previousConsumption}
                      onChange={(e) => setPreviousConsumption(e.target.value)}
                      required
                      className="block w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
                      placeholder={t('homePreviousMonthPlaceholder')}
                    />
                </div>
            )}
          <div>
            <label htmlFor="consumption" className="block text-sm font-medium text-slate-300 mb-1">{t('homeCurrentMonth')}</label>
            <div className="flex items-center gap-3">
                <input
                  id="consumption"
                  type="number"
                  step="0.001"
                  value={currentConsumption}
                  onChange={(e) => setCurrentConsumption(e.target.value)}
                  required
                  disabled={isProcessingImage}
                  className="flex-grow block w-full px-4 py-3 bg-slate-700/50 border-2 border-slate-600 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 disabled:opacity-50 transition-all"
                  placeholder={t('homeCurrentMonthPlaceholder')}
                />
                 <input type="file" ref={fileInputRef} onChange={handleImageSelect} accept="image/*" className="hidden" />
                <button
                    type="button"
                    onClick={handleUploadClick}
                    disabled={isProcessingImage}
                    className="p-3 bg-slate-700/80 rounded-lg hover:bg-slate-700 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95 flex-shrink-0 border-2 border-slate-600"
                    aria-label={t('homeUploadButton')}
                >
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z"/><circle cx="12" cy="13" r="3"/></svg>
                </button>
            </div>
          </div>
           {imagePreview && (
              <div className="mt-2 relative">
                  <img src={imagePreview} alt="Water meter preview" className="rounded-lg max-h-48 w-full object-contain border-2 border-slate-600" />
                  {isProcessingImage && (
                      <div className="absolute inset-0 bg-slate-900/80 flex flex-col items-center justify-center rounded-lg">
                          <div className="w-8 h-8 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
                          <p className="mt-2 text-slate-200">{t('homeProcessingImage')}</p>
                      </div>
                  )}
                  {!isProcessingImage && (
                      <button onClick={clearImage} className="absolute top-2 right-2 bg-slate-900/70 text-white rounded-full p-1.5 hover:bg-slate-700 transition-colors" aria-label={t('homeClearImage')}>
                           <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                      </button>
                  )}
              </div>
          )}
          {imageError && <p className="mt-2 text-sm text-red-400 text-center">{imageError}</p>}

          <button
            type="submit"
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-60"
            disabled={isProcessingImage || !currentConsumption || (isNewUser && !previousConsumption)}
          >
            {t('homeSaveButton')}
          </button>
        </form>
      </Card>

      <ResultCard />
    </div>
  );
};

export default HomeView;