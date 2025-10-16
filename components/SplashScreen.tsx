import React, { useContext } from 'react';
import Logo from './icons/Logo';
import { LanguageContext } from '../contexts/LanguageContext';

interface SplashScreenProps {
  onGetStarted: () => void;
}

const SplashScreen: React.FC<SplashScreenProps> = ({ onGetStarted }) => {
  const { language, setLanguage, t } = useContext(LanguageContext)!;

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  return (
    <div className="flex flex-col items-center justify-center h-screen p-8 text-center bg-slate-900 animate-fade-in">
      <Logo className="w-32 h-32 mb-6" />
      <h1 className="text-4xl font-bold text-cyan-400">{t('splashTitle')}</h1>
      <p className="mt-2 text-lg text-slate-300 max-w-sm">
        {t('splashSubtitle')}
      </p>
      <button
        onClick={onGetStarted}
        className="mt-8 w-full max-w-xs flex justify-center py-3 px-4 border border-transparent rounded-full shadow-lg text-lg font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-900 focus:ring-cyan-500 transition-all transform hover:scale-105"
      >
        {t('splashButton')}
      </button>
       <div className="absolute bottom-8">
        <button onClick={toggleLanguage} className="text-sm text-slate-400 hover:text-cyan-400 underline transition-colors">
          {language === 'en' ? t('profileSwitchToArabic') : t('profileSwitchToEnglish')}
        </button>
      </div>
    </div>
  );
};

export default SplashScreen;