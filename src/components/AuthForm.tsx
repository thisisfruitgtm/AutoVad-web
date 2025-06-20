'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/hooks/useAuth';
import { Heart, Tag, Shield, Star, Zap, Mail, User as UserIcon, Lock } from 'lucide-react';

export function AuthForm() {
  const [mode, setMode] = useState<'login' | 'register'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const { signIn, signUp, signInWithGoogle } = useAuth();

  const handleAuthAction = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      if (mode === 'login') {
        const { error } = await signIn(email, password);
        if (error) throw error;
      } else {
        const { error } = await signUp(email, password, name);
        if (error) throw error;
      }
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'A apărut o eroare';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };
  
  const benefits = [
    { icon: Heart, text: 'Salvează anunțurile favorite' },
    { icon: Tag, text: 'Vinde-ți mașina rapid și ușor' },
    { icon: Shield, text: 'Tranzacții sigure cu utilizatori verificați' },
    { icon: Star, text: 'Oferă și primește rating-uri' },
    { icon: Zap, text: 'Promovează-ți anunțurile pentru vizibilitate maximă' },
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden flex my-auto">
      {/* Left side - Benefits */}
      <div className="w-1/2 bg-gradient-to-br from-orange-500/10 via-black to-black p-8 hidden md:flex flex-col justify-center">
        <h2 className="text-3xl font-bold text-white mb-6">Bun venit la AutoVad!</h2>
        <p className="text-gray-300 mb-8">Platforma unde găsești mașina visurilor tale. Conectează-te pentru a beneficia de toate avantajele.</p>
        <div className="space-y-4">
          {benefits.map((benefit, index) => (
            <div key={index} className="flex items-center gap-4">
              <div className="p-2 bg-white/10 rounded-lg">
                <benefit.icon className="w-5 h-5 text-orange-400" />
              </div>
              <span className="text-gray-200">{benefit.text}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Right side - Form */}
      <div className="w-full md:w-1/2 p-8 flex flex-col justify-center">
        <div className="flex mb-6">
          <button onClick={() => setMode('login')} className={`flex-1 pb-2 text-center font-semibold transition-all ${mode === 'login' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}>
            Autentificare
          </button>
          <button onClick={() => setMode('register')} className={`flex-1 pb-2 text-center font-semibold transition-all ${mode === 'register' ? 'text-orange-500 border-b-2 border-orange-500' : 'text-gray-400'}`}>
            Înregistrare
          </button>
        </div>

        <form onSubmit={handleAuthAction}>
          {mode === 'register' && (
            <div className="mb-4">
              <label className="block text-gray-300 mb-2 text-sm" htmlFor="name">Nume</label>
              <div className="relative">
                <UserIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <Input id="name" type="text" placeholder="Numele tău" value={name} onChange={e => setName(e.target.value)} required className="pl-10 bg-gray-800 border-gray-700" />
              </div>
            </div>
          )}
          <div className="mb-4">
            <label className="block text-gray-300 mb-2 text-sm" htmlFor="email">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input id="email" type="email" placeholder="email@exemplu.com" value={email} onChange={e => setEmail(e.target.value)} required className="pl-10 bg-gray-800 border-gray-700" />
            </div>
          </div>
          <div className="mb-6">
            <label className="block text-gray-300 mb-2 text-sm" htmlFor="password">Parolă</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <Input id="password" type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required className="pl-10 bg-gray-800 border-gray-700" />
            </div>
          </div>
          
          {error && <p className="text-red-500 text-sm mb-4 text-center">{error}</p>}

          <Button type="submit" className="w-full bg-orange-500 hover:bg-orange-600 mb-4" disabled={loading}>
            {loading ? 'Se încarcă...' : (mode === 'login' ? 'Autentificare' : 'Creează cont')}
          </Button>
        </form>

        <div className="flex items-center my-4">
          <div className="flex-grow border-t border-gray-700"></div>
          <span className="mx-4 text-gray-500 text-sm">SAU</span>
          <div className="flex-grow border-t border-gray-700"></div>
        </div>

        <Button onClick={() => signInWithGoogle()} variant="outline" className="w-full bg-gray-800 border-gray-700 hover:bg-gray-700 flex items-center gap-2" disabled={loading}>
          <svg className="w-5 h-5" viewBox="0 0 48 48">
            <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,36.401,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
          </svg>
          Continuă cu Google
        </Button>
      </div>
    </div>
  );
} 