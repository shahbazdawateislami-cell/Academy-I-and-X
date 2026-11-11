import { signInWithPopup, GoogleAuthProvider } from 'firebase/auth';
import { auth } from '../firebase';
import { LogIn } from 'lucide-react';

export default function Login() {
  const handleLogin = async () => {
    const provider = new GoogleAuthProvider();
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('Login failed', error);
      alert('Login failed. Please try again.');
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
            <LogIn className="w-10 h-10 text-white" />
          </div>
          <h2 className="text-xl font-bold text-slate-800">Staff Portal</h2>
          <p className="text-slate-500 text-sm mt-1">Please sign in to access the management system</p>
        </div>

        <button
          onClick={handleLogin}
          className="w-full flex items-center justify-center space-x-3 bg-white border-2 border-slate-200 py-4 rounded-2xl font-bold text-slate-700 hover:bg-slate-50 hover:border-slate-300 active:scale-[0.98] transition-all shadow-sm"
        >
          <img src="https://www.google.com/favicon.ico" alt="Google" className="w-5 h-5" />
          <span>Sign in with Google</span>
        </button>

        <p className="text-[10px] text-slate-400 uppercase tracking-widest font-semibold">
          Authorized Personnel Only
        </p>
      </div>
    </div>
  );
}
