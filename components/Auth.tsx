
import React, { useState } from 'react';
import { User } from '../types';
import { auth } from '../services/firebase';
import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword, 
  sendEmailVerification, 
  sendPasswordResetEmail,
  signOut,
  updateProfile
} from "firebase/auth";

interface AuthProps {
  onLogin: (user: User) => void;
}

type AuthView = 'login' | 'signup' | 'forgot-password';

const Auth: React.FC<AuthProps> = ({ onLogin }) => {
  const [view, setView] = useState<AuthView>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [verificationSent, setVerificationSent] = useState(false);
  const [notVerifiedError, setNotVerifiedError] = useState(false);
  const [resendStatus, setResendStatus] = useState<string | null>(null);
  const [resetEmailSent, setResetEmailSent] = useState(false);

  const handleResendEmail = async () => {
    setResendStatus('Sending...');
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      await sendEmailVerification(userCredential.user);
      await signOut(auth);
      setResendStatus('Verification email resent! Check your inbox.');
    } catch (err: any) {
      setResendStatus('Failed to resend. Please try again later.');
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setResetEmailSent(true);
    } catch (err: any) {
      if (err.code === 'auth/user-not-found') {
        setError('No account found with this email address.');
      } else {
        setError('Failed to send reset email. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setNotVerifiedError(false);
    setLoading(true);

    try {
      if (view === 'login') {
        // LOGIN FLOW
        const userCredential = await signInWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;

        // Skip verification check for demo admin account
        if (!fbUser.emailVerified && fbUser.email !== 'admin@demo.com') {
          await signOut(auth);
          setNotVerifiedError(true);
          setLoading(false);
          return;
        }

        const emailLower = (fbUser.email || '').toLowerCase();
        const isAdmin = emailLower.includes('admin') || emailLower === 'admin@demo.com';

        onLogin({
          id: fbUser.uid,
          email: fbUser.email || '',
          name: fbUser.displayName || fbUser.email?.split('@')[0] || 'User',
          role: isAdmin ? 'Super Admin' : 'Teacher',
          status: 'active'
        });

      } else if (view === 'signup') {
        // SIGN UP FLOW
        const userCredential = await createUserWithEmailAndPassword(auth, email, password);
        const fbUser = userCredential.user;
        await updateProfile(fbUser, { displayName: name });
        await sendEmailVerification(fbUser);
        await signOut(auth);
        setVerificationSent(true);
      }
    } catch (err: any) {
      console.debug("Auth Error Code:", err.code);
      if (err.code === 'auth/email-already-in-use') {
        setError('This email is already registered. Please sign in.');
      } else if (err.code === 'auth/invalid-credential' || err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found') {
        setError('Invalid login credentials. Please check your email and password.');
      } else if (err.code === 'auth/too-many-requests') {
        setError('Access temporarily disabled due to too many failed attempts. Please try again later.');
      } else {
        setError('Authentication service error. Please ensure your internet connection is stable.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (verificationSent) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full py-12 text-center animate-fadeInUp">
          <div className="bg-emerald-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <i className="fas fa-envelope-circle-check text-emerald-600 text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Verify Your Email</h2>
          <p className="text-slate-600 font-medium mb-8 leading-relaxed">
            Success! A verification link has been sent to <span className="font-bold text-indigo-600">{email}</span>.<br/>
            Verify your account, then return here to log in.
          </p>
          <button
            onClick={() => {
              setVerificationSent(false);
              setView('login');
            }}
            className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl text-xs font-black uppercase tracking-widest text-white bg-[#1a2b4b] hover:bg-black transition-all"
          >
            I have verified, go to Login
          </button>
        </div>
      </div>
    );
  }

  if (notVerifiedError) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full py-12 text-center animate-fadeInUp">
          <div className="bg-rose-100 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6 shadow-sm">
            <i className="fas fa-user-shield text-rose-600 text-4xl"></i>
          </div>
          <h2 className="text-3xl font-black text-slate-900 uppercase tracking-tighter mb-4">Verification Required</h2>
          <p className="text-slate-600 font-medium mb-8 leading-relaxed">
            Your email <span className="font-bold text-rose-600">{email}</span> has not been verified yet.
            Classroom tools are restricted until your account is active.
          </p>
          <div className="space-y-4">
            <button
              onClick={() => setNotVerifiedError(false)}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl text-xs font-black uppercase tracking-widest text-white bg-[#1a2b4b] hover:bg-black transition-all"
            >
              Back to Login
            </button>
            <button 
              onClick={handleResendEmail}
              className="text-[11px] font-black text-indigo-600 hover:text-indigo-800 uppercase tracking-widest block mx-auto"
            >
              {resendStatus || "Resend verification email"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (view === 'forgot-password') {
    return (
      <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
        <div className="max-w-md w-full py-12">
          <div className="text-center mb-10">
            <div className="bg-[#1a2b4b] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
              <i className="fas fa-key text-white text-3xl"></i>
            </div>
            <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
              Reset Password
            </h2>
            <p className="mt-2 text-slate-500 font-medium">
              We'll send you a link to get back into your account.
            </p>
          </div>

          <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
            {resetEmailSent ? (
              <div className="text-center animate-fadeInUp">
                <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-6">
                  <i className="fas fa-paper-plane text-blue-600"></i>
                </div>
                <h3 className="text-lg font-black text-slate-900 uppercase mb-2">Email Dispatched</h3>
                <p className="text-sm text-slate-500 mb-8">Check <span className="font-bold">{email}</span> for instructions to reset your password.</p>
                <button
                  onClick={() => {
                    setResetEmailSent(false);
                    setView('login');
                  }}
                  className="w-full py-4 bg-[#1a2b4b] text-white rounded-xl text-xs font-black uppercase tracking-widest"
                >
                  Return to Login
                </button>
              </div>
            ) : (
              <form onSubmit={handleResetPassword} className="space-y-6">
                <div>
                  <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
                  <div className="relative">
                    <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                      <i className="fas fa-envelope text-sm"></i>
                    </span>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#1a2b4b] transition-all outline-none"
                      placeholder="teacher@school.rw"
                    />
                  </div>
                </div>

                {error && (
                  <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs font-bold uppercase">
                    <i className="fas fa-exclamation-circle mr-2"></i> {error}
                  </div>
                )}

                <button
                  type="submit"
                  disabled={loading}
                  className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl text-xs font-black uppercase tracking-widest text-white bg-[#1a2b4b] hover:bg-black transition-all"
                >
                  {loading ? <i className="fas fa-circle-notch fa-spin"></i> : 'Send Reset Link'}
                </button>

                <div className="text-center">
                  <button
                    type="button"
                    onClick={() => setView('login')}
                    className="text-[11px] font-bold text-slate-400 hover:text-[#1a2b4b] transition-colors uppercase tracking-tight"
                  >
                    Back to Login
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 bg-slate-50">
      <div className="max-w-md w-full py-12">
        <div className="text-center mb-10">
          <div className="bg-[#1a2b4b] w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
            <i className="fas fa-graduation-cap text-white text-3xl"></i>
          </div>
          <h2 className="text-3xl font-extrabold text-slate-900 tracking-tight uppercase">
            {view === 'login' ? 'Sign In' : 'Create Account'}
          </h2>
          <p className="mt-2 text-slate-500 font-medium italic">
            "Better teaching begins with better planning."
          </p>
        </div>

        <div className="bg-white p-8 rounded-[2.5rem] shadow-2xl shadow-slate-200/50 border border-slate-100">
          <form onSubmit={handleSubmit} className="space-y-6">
            {view === 'signup' && (
              <div>
                <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Full Name</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                    <i className="fas fa-user text-sm"></i>
                  </span>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#1a2b4b] transition-all outline-none"
                    placeholder="E.g. Mugisha Eric"
                  />
                </div>
              </div>
            )}

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Email Address</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                  <i className="fas fa-envelope text-sm"></i>
                </span>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#1a2b4b] transition-all outline-none"
                  placeholder="teacher@school.rw"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-black text-slate-500 uppercase tracking-widest mb-2">Password</label>
              <div className="relative">
                <span className="absolute inset-y-0 left-0 pl-4 flex items-center text-slate-300">
                  <i className="fas fa-lock text-sm"></i>
                </span>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border border-slate-200 rounded-xl bg-slate-50 focus:ring-2 focus:ring-[#1a2b4b] transition-all outline-none"
                  placeholder="••••••••"
                />
              </div>
              {view === 'login' && (
                <div className="text-right mt-2">
                  <button
                    type="button"
                    onClick={() => setView('forgot-password')}
                    className="text-[10px] font-bold text-slate-400 hover:text-[#1a2b4b] uppercase tracking-tighter"
                  >
                    Forgot Password?
                  </button>
                </div>
              )}
            </div>

            {error && (
              <div className="p-4 bg-rose-50 text-rose-700 rounded-xl border border-rose-100 text-xs font-bold uppercase">
                <i className="fas fa-exclamation-circle mr-2"></i> {error}
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-4 px-4 border border-transparent rounded-xl shadow-xl text-xs font-black uppercase tracking-widest text-white bg-[#1a2b4b] hover:bg-black transition-all transform hover:scale-[1.02] active:scale-[0.98] disabled:bg-slate-400"
            >
              {loading ? <i className="fas fa-circle-notch fa-spin text-lg"></i> : (view === 'login' ? 'Enter Portal' : 'Register & Verify')}
            </button>
          </form>

          <div className="mt-8 text-center">
            <button
              onClick={() => {
                setView(view === 'login' ? 'signup' : 'login');
                setError(null);
                setResendStatus(null);
              }}
              className="text-[11px] font-bold text-[#1a2b4b] hover:text-blue-700 transition-colors uppercase tracking-tight"
            >
              {view === 'login' ? "Need a verified account? Register" : 'Back to Login'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Auth;
