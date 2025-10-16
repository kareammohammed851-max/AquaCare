// This file is repurposed as TipsView.tsx
import React, { useState, useEffect, useCallback, useContext } from 'react';
import { generateWaterSavingTips } from '../services/geminiService';
import { LanguageContext } from '../contexts/LanguageContext';

const Loader: React.FC = () => {
  const { t } = useContext(LanguageContext)!;
  return (
    <div className="flex flex-col items-center justify-center text-center p-8">
      <div className="w-10 h-10 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="mt-4 text-slate-300">{t('tipsLoading')}</p>
    </div>
  );
};

const TipsView: React.FC = () => {
  const { t } = useContext(LanguageContext)!;
  const [tips, setTips] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  const fetchTips = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const newTips = await generateWaterSavingTips();
      setTips(newTips);
    } catch (err) {
      setError(err instanceof Error ? err.message : t('tipsErrorMain'));
    } finally {
      setIsLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchTips();
  }, [fetchTips]);

  return (
    <div className="space-y-6 animate-slide-in-up">
        <div className="flex justify-between items-center">
             <p className="text-slate-400 max-w-xs">{t('tipsSubtitle')}</p>
             <button
                onClick={fetchTips}
                disabled={isLoading}
                className="flex items-center gap-2 py-2 px-4 bg-slate-700/80 rounded-full hover:bg-slate-700 disabled:opacity-50 transition-all transform hover:scale-105 active:scale-95 border-2 border-slate-600"
                aria-label={t('tipsRefresh')}
              >
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={`transition-transform ${isLoading ? 'animate-spin' : ''}`}><path d="M21 12a9 9 0 0 1-9 9a9.75 9.75 0 0 1-6.74-2.74L3 16"/><path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8"/><path d="M3 16v-4h4"/><path d="M21 8V4h-4"/></svg>
                  <span className="text-sm font-semibold">{t('tipsRefresh')}</span>
              </button>
        </div>
      
      {isLoading && <Loader />}
      {error && (
        <div className="bg-red-900/50 border border-red-700 text-red-300 px-4 py-3 rounded-xl text-center" role="alert">
          <strong>{t('tipsErrorPrefix')}</strong> {error}
        </div>
      )}
      {!isLoading && !error && (
        <ul className="space-y-4">
          {tips.map((tip, index) => (
            <li key={index} 
                className="bg-slate-800/50 p-4 rounded-xl border border-slate-700 flex items-start gap-4 transition-all hover:border-cyan-600 hover:bg-slate-800/80"
                style={{ animationDelay: `${index * 50}ms` }}
            >
                <div className="flex-shrink-0 mt-1 w-8 h-8 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center">
                    <span className="text-white font-bold text-lg">💧</span>
                </div>
                <span className="text-slate-300 pt-1">{tip}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};

export default TipsView;