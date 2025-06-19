'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Shield, Zap, Users, TrendingUp, Car, MapPin, Mail, ArrowRight, Check } from 'lucide-react';

export default function Home() {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email.trim()) {
      console.log('Email submitted:', email);
      setIsSubmitted(true);
      setEmail('');
      // Reset after 3 seconds
      setTimeout(() => setIsSubmitted(false), 3000);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-black via-gray-900 to-black">
      {/* Header */}
      <header className="fixed top-0 w-full z-50 bg-black/20 backdrop-blur-md border-b border-white/10">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <h1 className="text-2xl font-bold text-white">AutoVad</h1>
            <div className="text-gray-300 text-sm">
              Marketplace de Mașini
            </div>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="pt-32 pb-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="mb-12">
            <h1 className="text-4xl md:text-6xl font-bold text-white mb-6 leading-tight">
              Viitorul marketplace-ului
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-400 to-orange-600"> de mașini</span>
            </h1>
            <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
              O experiență complet nouă pentru cumpărarea și vânzarea mașinilor. 
              Mai rapid, mai sigur, mai inteligent.
            </p>
          </div>

          {/* Email Collection */}
          <div className="max-w-md mx-auto mb-12">
            {!isSubmitted ? (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="text-left">
                  <label className="block text-white font-medium mb-2">
                    Fii primul care află când lansăm
                  </label>
                  <div className="flex gap-3">
                    <Input
                      type="email"
                      placeholder="Adresa ta de email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-orange-500"
                      required
                    />
                    <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white px-6">
                      <Mail className="w-4 h-4 mr-2" />
                      Notifică-mă
                    </Button>
                  </div>
                </div>
              </form>
            ) : (
              <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-green-400">
                <div className="flex items-center justify-center gap-2">
                  <Check className="w-5 h-5" />
                  <span>Mulțumim! Te vom notifica când lansăm.</span>
                </div>
              </div>
            )}
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">10,000+</div>
              <div className="text-gray-400 text-sm">Mașini disponibile</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">50,000+</div>
              <div className="text-gray-400 text-sm">Utilizatori activi</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-500 mb-1">98%</div>
              <div className="text-gray-400 text-sm">Satisfacție</div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 px-4 bg-black/30">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              De ce să aștepți AutoVad?
            </h2>
            <p className="text-gray-300">
              Funcționalități revoluționare care schimbă complet experiența
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Shield className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Verificare Garantată</h3>
              <p className="text-gray-300 text-sm">
                Fiecare mașină este verificată de experții noștri. Nu mai ai griji de tepe sau probleme ascunse.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Zap className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Proces Ultra-Rapid</h3>
              <p className="text-gray-300 text-sm">
                Găsește mașina perfectă în câteva minute cu AI-ul nostru inteligent de căutare și filtrare.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Users className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Comunitate Verificată</h3>
              <p className="text-gray-300 text-sm">
                Toți utilizatorii sunt verificați. Conectează-te cu încredere cu vânzători și cumpărători reali.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <TrendingUp className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Prețuri Corecte</h3>
              <p className="text-gray-300 text-sm">
                Analiză automată a pieței în timp real. Știi că plătești prețul corect pentru mașina ta.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <Car className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Galerie Foto HD</h3>
              <p className="text-gray-300 text-sm">
                Vezi fiecare detaliu cu galeria foto de înaltă calitate și vizualizare 360°.
              </p>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-xl p-6 border border-white/10">
              <div className="w-12 h-12 bg-orange-500/20 rounded-lg flex items-center justify-center mb-4">
                <MapPin className="w-6 h-6 text-orange-500" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-3">Locație Precisă</h3>
              <p className="text-gray-300 text-sm">
                Găsește mașini aproape de tine cu sistemul nostru de geolocație și notificări inteligente.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* New Features Section */}
      <section className="py-16 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">
              Funcționalități Noi
            </h2>
            <p className="text-gray-300">
              Ce face AutoVad diferit de toate platformele existente
            </p>
          </div>

          <div className="space-y-8">
            <div className="flex items-start gap-6">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">1</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">AI Chat cu Vânzătorul</h3>
                <p className="text-gray-300 text-sm">
                  Comunică direct cu vânzătorul prin chat-ul nostru inteligent. Întreabă orice și primești răspunsuri instant.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">2</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Verificare Istoric Complet</h3>
                <p className="text-gray-300 text-sm">
                  Accesează istoricul complet al mașinii: accidente, întreținere, proprietari anteriori - totul transparent.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">3</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Plăți Securizate</h3>
                <p className="text-gray-300 text-sm">
                  Plătește cu încredere prin sistemul nostru securizat. Banii sunt eliberați doar după verificarea mașinii.
                </p>
              </div>
            </div>

            <div className="flex items-start gap-6">
              <div className="w-8 h-8 bg-orange-500 rounded-full flex items-center justify-center flex-shrink-0 mt-1">
                <span className="text-white font-bold text-sm">4</span>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-white mb-2">Asigurări Integrate</h3>
                <p className="text-gray-300 text-sm">
                  Încheie asigurarea direct din platformă. Oferte personalizate de la partenerii noștri de încredere.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 px-4 bg-black/30">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Fii primul care testează
          </h2>
          <p className="text-gray-300 mb-8">
            Lansăm în curând. Înscrie-te pentru acces prioritar și beneficii exclusive.
          </p>
          
          {!isSubmitted ? (
            <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <Input
                type="email"
                placeholder="Adresa ta de email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="flex-1 bg-white/10 border-white/20 text-white placeholder-gray-400 focus:border-orange-500"
                required
              />
              <Button type="submit" className="bg-orange-500 hover:bg-orange-600 text-white">
                <ArrowRight className="w-4 h-4 mr-2" />
                Înscrie-te
              </Button>
            </form>
          ) : (
            <div className="bg-green-500/20 border border-green-500/30 rounded-lg p-4 text-green-400 max-w-md mx-auto">
              <div className="flex items-center justify-center gap-2">
                <Check className="w-5 h-5" />
                <span>Te-ai înscris cu succes!</span>
              </div>
            </div>
          )}
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 px-4 border-t border-white/10">
        <div className="max-w-4xl mx-auto text-center">
          <div className="flex justify-center items-center gap-8 mb-4">
            <span className="text-gray-400 text-sm">© 2024 AutoVad</span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-400 text-sm">Termeni și condiții</span>
            <span className="text-gray-400 text-sm">•</span>
            <span className="text-gray-400 text-sm">Confidențialitate</span>
          </div>
          <p className="text-gray-500 text-sm">
            Marketplace-ul modern pentru mașini în România
          </p>
        </div>
      </footer>

      {/* Hidden Link to Actual Site */}
      <div className="fixed bottom-4 right-4 opacity-0 hover:opacity-100 transition-opacity duration-300">
        <a 
          href="/test" 
          className="bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg text-sm font-medium shadow-lg"
        >
          Site Actual
        </a>
      </div>
    </div>
  );
}
