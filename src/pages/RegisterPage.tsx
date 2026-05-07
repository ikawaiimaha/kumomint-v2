import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/lib/supabase';

export default function RegisterPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [username, setUsername] = useState('');
  const [inviteCode, setInviteCode] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
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
    setSuccessMessage('');
    setIsSubmitting(true);

    const normalizedInviteCode = inviteCode.trim().toUpperCase();

    const { data: inviteRow, error: inviteError } = await supabase
      .from('invitation_codes')
      .select('id, code, status, max_uses, used_count, expires_at')
      .eq('code', normalizedInviteCode)
      .maybeSingle();

    if (inviteError) {
      setIsSubmitting(false);
      setErrorMessage(inviteError.message);
      return;
    }

    if (!inviteRow) {
      setIsSubmitting(false);
      setErrorMessage('Invite code not found.');
      return;
    }

    if (inviteRow.status === 'revoked' || inviteRow.status === 'expired') {
      setIsSubmitting(false);
      setErrorMessage('This invite code is no longer valid.');
      return;
    }

    if (inviteRow.expires_at && new Date(inviteRow.expires_at) < new Date()) {
      setIsSubmitting(false);
      setErrorMessage('This invite code has expired.');
      return;
    }

    if (inviteRow.used_count >= inviteRow.max_uses) {
      setIsSubmitting(false);
      setErrorMessage('This invite code has already been fully used.');
      return;
    }

    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          display_name: username,
          invite_code: normalizedInviteCode,
        },
      },
    });

    if (error) {
      setIsSubmitting(false);
      setErrorMessage(error.message);
      return;
    }

    const nextUsedCount = inviteRow.used_count + 1;
    await supabase
      .from('invitation_codes')
      .update({
        used_count: nextUsedCount,
        status: nextUsedCount >= inviteRow.max_uses ? 'used' : inviteRow.status,
        used_by: data.user?.id ?? null,
        used_at: new Date().toISOString(),
      })
      .eq('id', inviteRow.id);

    setIsSubmitting(false);

    if (data.session) {
      navigate('/', { replace: true });
      return;
    }

    setSuccessMessage('Account created. Check your email if confirmation is enabled.');
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
        <img src="/kumo-waving.png" alt="KumoMint" className="w-24 h-24 mb-6 animate-float" />
        <h1 className="text-[28px] font-bold font-display text-[#2E2A28] mb-1">Join KumoMint!</h1>
        <p className="text-[14px] text-[#2E2A2899] font-body mb-8">Create your trading account</p>

        {/* Form */}
        <form onSubmit={handleSubmit} className="w-full space-y-4">
          <div>
            <input
              type="text"
              placeholder="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full h-12 px-4 rounded-[14px] bg-white/60 border border-[rgba(165,214,200,0.3)] text-[15px] font-body text-[#2E2A28] placeholder:text-[#2E2A2866] focus:outline-none focus:border-[#A5D6C8] focus:shadow-[0_0_0_3px_rgba(165,214,200,0.2)] transition-all"
            />
          </div>
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
          <div>
            <input
              type="text"
              placeholder="Invite Code"
              value={inviteCode}
              onChange={(e) => setInviteCode(e.target.value.toUpperCase())}
              maxLength={32}
              className="w-full h-12 px-4 rounded-[14px] bg-white/60 border border-[rgba(165,214,200,0.3)] text-[15px] font-body text-[#2E2A28] placeholder:text-[#2E2A2866] focus:outline-none focus:border-[#A5D6C8] focus:shadow-[0_0_0_3px_rgba(165,214,200,0.2)] transition-all tracking-[0.15em] uppercase text-center"
            />
          </div>

          {errorMessage ? (
            <p className="text-[13px] text-[#EF9A9A] font-body text-center">
              {errorMessage}
            </p>
          ) : null}

          {successMessage ? (
            <p className="text-[13px] text-[#81C784] font-body text-center">
              {successMessage}
            </p>
          ) : null}

          <button
            type="submit"
            className="w-full km-btn-primary mt-2 disabled:opacity-60"
            disabled={isSubmitting || !username || !email || !password || !inviteCode}
          >
            {isSubmitting ? 'Creating Account...' : 'Create Account'}
          </button>
        </form>

        <p className="mt-6 text-[13px] text-[#2E2A2899] font-body">
          Already have an account?{' '}
          <button
            onClick={() => navigate('/login')}
            className="text-[#A5D6C8] font-semibold"
          >
            Sign In
          </button>
        </p>
      </motion.div>
    </div>
  );
}
