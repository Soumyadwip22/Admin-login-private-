import React, { useState } from 'react';
import { Flame, Shield, Lock, Mail, KeyRound, ArrowRight, AlertTriangle, CheckCircle2, UserCheck, ShieldCheck } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';

export const LoginView: React.FC = () => {
  const { loginWithGoogle, loginWithOrganizerPass, authorizedEmails, loading } = useAuth();
  const [email, setEmail] = useState<string>('mondalsoumyadwip1110@gmail.com');
  const [passkey, setPasskey] = useState<string>('esports2026');
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'google' | 'passkey'>('passkey');

  const handleGoogleLogin = async () => {
    setErrorMsg('');
    try {
      await loginWithGoogle();
    } catch (err: any) {
      if (err?.code === 'auth/popup-blocked' || err?.message?.includes('popup')) {
        setErrorMsg('Browser popup was blocked. You can use the Organizer Passkey tab directly.');
        setActiveTab('passkey');
      } else {
        setErrorMsg(err?.message || 'Authentication failed. Please check permissions.');
      }
    }
  };

  const handlePasskeyLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) {
      setErrorMsg('Please enter an authorized admin email.');
      return;
    }
    setErrorMsg('');
    setIsSubmitting(true);
    try {
      const success = await loginWithOrganizerPass(email, passkey);
      if (!success) {
        setErrorMsg(`Access Denied. Email "${email}" is not authorized or passkey is incorrect. Authorized email: mondalsoumyadwip1110@gmail.com`);
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Login error');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0A0A0C] flex flex-col justify-center items-center p-4 relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-tr from-[#FF4D00]/10 via-[#FF4D00]/5 to-transparent rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-96 h-96 bg-[#00FF66]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md relative z-10">
        {/* Header Branding */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-br from-[#FF4D00] to-[#991B00] shadow-xl shadow-[#FF4D00]/25 mb-4 border border-[#FF4D00]/40">
            <Flame className="w-9 h-9 text-white animate-pulse" />
          </div>
          <h1 className="font-['Chakra_Petch'] text-2xl md:text-3xl font-bold tracking-wider text-white uppercase">
            FF ESPORTS <span className="text-[#FF4D00]">CONTROL STATION</span>
          </h1>
          <p className="text-xs text-zinc-400 mt-1 font-mono">
            Authorized Tournament Organizer & Referee Portal
          </p>
        </div>

        {/* Card Container */}
        <div className="bg-[#14141A] border border-zinc-800/90 rounded-2xl shadow-2xl p-6 md:p-8 backdrop-blur-xl relative">
          <div className="flex items-center justify-between pb-4 mb-5 border-b border-zinc-800">
            <div className="flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-[#00FF66]" />
              <span className="text-xs font-semibold text-zinc-200">Organizer Authentication</span>
            </div>
            <span className="text-[10px] font-mono text-zinc-400 bg-zinc-900 px-2 py-0.5 rounded border border-zinc-800">
              v4.2 SECURE
            </span>
          </div>

          {/* Tab selector */}
          <div className="grid grid-cols-2 gap-1.5 p-1 bg-[#0A0A0C] rounded-xl mb-5 border border-zinc-800/80">
            <button
              type="button"
              onClick={() => { setActiveTab('passkey'); setErrorMsg(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'passkey'
                  ? 'bg-[#1C1C24] text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <KeyRound className="w-3.5 h-3.5 text-[#FF4D00]" /> Organizer Pass
            </button>
            <button
              type="button"
              onClick={() => { setActiveTab('google'); setErrorMsg(''); }}
              className={`py-2 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'google'
                  ? 'bg-[#1C1C24] text-white shadow-sm border border-zinc-700/60'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <svg className="w-3.5 h-3.5" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
              </svg>
              Google Auth
            </button>
          </div>

          {errorMsg && (
            <div className="mb-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl flex items-start gap-2.5 text-xs text-red-300 animate-fadeIn">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
              <div>{errorMsg}</div>
            </div>
          )}

          {activeTab === 'passkey' ? (
            <form onSubmit={handlePasskeyLogin} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Organizer Email</span>
                  <span className="text-[10px] text-zinc-400 font-mono">Restricted</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="mondalsoumyadwip1110@gmail.com"
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700/80 focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-400 font-mono outline-none transition-all"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-300 mb-1.5 flex items-center justify-between">
                  <span>Security Passkey</span>
                  <span className="text-[10px] text-[#00FF66] font-mono">Verified Session</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    value={passkey}
                    onChange={(e) => setPasskey(e.target.value)}
                    placeholder="Enter organizer key"
                    required
                    className="w-full bg-[#0E0E12] border border-zinc-700/80 focus:border-[#FF4D00] focus:ring-1 focus:ring-[#FF4D00] rounded-xl pl-9 pr-3 py-2.5 text-xs text-white placeholder-zinc-400 outline-none transition-all"
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={isSubmitting || loading}
                className="w-full bg-gradient-to-r from-[#FF4D00] to-[#E03E00] hover:from-[#FF5D1A] hover:to-[#EB4A0C] text-white font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-[#FF4D00]/20 transition-all cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? (
                  <span>Verifying Credentials...</span>
                ) : (
                  <>
                    <span>Enter Control Station</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>

              {/* Organizer Sign In Note */}
              <div className="pt-1 text-center">
                <p className="text-[11px] text-zinc-500 font-mono">
                  Authorized access for registered organizers & match admins
                </p>
              </div>
            </form>
          ) : (
            <div className="space-y-4 py-2">
              <p className="text-xs text-zinc-300 leading-relaxed text-center">
                Sign in with your Google account. Access is automatically granted for verified tournament organizers.
              </p>

              <button
                onClick={handleGoogleLogin}
                disabled={loading}
                className="w-full bg-white hover:bg-zinc-100 text-zinc-900 font-semibold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2.5 shadow-md transition-all cursor-pointer disabled:opacity-50"
              >
                <svg className="w-4 h-4" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
                </svg>
                <span>Sign in with Google</span>
              </button>
            </div>
          )}

          {/* Authorized Admin Notice */}
          <div className="mt-6 pt-4 border-t border-zinc-800/80 text-center">
            <div className="text-[11px] text-zinc-400 flex items-center justify-center gap-1.5 font-mono">
              <Lock className="w-3 h-3 text-[#FF4D00]" />
              <span>Active Admin:</span>
              <span className="text-zinc-300 font-semibold">soumyadwipmondal869@gmail.com</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
