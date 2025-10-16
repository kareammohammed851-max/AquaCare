

// This file is repurposed as BottomNav.tsx
import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

type Page = 'home' | 'tips' | 'rewards' | 'chat' | 'about' | 'profile';

interface BottomNavProps {
  activePage: Page;
  setActivePage: (page: Page) => void;
}

const NavItem: React.FC<{
  label: string;
  // Fix: Changed icon type from React.ReactNode to React.ReactElement for proper prop handling with React.cloneElement.
  icon: React.ReactElement;
  isActive: boolean;
  onClick: () => void;
}> = ({ label, icon, isActive, onClick }) => (
  <button
    onClick={onClick}
    className="flex-1 flex flex-col items-center justify-center gap-1 py-2 transition-colors duration-200 group focus:outline-none focus:bg-slate-700/50 rounded-lg"
    aria-label={`Go to ${label} page`}
  >
    <div 
        className={`relative w-14 h-8 flex items-center justify-center rounded-full transition-all duration-300 ease-in-out ${isActive ? 'bg-cyan-500/20' : 'bg-transparent group-hover:bg-slate-700/80'}`}
    >
        {React.cloneElement(icon, { className: `w-6 h-6 transition-colors ${isActive ? 'text-cyan-300' : 'text-slate-400 group-hover:text-white'}` })}
    </div>
    <span className={`text-xs font-medium transition-colors ${isActive ? 'text-white' : 'text-slate-400 group-hover:text-white'}`}>{label}</span>
  </button>
);


// Inline SVG icons to avoid creating new files
const HomeIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg> );
const TipsIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 14v4"/><path d="M12 4a2 2 0 1 0 0 4 2 2 0 0 0 0-4Z"/><path d="M8.5 10a2.5 2.5 0 0 1 5 0V11a4.5 4.5 0 0 1-4.5 4.5 4.5 4.5 0 0 1 0-9Z"/></svg> );
const RewardIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg> );
const ChatIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/></svg> );
const AboutIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg> );
const ProfileIcon: React.FC<{ className?: string }> = ({ className }) => ( <svg className={className} xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg> );


const BottomNav: React.FC<BottomNavProps> = ({ activePage, setActivePage }) => {
  const { t } = useContext(LanguageContext)!;
  return (
    <nav className="bg-slate-800/60 backdrop-blur-xl border-t border-slate-700 flex justify-around items-center p-1">
      <NavItem label={t('navHome')} icon={<HomeIcon />} isActive={activePage === 'home'} onClick={() => setActivePage('home')} />
      <NavItem label={t('navTips')} icon={<TipsIcon />} isActive={activePage === 'tips'} onClick={() => setActivePage('tips')} />
      <NavItem label={t('navRewards')} icon={<RewardIcon />} isActive={activePage === 'rewards'} onClick={() => setActivePage('rewards')} />
      <NavItem label={t('navChat')} icon={<ChatIcon />} isActive={activePage === 'chat'} onClick={() => setActivePage('chat')} />
      <NavItem label={t('navAbout')} icon={<AboutIcon />} isActive={activePage === 'about'} onClick={() => setActivePage('about')} />
      <NavItem label={t('navProfile')} icon={<ProfileIcon />} isActive={activePage === 'profile'} onClick={() => setActivePage('profile')} />
    </nav>
  );
};

export default BottomNav;