// This file is repurposed as AboutView.tsx
import React, { useContext } from 'react';
import type { Reward } from '../types';
import { LanguageContext } from '../../contexts/LanguageContext';

const Card: React.FC<{children: React.ReactNode, className?: string}> = ({ children, className }) => (
    <div className={`bg-slate-800/50 rounded-2xl border border-slate-700/80 shadow-lg p-5 sm:p-6 ${className}`}>
        {children}
    </div>
);

const AboutView: React.FC = () => {
    const { t } = useContext(LanguageContext)!;
    const socialLinks = [
        { name: 'Facebook', url: '#'},
        { name: 'Instagram', url: '#'},
        { name: 'TikTok', url: '#'},
    ];

  return (
    <div className="space-y-6 p-2 animate-slide-in-up">
      <p className="text-slate-400">{t('aboutSubtitle')}</p>

      <Card>
        <p className="text-slate-300 leading-relaxed">
            {t('aboutP1')}
        </p>
        <p className="mt-4 text-slate-300 leading-relaxed">
            {t('aboutP2')}
        </p>
      </Card>

      <Card>
        <h2 className="text-xl font-semibold text-white mb-4">{t('aboutConnect')}</h2>
        <div className="flex space-x-4">
            {socialLinks.map(link => (
                 <a 
                    key={link.name} 
                    href={link.url}
                    target="_blank" 
                    rel="noopener noreferrer" 
                    className="text-cyan-400 hover:text-cyan-300 underline transition-colors"
                >
                    {link.name}
                 </a>
            ))}
        </div>
      </Card>
    </div>
  );
};

interface RewardsViewProps {
  rewards: Reward[];
}

export const RewardsView: React.FC<RewardsViewProps> = ({ rewards }) => {
  const { t } = useContext(LanguageContext)!;
  return (
    <div className="space-y-6 animate-slide-in-up">
       <p className="text-slate-400">{t('rewardsSubtitle')}</p>
      {rewards.length === 0 ? (
        <div className="text-center p-8 bg-slate-800/50 rounded-2xl border border-slate-700/80">
          <p className="text-6xl mb-4" aria-hidden="true">🏆</p>
          <h2 className="text-xl font-semibold text-white">{t('rewardsNoneTitle')}</h2>
          <p className="text-slate-400 mt-2 max-w-xs mx-auto">
            {t('rewardsNoneDesc')}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {[...rewards].reverse().map((reward, index) => {
            const isBadge = reward.type === 'badge';
            const cardBaseStyle = "border p-4 rounded-2xl flex flex-col items-center text-center transition-all duration-300 transform hover:scale-105 hover:shadow-2xl";
            const badgeStyle = "bg-gradient-to-br from-slate-700 to-slate-800 border-slate-600 shadow-lg";
            const couponStyle = "bg-gradient-to-br from-green-800/50 to-slate-800 border-green-700/50 shadow-lg";

            return (
              <div key={reward.id} 
                   className={`${cardBaseStyle} ${isBadge ? badgeStyle : couponStyle}`}
                   style={{ animation: `slide-in-up 0.5s ease-out ${index * 75}ms backwards` }}>
                <div className="text-5xl mb-3">{reward.icon}</div>
                <h3 className="font-bold text-white text-base leading-tight">{reward.title}</h3>
                <p className="text-slate-400 text-xs mt-1 flex-grow">{reward.description}</p>
                <div className="mt-3 w-full">
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full ${isBadge ? 'bg-cyan-500/20 text-cyan-300' : 'bg-green-500/20 text-green-300'}`}>
                    {isBadge ? t('rewardsBadge') : t('rewardsCoupon')}
                  </span>
                  <p className="text-xs text-slate-500 mt-2">
                    {t('rewardsEarnedOn')} {new Date(reward.date).toLocaleDateString()}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};


export default AboutView;