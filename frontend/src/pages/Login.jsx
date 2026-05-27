import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Link as LinkIcon, Lock, Mail, ArrowRight, Eye, EyeOff } from 'lucide-react';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showPassword,setShowPassword] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!email || !password) return;

    try {
      setIsSubmitting(true);
      const success = await login(email.trim().toLowerCase(), password);
      if (success) {
        navigate('/dashboard');
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background flex flex-col justify-center py-12 sm:px-6 lg:px-8 relative overflow-hidden">
      {/* Decorative Gradient Glow Orbs */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 rounded-full bg-violet-600/5 blur-[120px] pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-96 h-96 rounded-full bg-sky-600/5 blur-[120px] pointer-events-none"></div>
      
      {/* Dynamic Grid Background Layer */}
      <div className="absolute inset-0 grid-glow-layer pointer-events-none opacity-40"></div>

      <div className="sm:mx-auto sm:w-full sm:max-w-md relative z-10">
        <Link to="/" className="flex items-center justify-center gap-2.5 group">
          <div className="p-2 rounded-xl bg-primary/10 border border-primary/20 group-hover:border-primary/40 transition-colors shadow-glow-primary duration-300">
            <LinkIcon className="h-6 w-6 text-primary group-hover:rotate-12 transition-transform duration-300" />
          </div>
          <span className="text-2xl font-extrabold tracking-tight text-text font-display">
            Snap<span className="text-primary font-light">Link</span>
          </span>
        </Link>
        <h2 className="mt-6 text-center text-3xl font-extrabold text-text font-display">
          Welcome back
        </h2>
        <p className="mt-2 text-center text-sm text-stone-400 font-medium">
          Or{' '}
          <Link to="/register" className="font-semibold text-primary hover:text-primary-hover transition-colors duration-200">
            create a free account
          </Link>
        </p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md relative z-10 px-4">
        <div className="glass-card py-8 px-4 sm:px-10 rounded-2xl">
          <form className="space-y-6" onSubmit={handleSubmit}>
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-stone-300 tracking-wide">
                Email Address
              </label>
              <div className="mt-1.5 relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-stone-500" />
                </div>
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="block w-full pl-11 pr-4 py-3 border rounded-xl glass-input text-text text-sm"
                  placeholder="name@domain.com"
                />
              </div>
            </div>

           {/* Password Field */}
<div>
  <label
    htmlFor="password"
    className="block text-sm font-semibold text-stone-300 tracking-wide"
  >
    Password
  </label>

  <div className="mt-1.5 relative rounded-md shadow-sm">

    <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
      <Lock className="h-5 w-5 text-stone-500" />
    </div>

    <input
      id="password"
      name="password"
      type={showPassword ? "text" : "password"}
      autoComplete="current-password"
      required
      value={password}
      onChange={(e) => setPassword(e.target.value)}
      className="block w-full pl-11 pr-14 py-3 border rounded-xl glass-input text-text text-sm"
      placeholder="••••••••"
    />

    <button
      type="button"
      onClick={() => setShowPassword(!showPassword)}
      className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-stone-400 hover:text-stone-200 transition-colors"
    >
      {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
    </button>

  </div>
  <div className="flex justify-end mt-2">
    <Link to="/forgot-password" className="text-xs font-semibold text-violet-400 hover:text-violet-300 transition-colors">
      Forgot password?
    </Link>
  </div>
</div>
            {/* Submit Button */}
            <div>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full flex justify-center items-center gap-2 py-3 px-4 border border-transparent rounded-xl text-sm font-bold text-white bg-violet-600 hover:bg-violet-500 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-violet-500 shadow-glow-primary transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed group"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-0.5 transition-transform" />
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
