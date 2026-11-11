import { signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn, LogOut, User, CheckCircle2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function Login() {
  const navigate = useNavigate();
  const user = auth.currentUser;
  const isAnonymous = user?.isAnonymous;

  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
      navigate('/');
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Please try again.');
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      // App.tsx will automatically re-sign in anonymously if we want,
      // or we can just let it stay on login page.
    } catch (error) {
      console.error('Logout failed', error);
    }
  };

  return (
    <div className="min-h-screen bg-[#f8fafc] flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-3xl shadow-xl border border-slate-100 p-8 text-center space-y-8">
        <div className="space-y-2">
          <h1 className="text-3xl font-black text-[#0B1F3A] tracking-tight uppercase" style={{ fontFamily: 'Georgia, serif' }}>
            AL-DAHR ACADEMY
          </h1>
          <p className="text-[#D4AF37] text-xs font-bold tracking-[0.2em] uppercase">
            DEEN • DUNIYA • A BRIGHTER FUTURE
          </p>
        </div>

        <div className="py-4">
          <div className="w-20 h-20 bg-[#0B1F3A] rounded-full flex items-center justify-center mx-auto shadow-lg mb-4">
            {user && !isAnonymous ? (
              <img src={user.photoURL || ''} alt="User" className="w-full h-full rounded-full border-2 border-[#D4AF37]" />
            ) : (
              <LogIn className="w-10 h-10 text-white" />
            )}
          </div>
          
          {user && !isAnonymous ? (
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">Welcome, {user.displayName}</h2>
              <div className="flex items-center justify-center space-x-1 text-emerald-600 text-sm font-semibold">
                <CheckCircle2 className="w-4 h-4" />
                <span>Logged in with Google</span>
              </div>
              <p className="text-slate-500 text-xs mt-2">{user.email}</p>
            </div>
          ) : (
            <div className="space-y-1">
              <h2 className="text-xl font-bold text-slate-800">Staff Portal</h2>
              <p className="text-slate-500 text-sm">
                {isAnonymous ? 'You are using a guest session.' : 'Please sign in to sync your data across devices.'}
              </p>
            </div>
          )}
        </div>

        <div className="space-y-3">
          {(!user || isAnonymous) && (
            <button
              onClick={handleLogin}
              className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-slate-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all shadow-sm"
            >
              <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
              <span>{isAnonymous ? 'Link with Google' : 'Sign in with Google'}</span>
            </button>
          )}

          <button
            onClick={() => navigate('/')}
            className="w-full flex items-center justify-center space-x-2 bg-slate-100 text-slate-600 py-4 rounded-2xl font-bold hover:bg-slate-200 active:scale-[0.98] transition-all"
          >
            <span>Back to Dashboard</span>
          </button>

          {user && !isAnonymous && (
            <button
              onClick={handleLogout}
              className="w-full flex items-center justify-center space-x-2 text-rose-600 font-bold py-2 hover:bg-rose-50 rounded-xl transition-colors"
            >
              <LogOut className="w-4 h-4" />
              <span>Sign Out</span>
            </button>
          )}
        </div>

        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          {user ? `UID: ${user.uid.substring(0, 8)}...` : 'Authorized Personnel Only'}
        </p>
      </div>
    </div>
  );
}
