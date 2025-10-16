import React, { useContext } from 'react';
import { LanguageContext } from '../contexts/LanguageContext';

interface AppHeaderProps {
    page: 'home' | 'tips' | 'rewards' | 'chat' | 'about' | 'profile';
    profileName?: string;
}

const AppHeader: React.FC<AppHeaderProps> = ({ page, profileName }) => {
    const { t } = useContext(LanguageContext)!;

    const titles: Record<typeof page, string> = {
        home: t('homeDashboardTitle'),
        tips: t('tipsTitle'),
        rewards: t('rewardsTitle'),
        chat: t('chatTitle'),
        about: t('aboutTitle'),
        profile: t('navProfile'),
    };
    
    const title = titles[page];
    const isHome = page === 'home';

    return (
        <header className="px-4 sm:px-6 pt-6 pb-4">
            {isHome && profileName ? (
                <div>
                    <h1 className="text-2xl font-bold text-cyan-400 leading-tight tracking-tight">{`${t('homeWelcome')} ${profileName}!`}</h1>
                    <p className="text-slate-400">{title}</p>
                </div>
            ) : (
                <h1 className="text-2xl font-bold text-cyan-400 leading-tight tracking-tight">{title}</h1>
            )}
        </header>
    );
};

export default AppHeader;
