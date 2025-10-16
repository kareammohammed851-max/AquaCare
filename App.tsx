import React, { useState, useEffect, useCallback, useContext } from 'react';
import type { UserProfile, ConsumptionRecord, Reward } from './types';
import { LanguageContext } from './contexts/LanguageContext';

import SplashScreen from './components/SplashScreen';
import ProfileView from './components/PromptInput';
import HomeView from './components/MockupDisplay';
import BottomNav from './components/PhoneFrame';
import TipsView from './components/Loader';
import AboutView, { RewardsView } from './components/icons/SparklesIcon';
import Chatbot from './components/Chatbot';
import AppHeader from './components/AppHeader';

type Page = 'home' | 'tips' | 'rewards' | 'chat' | 'about' | 'profile';

const useLocalStorage = <T,>(key: string, initialValue: T): [T, (value: T | ((prevState: T) => T)) => void] => {
  const [storedValue, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(error);
      return initialValue;
    }
  });

  const setValue = (value: T | ((prevState: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value;
      setStoredValue(valueToStore);
      window.localStorage.setItem(key, JSON.stringify(valueToStore));
    } catch (error) {
      console.error(error);
    }
  };

  return [storedValue, setValue];
};

const App: React.FC = () => {
  const [users, setUsers] = useLocalStorage<UserProfile[]>('usersDb', []);
  const [activeProfile, setActiveProfile] = useLocalStorage<UserProfile | null>('activeProfile', null);
  
  const [consumptionHistory, setConsumptionHistory] = useState<ConsumptionRecord[]>([]);
  const [rewards, setRewards] = useState<Reward[]>([]);
  
  const [activePage, setActivePage] = useState<Page>('home');
  const [isInitialized, setIsInitialized] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  const languageContext = useContext(LanguageContext);
  if (!languageContext) return null;
  const { t } = languageContext;

  // Load user-specific data when profile changes
  useEffect(() => {
    if (activeProfile) {
      const userHistory = window.localStorage.getItem(`consumptionHistory_${activeProfile.id}`);
      const userRewards = window.localStorage.getItem(`userRewards_${activeProfile.id}`);
      setConsumptionHistory(userHistory ? JSON.parse(userHistory) : []);
      setRewards(userRewards ? JSON.parse(userRewards) : []);
    } else {
      setConsumptionHistory([]);
      setRewards([]);
    }
  }, [activeProfile]);

  // Save user-specific consumption data when it changes
  useEffect(() => {
    if (activeProfile) {
      window.localStorage.setItem(`consumptionHistory_${activeProfile.id}`, JSON.stringify(consumptionHistory));
    }
  }, [consumptionHistory, activeProfile]);
  
  // Save user-specific rewards data when it changes
  useEffect(() => {
    if (activeProfile) {
      window.localStorage.setItem(`userRewards_${activeProfile.id}`, JSON.stringify(rewards));
    }
  }, [rewards, activeProfile]);


  useEffect(() => {
    if (isInitialized && !activeProfile) {
      setActivePage('profile');
    }
  }, [isInitialized, activeProfile]);
  
  const handleSignUp = async (profileData: Omit<UserProfile, 'id'>): Promise<string | null> => {
    if (users.find(user => user.name.toLowerCase() === profileData.name.toLowerCase())) {
      return t('profileErrorSignUp');
    }
    const newUser: UserProfile = { ...profileData, id: Date.now().toString() };
    setUsers(prev => [...prev, newUser]);
    setActiveProfile(newUser);
    setActivePage('home');
    return null;
  };

  const handleSignIn = async (credentials: {name: string, password: string}): Promise<string | null> => {
    const user = users.find(u => u.name.toLowerCase() === credentials.name.toLowerCase() && u.password === credentials.password);
    if (user) {
      setActiveProfile(user);
      setActivePage('home');
      return null;
    }
    return t('profileErrorSignIn');
  };

  const handleSignOut = () => {
    setActiveProfile(null);
  };

  const handleUpdateProfile = (updatedProfile: UserProfile) => {
    setUsers(prevUsers => prevUsers.map(u => u.id === updatedProfile.id ? updatedProfile : u));
    setActiveProfile(updatedProfile);
    setActivePage('home'); // Go to home after updating
  };

  const handleAddRecord = useCallback((records: ConsumptionRecord | ConsumptionRecord[]) => {
    setConsumptionHistory(prev => [...prev, ...(Array.isArray(records) ? records : [records])]);
  }, []);

  const handleAddReward = useCallback((reward: Reward) => {
    setRewards(prev => [...prev, reward]);
  }, []);
  
  const handleGetStarted = () => {
      setShowSplash(false);
      setIsInitialized(true);
  }

  if (showSplash) {
      return <SplashScreen onGetStarted={handleGetStarted} />;
  }
  
  if (!activeProfile) {
    return (
       <div className="h-screen flex flex-col max-w-lg mx-auto shadow-2xl shadow-cyan-900/40 bg-slate-900/80 backdrop-blur-3xl border border-slate-700/50 rounded-3xl overflow-hidden">
        <main className="flex-grow flex items-center justify-center p-4 sm:p-6">
           <ProfileView onSignIn={handleSignIn} onSignUp={handleSignUp} />
        </main>
      </div>
    );
  }
  
  const pageContent = () => {
      const homeViewProps = {
        history: consumptionHistory,
        onAddRecord: handleAddRecord,
        rewards: rewards,
        onAddReward: handleAddReward,
      };

      switch (activePage) {
        case 'home':
          return <HomeView {...homeViewProps} />;
        case 'tips':
          return <TipsView />;
        case 'rewards':
          return <RewardsView rewards={rewards} />;
        case 'chat':
          return <Chatbot />;
        case 'about':
          return <AboutView />;
        case 'profile':
            return <ProfileView onUpdate={handleUpdateProfile} onSignOut={handleSignOut} existingProfile={activeProfile} />;
        default:
          return <HomeView {...homeViewProps} />;
      }
  };
  
  return (
    <div className="h-screen flex flex-col max-w-lg mx-auto shadow-2xl shadow-cyan-900/40 bg-slate-900/80 backdrop-blur-3xl border border-slate-700/50 rounded-3xl overflow-hidden">
        <AppHeader page={activePage} profileName={activeProfile.name} />
        
        <main className="flex-grow overflow-y-auto px-4 sm:px-6 py-6">
            {pageContent()}
        </main>
        
        <footer className="flex-shrink-0 z-10">
            <BottomNav activePage={activePage} setActivePage={setActivePage} />
        </footer>
    </div>
  );
};

export default App;