
// This file is repurposed as ProfileView.tsx
import React, { useState, useContext } from 'react';
import type { UserProfile } from '../types';
import { LanguageContext } from '../contexts/LanguageContext';
import Logo from './icons/Logo';

interface ProfileViewProps {
  onSignUp?: (profileData: Omit<UserProfile, 'id'>) => Promise<string | null>;
  onSignIn?: (credentials: { name: string; password: string }) => Promise<string | null>;
  onUpdate?: (profileData: UserProfile) => void;
  onSignOut?: () => void;
  existingProfile?: UserProfile | null;
}

const InputField: React.FC<{
  id: string;
  label: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder: string;
  required?: boolean;
}> = ({ id, label, type, value, onChange, placeholder, required = true }) => (
  <div>
    <label htmlFor={id} className="block text-sm font-medium text-slate-300 mb-1">
      {label}
    </label>
    <input
      id={id}
      type={type}
      value={value}
      onChange={onChange}
      required={required}
      className="block w-full px-4 py-2.5 bg-slate-700/50 border-2 border-slate-600 rounded-lg shadow-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-cyan-500 focus:border-cyan-500 transition-all"
      placeholder={placeholder}
    />
  </div>
);

const ProfileView: React.FC<ProfileViewProps> = ({ onSignUp, onSignIn, onUpdate, onSignOut, existingProfile }) => {
  const { language, setLanguage, t } = useContext(LanguageContext)!;

  const [authMode, setAuthMode] = useState<'signin' | 'signup'>('signup');
  const [authError, setAuthError] = useState<string | null>(null);

  const [name, setName] = useState(existingProfile?.name || 'kaream mohamed ahmed');
  const [password, setPassword] = useState(existingProfile?.password || '0123456');
  const [address, setAddress] = useState(existingProfile?.address || 'almatrya- cairo-egypt');
  const [floorNumber, setFloorNumber] = useState(existingProfile?.floorNumber || '2');
  const [apartmentNumber, setApartmentNumber] = useState(existingProfile?.apartmentNumber || '6');
  const [meterNumber, setMeterNumber] = useState(existingProfile?.waterMeterNumber || '6003030');

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    let error = null;

    if (authMode === 'signup') {
      if (onSignUp && name && password && address && floorNumber && apartmentNumber && meterNumber) {
        error = await onSignUp({ name, password, address, floorNumber, apartmentNumber, waterMeterNumber: meterNumber });
      }
    } else {
      if (onSignIn && name && password) {
        error = await onSignIn({ name, password });
      }
    }
    if (error) {
      setAuthError(error);
    }
  };

  const handleUpdateSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (onUpdate && existingProfile && name && password && address && floorNumber && apartmentNumber && meterNumber) {
      onUpdate({ ...existingProfile, name, password, address, floorNumber, apartmentNumber, waterMeterNumber: meterNumber });
    }
  };

  const toggleLanguage = () => {
    setLanguage(language === 'en' ? 'ar' : 'en');
  };

  const AuthForm = () => (
    <>
      <div className="text-center">
        <Logo className="w-16 h-16 mx-auto mb-4 text-cyan-500" />
        <h1 className="text-2xl font-bold text-white">{authMode === 'signup' ? t('profileTitle') : t('profileTitleSignIn')}</h1>
        <p className="mt-1 text-slate-400">{t('profileSubtitle')}</p>
      </div>
      <form onSubmit={handleAuthSubmit} className="space-y-4">
        <InputField id="name" label={t('profileNameLabel')} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('profileNamePlaceholder')} />
        <InputField id="password" label={t('profilePasswordLabel')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('profilePasswordPlaceholder')} />

        {authMode === 'signup' && (
          <>
            <InputField id="address" label={t('profileAddressLabel')} type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('profileAddressPlaceholder')} />
            <div className="flex gap-4">
              <div className="flex-1">
                <InputField id="floorNumber" label={t('profileFloorLabel')} type="text" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} placeholder={t('profileFloorPlaceholder')} />
              </div>
              <div className="flex-1">
                <InputField id="apartmentNumber" label={t('profileApartmentLabel')} type="text" value={apartmentNumber} onChange={(e) => setApartmentNumber(e.target.value)} placeholder={t('profileApartmentPlaceholder')} />
              </div>
            </div>
            <InputField id="meterNumber" label={t('profileMeterLabel')} type="text" value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} placeholder={t('profileMeterPlaceholder')} />
          </>
        )}
        
        {authError && <p className="text-sm text-red-400 text-center">{authError}</p>}

        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
          {authMode === 'signup' ? t('profileRegisterButton') : t('profileSignInButton')}
        </button>
      </form>
      <div className="mt-6 text-center">
        <button onClick={() => setAuthMode(authMode === 'signup' ? 'signin' : 'signup')} className="text-sm text-cyan-400 hover:text-cyan-300 underline transition-colors">
          {authMode === 'signup' ? t('profileToSignIn') : t('profileToSignUp')}
        </button>
      </div>
    </>
  );

  const UpdateForm = () => (
    <>
      <form onSubmit={handleUpdateSubmit} className="space-y-4">
        <InputField id="name" label={t('profileNameLabel')} type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder={t('profileNamePlaceholder')} />
        <InputField id="password" label={t('profilePasswordLabel')} type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t('profilePasswordPlaceholder')} />
        <InputField id="address" label={t('profileAddressLabel')} type="text" value={address} onChange={(e) => setAddress(e.target.value)} placeholder={t('profileAddressPlaceholder')} />

        <div className="flex gap-4">
          <div className="flex-1">
            <InputField id="floorNumber" label={t('profileFloorLabel')} type="text" value={floorNumber} onChange={(e) => setFloorNumber(e.target.value)} placeholder={t('profileFloorPlaceholder')} />
          </div>
          <div className="flex-1">
            <InputField id="apartmentNumber" label={t('profileApartmentLabel')} type="text" value={apartmentNumber} onChange={(e) => setApartmentNumber(e.target.value)} placeholder={t('profileApartmentPlaceholder')} />
          </div>
        </div>

        <InputField id="meterNumber" label={t('profileMeterLabel')} type="text" value={meterNumber} onChange={(e) => setMeterNumber(e.target.value)} placeholder={t('profileMeterPlaceholder')} />

        <button type="submit" className="w-full flex justify-center py-3 px-4 border border-transparent rounded-lg shadow-sm text-base font-medium text-white bg-cyan-600 hover:bg-cyan-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-cyan-500 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
          {t('profileUpdateButton')}
        </button>
      </form>
      <div className="mt-6 border-t border-slate-700 pt-6 space-y-4">
         <button onClick={onSignOut} className="w-full flex justify-center py-3 px-4 border border-slate-600 rounded-lg shadow-sm text-base font-medium text-slate-300 bg-slate-700 hover:bg-slate-600 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-slate-800 focus:ring-slate-500 transition-all">
            {t('profileSignOutButton')}
        </button>
        <button onClick={toggleLanguage} className="w-full text-sm text-cyan-400 hover:text-cyan-300 underline transition-colors">
          {language === 'en' ? t('profileSwitchToArabic') : t('profileSwitchToEnglish')}
        </button>
      </div>
    </>
  );

  return (
    <div className="flex flex-col items-center justify-center h-full animate-slide-in-up">
      <div className="w-full max-w-md p-6 sm:p-8 space-y-6 bg-slate-800/50 rounded-2xl shadow-lg border border-slate-700">
        {existingProfile ? <UpdateForm /> : <AuthForm />}
      </div>
    </div>
  );
};

export default ProfileView;
