'use client';

import { useEffect, useState } from 'react';
import { Car } from '@/types/car';
import { carService } from '@/services/carService';
import { CarPost } from '@/components/CarPost';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, RefreshCw, Filter, User, LogIn, Star, Shield, Zap, Home as HomeIcon, Heart, Settings, Gauge, Fuel, MapPin, Share, ArrowLeft, Tag } from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';
import { CarFilters } from '@/components/CarFilters';
import { useAuth } from '@/hooks/useAuth';
import { AuthForm } from '@/components/AuthForm';

export default function TestPage() {
  const [cars, setCars] = useState<Car[]>([]);
  const [filteredCars, setFilteredCars] = useState<Car[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [showAuthForm, setShowAuthForm] = useState(false);
  const { user, loading: authLoading, signOut, signInWithGoogle } = useAuth();

  const formatMileage = (mileage: number) => {
    return new Intl.NumberFormat('ro-RO').format(mileage) + ' km';
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('ro-RO', {
      style: 'currency',
      currency: 'RON',
      minimumFractionDigits: 0,
    }).format(price);
  };

  useEffect(() => {
    loadCars();
  }, []);

  const loadCars = async () => {
    try {
      setLoading(true);
      const result = await carService.getCars();
      setCars(result.data);
      setFilteredCars(result.data);
    } catch (error) {
      console.error('Error loading cars:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    try {
      await loadCars();
    } finally {
      setRefreshing(false);
    }
  };

  const handleSearch = async (query: string) => {
    setSearchQuery(query);
    if (query.trim()) {
      try {
        setLoading(true);
        const result = await carService.searchCars(query);
        setCars(result.data);
        setFilteredCars(result.data);
      } catch (error) {
        console.error('Error searching cars:', error);
      } finally {
        setLoading(false);
      }
    } else {
      loadCars();
    }
  };

  const handleLike = (carId: string) => {
    console.log('Like car:', carId);
  };

  const handleComment = (carId: string) => {
    console.log('Comment on car:', carId);
  };

  const handleShare = (carId: string) => {
    console.log('Share car:', carId);
  };

  const handleFiltersChange = (filtered: Car[]) => {
    setFilteredCars(filtered);
  };

  if (loading || authLoading) {
    return (
      <div className="min-h-screen bg-black">
        {/* Header */}
        <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
          <div className=" mx-auto px-6 py-3 max-w-[1640px]">
            <div className="flex items-center justify-between gap-8">
              <div className="flex items-center gap-4">
                <Link href="/" className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                  <ArrowLeft className="h-5 w-5" />
                </Link>
                <div className="flex-shrink-0">
                  <h1 className="text-2xl font-bold text-white tracking-tight">AutoVad</h1>
                  <p className="text-gray-400 text-sm">Marketplace de Mașini</p>
                </div>
              </div>
              
              {/* Search and Filters */}
              <div className="flex-1 flex gap-3 max-w-2xl">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                  <Input
                    type="text"
                    placeholder="Caută după marcă sau model..."
                    value={searchQuery}
                    onChange={(e) => handleSearch(e.target.value)}
                    className="pl-10 bg-gray-900/50 border-gray-800 text-white placeholder-gray-500 focus:border-orange-500 w-full"
                  />
                </div>
                <Button 
                  variant="outline" 
                  className="border-gray-800 bg-gray-900/50 text-gray-300 hover:border-orange-500 hover:text-orange-500 px-4"
                >
                  <Filter className="w-4 h-4 mr-2" />
                  Filtre
                </Button>
              </div>

              <button
                onClick={handleRefresh}
                disabled={refreshing}
                className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
              >
                <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
            </div>
          </div>
        </header>

        {/* Main Content - Fixed Layout */}
        <div className="max-w-[1640px] flex h-[calc(100vh-76px)] mx-auto">
          
          {/* Left Sidebar - Filters */}
          <div className="w-80 bg-black/50 border-r border-gray-800 p-6 flex-shrink-0">
            <CarFilters 
              cars={cars} 
              onFiltersChange={handleFiltersChange}
              className="sticky top-6"
            />
          </div>

          {/* Center Feed - Loading State */}
          <div className="flex-1 flex justify-center items-center overflow-y-auto bg-black/30 px-4">
            <div className="text-center">
              <RefreshCw className="animate-spin h-12 w-12 text-orange-500 mx-auto mb-4" />
              <p className="text-gray-400">Se încarcă...</p>
            </div>
          </div>

          {/* Right Sidebar - Fixed */}
          <div className="w-72 bg-black/50 border-l border-gray-800 p-6 flex-shrink-0">
            <h2 className="text-xl font-bold text-white mb-6">Profil</h2>
            <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
              <div className="text-center mb-6">
                <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                  <LogIn className="w-8 h-8 text-white" />
                </div>
                <h3 className="text-base font-semibold text-white mb-2">Conectează-te</h3>
                <p className="text-gray-400 text-sm">
                  Pentru a-ți debloca toate funcționalitățile
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-black/95 backdrop-blur-sm border-b border-gray-800">
        <div className=" mx-auto px-6 py-3 max-w-[1640px]">
          <div className="flex items-center justify-between gap-8">
            <div className="flex items-center gap-4">
              <Link href="/" className="p-2 text-gray-400 hover:text-orange-500 transition-colors">
                <ArrowLeft className="h-5 w-5" />
              </Link>
              <div className="flex-shrink-0">
                <h1 className="text-2xl font-bold text-white tracking-tight">AutoVad</h1>
                <p className="text-gray-400 text-sm">Marketplace de Mașini</p>
              </div>
            </div>
            
            {/* Search and Filters */}
            <div className="flex-1 flex gap-3 max-w-2xl">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                <Input
                  type="text"
                  placeholder="Caută după marcă sau model..."
                  value={searchQuery}
                  onChange={(e) => handleSearch(e.target.value)}
                  className="pl-10 bg-gray-900/50 border-gray-800 text-white placeholder-gray-500 focus:border-orange-500 w-full"
                />
              </div>
              <Button 
                variant="outline" 
                className="border-gray-800 bg-gray-900/50 text-gray-300 hover:border-orange-500 hover:text-orange-500 px-4"
              >
                <Filter className="w-4 h-4 mr-2" />
                Filtre
              </Button>
            </div>

            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="p-2 text-gray-400 hover:text-orange-500 transition-colors"
            >
              <RefreshCw className={`h-5 w-5 ${refreshing ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>
      </header>

      {/* Main Content - Fixed Layout */}
      <div className="max-w-[1640px] flex h-[calc(100vh-76px)] mx-auto">
        
        {/* Left Sidebar - Filters */}
        {!showAuthForm && (
          <div className="w-80 bg-black/50 border-r border-gray-800 p-6 flex-shrink-0">
            <CarFilters 
              cars={cars} 
              onFiltersChange={handleFiltersChange}
              className="sticky top-6"
            />
          </div>
        )}

        {/* Center Feed - Scrollable 9:16 */}
        <div className={`flex-1 flex justify-center overflow-y-auto bg-black/30 px-4 ${showAuthForm ? 'max-w-none' : ''}`}>
          {showAuthForm ? (
            // Auth Form in center
            <div className="w-full max-w-4xl py-6 flex items-center justify-center">
              <AuthForm />
            </div>
          ) : (
            // Normal car feed
            <div className="w-full max-w-[1200px] py-6">
              {filteredCars.length === 0 ? (
                <div className="text-center py-8 px-4 bg-gray-900/50 rounded-lg border border-gray-800">
                  <p className="text-gray-400">
                    {searchQuery ? 'Nu s-au găsit mașini pentru căutarea ta.' : 'Nu există mașini disponibile momentan.'}
                  </p>
                </div>
              ) : (
                <div className="space-y-6">
                  {filteredCars.map((car) => (
                    <div key={car.id} className="flex gap-6">
                      <div className="w-[360px] flex-shrink-0">
                        <div className="aspect-[9/16] bg-gray-900/80 rounded-xl overflow-hidden border border-gray-800 shadow-lg">
                          <CarPost
                            car={car}
                            onLike={handleLike}
                            onComment={handleComment}
                            onShare={handleShare}
                            displayMode="compact"
                          />
                        </div>
                      </div>
                      
                      {/* Desktop Content */}
                      <div className="flex-1 hidden lg:block">
                        <div className="bg-gray-900/50 rounded-xl border border-gray-800 p-6">
                          {/* Header with Title and Main Specs */}
                          <div className="mb-8">
                            <div className="flex items-center justify-between mb-6">
                              <h2 className="text-2xl font-bold text-white">{car.make} {car.model}</h2>
                              <div className="flex items-center gap-3">
                                <button onClick={() => handleLike(car.id)} className="p-2 rounded-full bg-gray-800/80 hover:bg-orange-500/10 text-white hover:text-orange-500 transition-all">
                                  <Heart className="w-5 h-5" />
                                </button>
                                <button onClick={() => handleShare(car.id)} className="p-2 rounded-full bg-gray-800/80 hover:bg-orange-500/10 text-white hover:text-orange-500 transition-all">
                                  <Share className="w-5 h-5" />
                                </button>
                              </div>
                            </div>

                            {/* Price and Year - Prominent Display */}
                            <div className="flex items-center gap-4 mb-6">
                              <div className="flex-1 bg-gray-800/50 px-4 py-3 rounded-xl text-white">
                                <div className="text-sm mb-1 text-orange-200">Preț</div>
                                <div className="text-xl font-bold">{formatPrice(car.price)}</div>
                              </div>
                              <div className="flex-1 bg-gray-800/50 px-4 py-3 rounded-xl text-white">
                                <div className="text-sm mb-1 text-gray-400">An fabricație</div>
                                <div className="text-xl font-bold">{car.year}</div>
                              </div>
                            </div>

                            {/* Key Specs Grid */}
                            <div className="grid grid-cols-3 gap-4">
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                  <Gauge className="w-4 h-4" />
                                  <span className="text-sm">Kilometraj</span>
                                </div>
                                <div className="text-white font-medium">{formatMileage(car.mileage)}</div>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                  <Fuel className="w-4 h-4" />
                                  <span className="text-sm">Combustibil</span>
                                </div>
                                <div className="text-white font-medium">{car.fuel_type}</div>
                              </div>
                              <div className="bg-gray-800/50 rounded-lg p-3">
                                <div className="flex items-center gap-2 text-gray-400 mb-1">
                                  <MapPin className="w-4 h-4" />
                                  <span className="text-sm">Locație</span>
                                </div>
                                <div className="text-white font-medium">{car.location}</div>
                              </div>
                            </div>
                          </div>

                          {/* Description Section */}
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                              <span className="text-sm text-gray-700 uppercase tracking-wider">Descriere</span>
                              <div className="h-px flex-1 bg-gray-800"></div>
                            </h3>
                            <p className="text-gray-300 leading-relaxed">{car.description}</p>
                          </div>

                          {/* Photos Grid */}
                          <div className="mb-8">
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                              <span className="text-sm text-gray-700 uppercase tracking-wider">Galerie Foto</span>
                              <div className="h-px flex-1 bg-gray-800"></div>
                            </h3>
                            <div className="grid grid-cols-4 gap-3">
                              {car.images.map((image, index) => (
                                <button 
                                  key={index}
                                  className="relative group aspect-video bg-gray-800 rounded-lg overflow-hidden hover:ring-2 hover:ring-orange-500 transition-all"
                                >
                                  <Image 
                                    src={image} 
                                    alt={`${car.make} ${car.model} - Poza ${index + 1}`}
                                    className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-300"
                                    width={400}
                                    height={225}
                                  />
                                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity" />
                                </button>
                              ))}
                            </div>
                          </div>

                          {/* Seller Section */}
                          <div>
                            <h3 className="text-lg font-semibold text-white mb-3 flex items-center gap-2">
                              <span className="text-sm text-gray-700 uppercase tracking-wider">Vânzător</span>
                              <div className="h-px flex-1 bg-gray-800"></div>
                            </h3>
                            <div className="flex items-center  rounded-xl gap-4">
                              <div className="w-16 h-16 rounded-full flex items-center justify-center ring-2 ring-orange-500/20">
                                <User className="w-8 h-8 text-gray-400" />
                              </div>
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-white font-medium">Autovad Demo</span>
                                  <div className="bg-orange-500/10 p-1 rounded-full">
                                    <Shield className="w-4 h-4 text-orange-500" />
                                  </div>
                                </div>
                                <div className="flex items-center gap-4 text-sm">
                                  <div className="text-orange-500">⭐ 5.0</div>
                                  <div className="w-1 h-1 bg-gray-700 rounded-full"></div>
                                  <div className="text-gray-400">Membru din 2023</div>
                                </div>
                              </div>
                              <button className="px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors">
                                Contactează
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Sidebar - Fixed */}
        {!showAuthForm && (
          <div className="w-72 bg-black/50 border-l border-gray-800 p-6 flex-shrink-0">
            
            {user ? (
              <>
                {/* Navigation Menu */}
                <div className="mb-8">
                  <h2 className="text-xl font-bold text-white mb-6">Meniu</h2>
                  <nav className="space-y-2">
                    <Button variant="ghost" className="w-full justify-start text-white hover:bg-gray-800/50 font-medium">
                      <HomeIcon className="w-4 h-4 mr-3" />
                      Feed
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800/50 hover:text-white">
                      <Heart className="w-4 h-4 mr-3" />
                      Favorite
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800/50 hover:text-white">
                      <User className="w-4 h-4 mr-3" />
                      Profilul meu
                    </Button>
                    <Button variant="ghost" className="w-full justify-start text-gray-400 hover:bg-gray-800/50 hover:text-white">
                      <Settings className="w-4 h-4 mr-3" />
                      Setări
                    </Button>
                    <Button 
                      onClick={signOut}
                      variant="ghost" 
                      className="w-full justify-start text-red-500 hover:bg-red-500/10 hover:text-red-500"
                    >
                      <LogIn className="w-4 h-4 mr-3" />
                      Deconectare
                    </Button>
                  </nav>
                </div>

                {/* User Profile */}
                <div>
                  <h2 className="text-xl font-bold text-white mb-6">Profil</h2>
                  <div className="bg-gray-900/50 rounded-xl p-4 border border-gray-800">
                    <div className="flex items-center gap-4 mb-6">
                      <div className="w-14 h-14 bg-orange-500 rounded-full flex items-center justify-center">
                        <User className="w-7 h-7 text-white" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">{user.email}</h3>
                      </div>
                    </div>
                    
                    <div className="space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Anunțuri</span>
                        <span className="text-white font-semibold text-sm">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Vândute</span>
                        <span className="text-white font-semibold text-sm">0</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-gray-300 text-sm">Rating</span>
                        <span className="text-white font-semibold text-sm">⭐ 5.0</span>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            ) : (
              // Login Box with 3 buttons
              <>
                <h2 className="text-xl font-bold text-white mb-6">Profil</h2>
                <div className="bg-gray-900/50 rounded-xl p-6 border border-gray-800">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-orange-500 rounded-full flex items-center justify-center mx-auto mb-4">
                      <LogIn className="w-8 h-8 text-white" />
                    </div>
                    <h3 className="text-base font-semibold text-white mb-2">Conectează-te</h3>
                    <p className="text-gray-400 text-sm">
                      Pentru a-ți debloca toate funcționalitățile
                    </p>
                  </div>

                  <div className="space-y-3 mb-6">
                    <Button 
                      onClick={() => setShowAuthForm(true)}
                      className="w-full bg-orange-500 hover:bg-orange-600 text-white py-3 rounded-lg font-medium"
                    >
                      <LogIn className="w-4 h-4 mr-2" />
                      Conectare
                    </Button>
                    
                    <Button 
                      onClick={() => setShowAuthForm(true)}
                      variant="outline"
                      className="w-full border-orange-500 text-orange-500 hover:bg-orange-500 hover:text-white py-3 rounded-lg font-medium"
                    >
                      <User className="w-4 h-4 mr-2" />
                      Autentificare
                    </Button>
                    
                    <Button 
                      onClick={signInWithGoogle}
                      variant="outline"
                      className="w-full border-gray-600 text-gray-300 hover:border-orange-500 hover:text-orange-500 py-3 rounded-lg font-medium"
                    >
                      <svg className="w-4 h-4 mr-2" viewBox="0 0 48 48">
                        <path fill="#FFC107" d="M43.611,20.083H42V20H24v8h11.303c-1.649,4.657-6.08,8-11.303,8c-6.627,0-12-5.373-12-12s5.373-12,12-12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C12.955,4,4,12.955,4,24s8.955,20,20,20s20-8.955,20-20C44,22.659,43.862,21.35,43.611,20.083z"></path><path fill="#FF3D00" d="M6.306,14.691l6.571,4.819C14.655,15.108,18.961,12,24,12c3.059,0,5.842,1.154,7.961,3.039l5.657-5.657C34.046,6.053,29.268,4,24,4C16.318,4,9.656,8.337,6.306,14.691z"></path><path fill="#4CAF50" d="M24,44c5.166,0,9.86-1.977,13.409-5.192l-6.19-5.238C29.211,35.091,26.715,36,24,36c-5.202,0-9.619-3.317-11.283-7.946l-6.522,5.025C9.505,39.556,16.227,44,24,44z"></path><path fill="#1976D2" d="M43.611,20.083H42V20H24v8h11.303c-0.792,2.237-2.231,4.166-4.087,5.571l6.19,5.238C41.38,36.401,44,30.63,44,24C44,22.659,43.862,21.35,43.611,20.083z"></path>
                      </svg>
                      Conectare cu Google
                    </Button>
                  </div>
                  
                  {/* Benefits */}
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-white mb-3">Beneficii:</h4>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Heart className="w-4 h-4 text-orange-500" />
                      <span>Salvează favorite</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Tag className="w-4 h-4 text-orange-500" />
                      <span>Vinde propria mașină</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Shield className="w-4 h-4 text-orange-500" />
                      <span>Profil verificat</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Star className="w-4 h-4 text-orange-500" />
                      <span>Rating și recenzii</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-300">
                      <Zap className="w-4 h-4 text-orange-500" />
                      <span>Anunțuri prioritare</span>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 