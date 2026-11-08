import React, { useState, useEffect } from 'react';
import { useProjects } from '../context/ProjectContext';
import { loginRateLimiter, sanitizeText } from '../utils/security';
import {
  Layers,
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  ShieldCheck,
  CheckCircle2,
  Zap,
  AlertCircle,
  Timer
} from 'lucide-react';

export const LoginView: React.FC = () => {
  const { login, loginWithGoogle, register, isFirebaseConnected } = useProjects();
  const [isRegisterMode, setIsRegisterMode] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [forgotPasswordNotice, setForgotPasswordNotice] = useState(false);
  const [lockoutSeconds, setLockoutSeconds] = useState<number>(() => loginRateLimiter.getRemainingLockoutSeconds());

  // Countdown timer for lockout
  useEffect(() => {
    if (lockoutSeconds <= 0) return;

    const timer = setInterval(() => {
      setLockoutSeconds((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          loginRateLimiter.reset();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    // Rate Limit Check
    const remaining = loginRateLimiter.getRemainingLockoutSeconds();
    if (remaining > 0) {
      setLockoutSeconds(remaining);
      setErrorMessage(`Muitas tentativas incorretas. Aguarde ${remaining} segundos.`);
      return;
    }

    const cleanEmail = sanitizeText(email);
    const cleanPass = sanitizeText(password, 256);

    setIsLoading(true);

    try {
      if (isRegisterMode) {
        await register(cleanEmail, cleanPass);
      } else {
        await login(cleanEmail, cleanPass);
      }
      // Reset rate limiter on success
      loginRateLimiter.reset();
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : 'Erro ao processar login';
      
      // Record failed attempt
      const limitResult = loginRateLimiter.recordFailedAttempt();
      if (limitResult.isNowLocked) {
        setLockoutSeconds(limitResult.remainingSeconds);
        setErrorMessage(`Limite de 5 tentativas atingido. Bloqueado por ${limitResult.remainingSeconds} segundos por segurança.`);
      } else {
        // Format friendly Firebase errors
        if (msg.includes('user-not-found') || msg.includes('wrong-password') || msg.includes('invalid-credential')) {
          setErrorMessage(`E-mail ou senha incorretos. (Tentativa ${limitResult.attempts} de 5)`);
        } else if (msg.includes('too-many-requests')) {
          setLockoutSeconds(60);
          setErrorMessage('Muitas tentativas detectadas pelo Firebase. Aguarde 60 segundos.');
        } else if (msg.includes('email-already-in-use')) {
          setErrorMessage('Este e-mail já está cadastrado.');
        } else if (msg.includes('weak-password')) {
          setErrorMessage('A senha deve ter pelo menos 6 caracteres.');
        } else {
          setErrorMessage(msg);
        }
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleDemoLogin = async () => {
    if (lockoutSeconds > 0) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await login('demo@skillhub.io', 'demo123');
      loginRateLimiter.reset();
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleLogin = async () => {
    if (lockoutSeconds > 0) return;
    setErrorMessage(null);
    setIsLoading(true);
    try {
      await loginWithGoogle();
      loginRateLimiter.reset();
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#080613] bg-grid text-slate-100 flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden selection:bg-purple-500 selection:text-white">
      {/* Ambient background glows */}
      <div className="absolute top-1/4 left-1/4 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 right-1/4 translate-x-1/2 translate-y-1/2 w-96 h-96 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Main Login Card */}
      <div className="w-full max-w-md relative z-10 animate-fade-in">
        {/* Brand Header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center gap-3 mb-3">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-cyan-400 p-[1.5px] shadow-purple-glow">
              <div className="w-full h-full bg-[#110c2a] rounded-[14px] flex items-center justify-center">
                <Layers className="w-6 h-6 text-cyan-400" />
              </div>
            </div>
          </div>
          <div className="flex items-center justify-center gap-1.5 mb-1">
            <span className="font-display font-bold text-2xl text-white tracking-tight">
              Skill<span className="text-purple-400">Hub</span>
            </span>
            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-purple-500/20 text-purple-300 border border-purple-500/30">
              PRO
            </span>
          </div>
          <p className="text-xs sm:text-sm text-slate-400">
            Painel de gerenciamento de projetos & bio páginas
          </p>

          {/* Firebase Connection Pill */}
          <div className="mt-2.5 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-mono border">
            {isFirebaseConnected ? (
              <span className="text-emerald-400 bg-emerald-500/10 border-emerald-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                Firebase Conectado
              </span>
            ) : (
              <span className="text-amber-300 bg-amber-500/10 border-amber-500/20 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400" />
                Modo Demonstrativo (configure o .env)
              </span>
            )}
          </div>
        </div>

        {/* Card Body */}
        <div className="bg-[#130d2d]/90 backdrop-blur-xl border border-purple-500/20 rounded-3xl p-6 sm:p-8 shadow-2xl relative overflow-hidden">
          {/* Subtle top light bar */}
          <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-purple-500 via-cyan-400 to-indigo-500" />

          {/* Toggle between Entrar and Criar Conta */}
          <div className="flex items-center bg-[#191138] p-1 rounded-xl border border-purple-500/20 mb-6">
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(false);
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                !isRegisterMode
                  ? 'bg-purple-600 text-white shadow-purple-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Entrar
            </button>
            <button
              type="button"
              onClick={() => {
                setIsRegisterMode(true);
                setErrorMessage(null);
              }}
              className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all ${
                isRegisterMode
                  ? 'bg-purple-600 text-white shadow-purple-glow'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Criar Conta
            </button>
          </div>

          <div className="mb-4">
            <h2 className="text-lg font-bold text-white tracking-tight">
              {isRegisterMode ? 'Cadastre sua conta no SkillHub' : 'Acesse seu painel'}
            </h2>
            <p className="text-xs text-slate-400 mt-1">
              {isRegisterMode
                ? 'Comece a criar suas páginas de recursos para Instagram e TikTok.'
                : 'Gerencie seus prompts e ferramentas compartilhados nos vídeos.'}
            </p>
          </div>

          {/* Error notice */}
          {errorMessage && (
            <div className="mb-4 p-3 rounded-xl bg-red-500/10 border border-red-500/25 text-xs text-red-300 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-400" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* Rate Limit Lockout Banner */}
          {lockoutSeconds > 0 && (
            <div className="mb-4 p-3.5 rounded-xl bg-amber-500/15 border border-amber-500/35 text-amber-200 text-xs flex items-center gap-3 animate-pulse">
              <div className="w-8 h-8 rounded-lg bg-amber-500/20 border border-amber-500/30 flex items-center justify-center shrink-0">
                <Timer className="w-4 h-4 text-amber-300 animate-spin" style={{ animationDuration: '6s' }} />
              </div>
              <div className="flex-1">
                <div className="font-semibold text-amber-100 flex items-center gap-1.5">
                  <span>Proteção Anti-Brute-Force Ativada</span>
                </div>
                <div className="text-[11px] text-amber-300/90 mt-0.5">
                  Muitas tentativas malsucedidas. Aguarde <span className="font-mono font-bold text-white px-1.5 py-0.5 rounded bg-amber-950/60 border border-amber-500/40">{lockoutSeconds}s</span> para tentar novamente.
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email Field */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 mb-1.5 font-mono">
                E-mail
              </label>
              <div className="relative flex items-center">
                <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type="email"
                  value={email}
                  disabled={isLoading || lockoutSeconds > 0}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="seu@email.com"
                  required
                  className="w-full bg-[#191138] text-sm text-white placeholder-slate-500 pl-10 pr-4 py-2.5 rounded-xl border border-purple-500/20 focus:border-cyan-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label className="block text-xs font-semibold uppercase tracking-wider text-purple-300 font-mono">
                  Senha
                </label>
                {!isRegisterMode && (
                  <button
                    type="button"
                    onClick={() => setForgotPasswordNotice(true)}
                    className="text-xs text-purple-400 hover:text-cyan-300 transition-colors"
                  >
                    Esqueceu a senha?
                  </button>
                )}
              </div>
              <div className="relative flex items-center">
                <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 pointer-events-none" />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  disabled={isLoading || lockoutSeconds > 0}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder={isRegisterMode ? 'Mínimo 6 caracteres' : 'Sua senha'}
                  required
                  className="w-full bg-[#191138] text-sm text-white placeholder-slate-500 pl-10 pr-10 py-2.5 rounded-xl border border-purple-500/20 focus:border-cyan-400 focus:outline-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                />
                <button
                  type="button"
                  disabled={lockoutSeconds > 0}
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 text-slate-500 hover:text-slate-300 transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center justify-between pt-1">
              <label className="flex items-center gap-2 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  disabled={lockoutSeconds > 0}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="rounded border-purple-500/30 bg-[#191138] text-purple-600 focus:ring-purple-500/40"
                />
                <span className="text-xs text-slate-300">Lembrar deste dispositivo</span>
              </label>

              <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
                <ShieldCheck className="w-3.5 h-3.5" />
                SSL 256-bit
              </span>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full mt-2 py-3 px-4 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-purple-600 via-indigo-600 to-cyan-500 hover:opacity-95 shadow-purple-glow transition-all duration-200 flex items-center justify-center gap-2 active:scale-95 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : lockoutSeconds > 0 ? (
                <span className="flex items-center gap-1.5 font-mono text-amber-200">
                  <Timer className="w-4 h-4" />
                  Bloqueado por {lockoutSeconds}s
                </span>
              ) : (
                <>
                  <span>{isRegisterMode ? 'Criar Minha Conta' : 'Entrar no Painel'}</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Social login / fast buttons */}
          <div className="relative my-5 text-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-purple-500/15" />
            </div>
            <span className="relative bg-[#130d2d] px-3 text-[11px] uppercase font-mono tracking-wider text-slate-500">
              Ou acesse com
            </span>
          </div>

          <div className="space-y-2.5">
            {/* Google Sign In */}
            <button
              type="button"
              onClick={handleGoogleLogin}
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-slate-200 hover:text-white bg-[#1a123d] hover:bg-[#23194f] border border-purple-500/20 hover:border-purple-400/30 transition-all flex items-center justify-center gap-2.5 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="#34A853"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                />
                <path
                  fill="#EA4335"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                />
              </svg>
              <span>Continuar com Google</span>
            </button>

            {/* 1-Click Fast Demo Login */}
            <button
              type="button"
              onClick={handleDemoLogin}
              disabled={isLoading || lockoutSeconds > 0}
              className="w-full py-2.5 px-4 rounded-xl text-xs sm:text-sm font-medium text-slate-200 hover:text-white bg-[#1c1440] hover:bg-[#251b52] border border-purple-500/25 hover:border-cyan-400/40 transition-all flex items-center justify-center gap-2 group cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Zap className="w-4 h-4 text-cyan-400 group-hover:animate-bounce" />
              <span>Acessar com Perfil de Demonstração</span>
            </button>
          </div>

          {/* Forgot password simulated alert */}
          {forgotPasswordNotice && (
            <div className="mt-4 p-3 rounded-xl bg-purple-950/60 border border-purple-500/30 text-xs text-slate-300 animate-slide-up flex items-start justify-between gap-2">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-cyan-400 shrink-0 mt-0.5" />
                <span>
                  Para redefinir a senha no Firebase em produção, utilize o link de redefinição por e-mail ou faça login com o Google.
                </span>
              </div>
              <button
                type="button"
                onClick={() => setForgotPasswordNotice(false)}
                className="text-slate-400 hover:text-white text-xs font-bold"
              >
                ✕
              </button>
            </div>
          )}
        </div>

        {/* Footer info */}
        <div className="text-center mt-6 text-xs text-slate-500">
          <span>SkillHub • Plataforma de Entrega para Criadores</span>
        </div>
      </div>
    </div>
  );
};
