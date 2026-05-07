import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    let isMounted = true;

    const checkSession = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      if (isMounted && user) {
        navigate('/', { replace: true });
      }
    };

    void checkSession();

    return () => {
      isMounted = false;
    };
  }, [navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage('');
    setIsSubmitting(true);

    const { error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setIsSubmitting(false);

    if (error) {
      setErrorMessage(error.message);
      return;
    }

    navigate('/', { replace: true });
  };

  return (
    <div className="min-h-[100dvh] bg-[#FDFCF8] flex flex-col items-center justify-center px-6">
      <motion.div
        className="flex flex-col items-center w-full max-w-[360px]"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] as [number, number, number, number] }}
      >
        {/* Logo */}
        <img src="/kumo-mascot.png" alt="KumoMint" className="w-24 h-24 mb-6 animate-float" />
        <h1 className="text-[28px] font-bold font-display text-[#2E2A28] mb-1">Welcome Back!</h1>
        <p className="text-[14px] text-[#2E2A2899] font-body mb-8">Sign in to continue trading</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <input
              type="email"
              placeholder="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full h-12 px-4 rounded-[14px] bg-white/60 border border-[rgba(165,214,200,0.3)] text-[15px] font-body text-[#2E2A28] placeholder:text-[#2E2A2866] focus:outline-none focus:border-[#A5D6C8] focus:shadow-[0_0_0_3px_rgba(165,214,200,0.2)] transition-all"
            />
          </div>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full h-12 px-4 pr-12 rounded-[14px] bg-white/60 border border-[rgba(165,214,200,0.3)] text-[15px] font-body text-[#2E2A28] placeholder:text-[#2E2A2866] focus:outline-none focus:border-[#A5D6C8] focus:shadow-[0_0_0_3px_rgba(165,214,200,0.2)] transition-all"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-[#2E2A2866]"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {errorMessage ? (
            <p className="text-[13px] text-[#EF9A9A] font-body text-center">
              {errorMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full km-btn-primary mt-2 disabled:opacity-60"
            disabled={isSubmitting || !email || !password}
          >
            {isSubmitting ? 'Signing In...' : 'Sign In'}
          </button>
        </form>

        <p className="mt-6 text-[13px] text-[#2E2A2899] font-body">
          Don't have an account?{' '}
          <button
            onClick={() => navigate('/register')}
            className="text-[#A5D6C8] font-semibold"
          >
            Sign Up
          </button>
        </p>
      </motion.div>
    </div>
  );
}
