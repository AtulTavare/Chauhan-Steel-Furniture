import React, { useState, useEffect } from 'react';
import { Lock, ArrowRight, User } from 'lucide-react';
import { renderCanvas } from './ui/canvas';

interface LoginProps {
  onLogin: () => void;
}

export const Login: React.FC<LoginProps> = ({ onLogin }) => {
  const [id, setId] = useState('');
  const [pass, setPass] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    renderCanvas();
    
    // Optional: Cleanup to stop animation if component unmounts
    return () => {
    };
  }, []);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');

    // Simulate network delay for effect
    setTimeout(() => {
      if (id.toLowerCase() === 'owner' && pass === 'chauhan123') {
        localStorage.setItem('chauhan_auth', 'true');
        onLogin();
      } else {
        setError('Invalid ID or Password');
        setIsLoading(false);
      }
    }, 800);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-slate-50 p-4 relative overflow-hidden">
      
      {/* Canvas Background */}
      <canvas
        className="absolute inset-0 w-full h-full pointer-events-none z-0"
        id="canvas"
      ></canvas>

      {/* Login Card */}
      <div className="bg-white/80 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/60 w-full max-w-md p-8 relative z-10 animate-scale-in">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-slate-800 leading-tight mb-2">
            Chauhan Steel<br />
            <span className="text-blue-600">Furniture</span>
          </h1>
          <p className="text-slate-500 text-sm font-medium">Inventory & Management System</p>
        </div>

        <form onSubmit={handleLogin} className="space-y-6">
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 text-sm p-3 rounded-lg flex items-center gap-2 animate-shake">
              <span className="font-bold">Error:</span> {error}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">User ID</label>
              <div className="relative group">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  autoFocus
                  type="text"
                  value={id}
                  onChange={(e) => setId(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 shadow-sm"
                  placeholder="Enter User ID"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-semibold text-slate-700 mb-2">Password</label>
              <div className="relative group">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-blue-500 transition-colors" size={20} />
                <input
                  type="password"
                  value={pass}
                  onChange={(e) => setPass(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 text-slate-900 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all placeholder-slate-400 shadow-sm"
                  placeholder="Enter Password"
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-4 bg-blue-600 text-white rounded-xl font-bold text-lg shadow-lg shadow-blue-200 hover:bg-blue-700 hover:shadow-blue-300 transition-all active:scale-95 flex items-center justify-center gap-2 group disabled:opacity-70 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <span className="inline-block w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
            ) : (
              <>
                Login to Dashboard <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
              </>
            )}
          </button>
        </form>

        <div className="mt-8 text-center">
          <p className="text-xs text-slate-400">
            Protected System. Authorized Personnel Only.<br/>
            © {new Date().getFullYear()} Chauhan Steel Furniture.
          </p>
        </div>
      </div>
    </div>
  );
};