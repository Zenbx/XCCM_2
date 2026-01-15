"use client";

import React, { useState, useEffect } from 'react';
import { ArrowLeft, ArrowRight, Eye, EyeOff, Check, User, Mail, Briefcase, Building2, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import toast from 'react-hot-toast';

const RegisterPage = () => {
  const [currentStep, setCurrentStep] = useState(1);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [mounted, setMounted] = useState(false);

  const router = useRouter();
  const { register } = useAuth();
  // ...
  const handleSubmit = async () => {
    if (!validateStep2()) return;

    setIsLoading(true);

    try {
      // Préparer les données pour l'API
      const registerData = {
        lastname: formData.lastname,
        firstname: formData.firstname,
        email: formData.email,
        occupation: formData.occupation || undefined,
        org: formData.org || undefined,
        password: formData.password,
        password_confirmation: formData.password_confirmation,
      };

      await register(registerData);

      toast.success('Inscription réussie !');
      // Redirection après succès
      router.push('/edit-home');
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors de l\'inscription');
      // Retourner à l'étape 1 si erreur d'email déjà utilisé
      if (err.message && err.message.includes('email')) {
        setCurrentStep(1);
      }
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    setMounted(true);
  }, []);

  const [formData, setFormData] = useState({
    lastname: '',
    firstname: '',
    email: '',
    occupation: '',
    org: '',
    password: '',
    password_confirmation: '',
  });

  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateField = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.lastname.trim()) newErrors.lastname = 'Le nom est requis';
    if (!formData.firstname.trim()) newErrors.firstname = 'Le prénom est requis';
    if (!formData.email.trim()) {
      newErrors.email = 'L\'email est requis';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email invalide';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validateStep2 = () => {
    const newErrors: Record<string, string> = {};
    if (!formData.password) {
      newErrors.password = 'Le mot de passe est requis';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Minimum 8 caractères';
    } else if (!/[a-z]/.test(formData.password) || !/[A-Z]/.test(formData.password) || !/[0-9]/.test(formData.password)) {
      newErrors.password = 'Le mot de passe doit contenir une majuscule, une minuscule et un chiffre';
    }
    if (formData.password !== formData.password_confirmation) {
      newErrors.password_confirmation = 'Les mots de passe ne correspondent pas';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePreviousStep = () => {
    setCurrentStep(1);
  };



  const handleGoogleSignup = () => {
    console.log('Inscription avec Google');
    // TODO: OAuth Google
  };

  const handleMicrosoftSignup = () => {
    console.log('Inscription avec Microsoft');
    // TODO: OAuth Microsoft
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !isLoading) {
      if (currentStep === 1) {
        handleNextStep();
      } else {
        handleSubmit();
      }
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Partie gauche avec image et overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <div className="absolute inset-0">
          <img
            src="/login-background.jpg"
            alt="Background"
            className={`w-full h-full object-cover transition-all duration-700 ease-out ${mounted ? 'opacity-100 scale-100' : 'opacity-0 scale-105'
              }`}
          />
        </div>

        <div className={`absolute inset-0 bg-gradient-to-r from-[#99334C]/95 via-[#99334C]/85 to-transparent transition-opacity duration-700 ease-out delay-150 ${mounted ? 'opacity-100' : 'opacity-0'
          }`} />

        <div className={`relative z-10 flex flex-col justify-between p-12 text-white w-full transition-all duration-700 ease-out delay-300 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-white/90 hover:text-white transition-colors w-fit"
          >
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>

          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Bienvenue sur<br />
              <span className="text-white/90">XCCM2</span>
            </h1>
            <p className="text-lg text-white/90 leading-relaxed mb-8">
              Notre plateforme vous permet de créer, organiser et partager vos contenus pédagogiques de manière intuitive.
            </p>

            <div className="space-y-4">
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 1 ? 'bg-white text-[#99334C]' : 'bg-white/20 text-white'
                  }`}>
                  {currentStep > 1 ? <Check className="w-6 h-6" /> : '1'}
                </div>
                <div>
                  <p className="font-semibold">Informations personnelles</p>
                  <p className="text-sm text-white/70">Nom, prénom, email</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${currentStep >= 2 ? 'bg-white text-[#99334C]' : 'bg-white/20 text-white'
                  }`}>
                  2
                </div>
                <div>
                  <p className="font-semibold">Sécurité</p>
                  <p className="text-sm text-white/70">Créez votre mot de passe</p>
                </div>
              </div>
            </div>
          </div>

          <p className="text-sm text-white/70">
            En créant un compte, vous acceptez notre{' '}
            <a href="#" className="underline hover:text-white">Politique de confidentialité</a>
            {' '}et nos{' '}
            <a href="#" className="underline hover:text-white">Conditions d'utilisation</a>.
          </p>
        </div>
      </div>

      {/* Partie droite avec formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className={`w-full max-w-md transition-all duration-700 ease-out delay-200 ${mounted ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'
          }`}>
          <div className="lg:hidden mb-8">
            <button
              onClick={() => router.push('/')}
              className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6"
            >
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Inscription</h2>
            <p className="text-gray-600">Créez votre compte XCCM2</p>
          </div>

          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Inscription</h2>
            <p className="text-gray-600">Étape {currentStep} sur 2</p>
          </div>

          {/* Barre de progression */}
          <div className="mb-8">
            <div className="flex gap-2">
              <div className={`flex-1 h-2 rounded-full transition-all ${currentStep >= 1 ? 'bg-[#99334C]' : 'bg-gray-200'
                }`} />
              <div className={`flex-1 h-2 rounded-full transition-all ${currentStep >= 2 ? 'bg-[#99334C]' : 'bg-gray-200'
                }`} />
            </div>
          </div>

          {/* Message d'erreur global */}


          {/* ÉTAPE 1 : Informations personnelles */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="nom" className="block text-sm font-semibold text-gray-700 mb-2">
                  Nom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="nom"
                    value={formData.lastname}
                    onChange={(e) => updateField('lastname', e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 transition-all text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.lastname ? 'border-red-500' : 'border-gray-300 focus:border-[#99334C]'
                      }`}
                    placeholder="Votre nom"
                  />
                </div>
                {errors.lastname && <p className="text-red-500 text-sm mt-1">{errors.lastname}</p>}
              </div>

              <div>
                <label htmlFor="prenom" className="block text-sm font-semibold text-gray-700 mb-2">
                  Prénom
                </label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="prenom"
                    value={formData.firstname}
                    onChange={(e) => updateField('firstname', e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 transition-all text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.firstname ? 'border-red-500' : 'border-gray-300 focus:border-[#99334C]'
                      }`}
                    placeholder="Votre prénom"
                  />
                </div>
                {errors.firstname && <p className="text-red-500 text-sm mt-1">{errors.firstname}</p>}
              </div>

              <div>
                <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                  E-mail
                </label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="email"
                    id="email"
                    value={formData.email}
                    onChange={(e) => updateField('email', e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={`w-full pl-10 pr-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 transition-all text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.email ? 'border-red-500' : 'border-gray-300 focus:border-[#99334C]'
                      }`}
                    placeholder="exemple@email.com"
                  />
                </div>
                {errors.email && <p className="text-red-500 text-sm mt-1">{errors.email}</p>}
              </div>

              <div>
                <label htmlFor="profession" className="block text-sm font-semibold text-gray-700 mb-2">
                  Profession <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <div className="relative">
                  <Briefcase className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="profession"
                    value={formData.occupation}
                    onChange={(e) => updateField('occupation', e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Enseignant, Formateur..."
                  />
                </div>
              </div>

              <div>
                <label htmlFor="organisation" className="block text-sm font-semibold text-gray-700 mb-2">
                  Organisation <span className="text-gray-400 font-normal">(optionnel)</span>
                </label>
                <div className="relative">
                  <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                  <input
                    type="text"
                    id="organisation"
                    value={formData.org}
                    onChange={(e) => updateField('org', e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all text-gray-900 placeholder:text-gray-400 disabled:bg-gray-100 disabled:cursor-not-allowed"
                    placeholder="Nom de votre établissement"
                  />
                </div>
              </div>

              <button
                onClick={handleNextStep}
                disabled={isLoading}
                className="w-full bg-[#99334C] text-white py-3 rounded-xl font-semibold hover:bg-[#7a283d] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Continuer <ArrowRight className="w-5 h-5" />
              </button>

              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-200"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Ou s'inscrire avec</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <button
                  onClick={handleGoogleSignup}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
                  </svg>
                  <span className="hidden sm:inline">Google</span>
                </button>

                <button
                  onClick={handleMicrosoftSignup}
                  disabled={isLoading}
                  className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <svg className="w-5 h-5" viewBox="0 0 23 23">
                    <path fill="#f3f3f3" d="M0 0h23v23H0z" />
                    <path fill="#f35325" d="M1 1h10v10H1z" />
                    <path fill="#81bc06" d="M12 1h10v10H12z" />
                    <path fill="#05a6f0" d="M1 12h10v10H1z" />
                    <path fill="#ffba08" d="M12 12h10v10H12z" />
                  </svg>
                  <span className="hidden sm:inline">Microsoft</span>
                </button>
              </div>
            </div>
          )}

          {/* ÉTAPE 2 : Mot de passe */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                  Mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    id="password"
                    value={formData.password}
                    onChange={(e) => updateField('password', e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 transition-all text-gray-900 placeholder:text-gray-400 pr-12 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.password ? 'border-red-500' : 'border-gray-300 focus:border-[#99334C]'
                      }`}
                    placeholder="Min. 8 car. (Maj, Min, Chiffre)"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.password && <p className="text-red-500 text-sm mt-1">{errors.password}</p>}
              </div>

              <div>
                <label htmlFor="confirmPassword" className="block text-sm font-semibold text-gray-700 mb-2">
                  Confirmer le mot de passe
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    id="confirmPassword"
                    value={formData.password_confirmation}
                    onChange={(e) => updateField('password_confirmation', e.target.value)}
                    onKeyPress={handleKeyPress}
                    disabled={isLoading}
                    className={`w-full px-4 py-3 border rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 transition-all text-gray-900 placeholder:text-gray-400 pr-12 disabled:bg-gray-100 disabled:cursor-not-allowed ${errors.password_confirmation ? 'border-red-500' : 'border-gray-300 focus:border-[#99334C]'
                      }`}
                    placeholder="Confirmez votre mot de passe"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    disabled={isLoading}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors disabled:cursor-not-allowed"
                  >
                    {showConfirmPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
                {errors.confirmPassword && <p className="text-red-500 text-sm mt-1">{errors.confirmPassword}</p>}
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">Votre mot de passe doit contenir :</p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                  <div className={`flex items-center gap-2 text-sm ${formData.password.length >= 8 ? 'text-green-600' : 'text-gray-400'}`}>
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>Au moins 8 caractères</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${/[A-Z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>Une lettre majuscule</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${/[a-z]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>Une lettre minuscule</span>
                  </div>
                  <div className={`flex items-center gap-2 text-sm ${/[0-9]/.test(formData.password) ? 'text-green-600' : 'text-gray-400'}`}>
                    <Check className="w-4 h-4 flex-shrink-0" />
                    <span>Un chiffre</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-4">
                <button
                  onClick={handlePreviousStep}
                  disabled={isLoading}
                  className="flex-1 border-2 border-gray-300 text-gray-700 py-3 rounded-xl font-semibold hover:bg-gray-50 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ArrowLeft className="w-5 h-5" />
                  Retour
                </button>
                <button
                  onClick={handleSubmit}
                  disabled={isLoading}
                  className="flex-1 bg-[#99334C] text-white py-3 rounded-xl font-semibold hover:bg-[#7a283d] transition-all shadow-lg hover:shadow-xl flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="w-5 h-5 animate-spin" />
                      <span>Création...</span>
                    </>
                  ) : (
                    'Créer mon compte'
                  )}
                </button>
              </div>
            </div>
          )}

          <div className="text-center pt-6 mt-6 border-t border-gray-200">
            <p className="text-sm text-gray-600">
              Vous avez déjà un compte ?{' '}
              <a href="/login" className="text-[#99334C] hover:underline font-semibold">
                Se connecter
              </a>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default RegisterPage;