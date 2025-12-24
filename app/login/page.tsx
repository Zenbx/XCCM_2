"use client";
import React, { useState } from 'react';
import { ArrowLeft, Eye, EyeOff } from 'lucide-react';
import { Facebook, Instagram, Twitter } from 'lucide-react';

const LoginPage = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [rememberMe, setRememberMe] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const handleSubmit = () => {
    console.log('Login:', { email, password, rememberMe });
    // TODO: Appel API pour la connexion
  };

  const handleGoogleLogin = () => {
    console.log('Connexion avec Google');
    // TODO: OAuth Google
  };

  const handleMicrosoftLogin = () => {
    console.log('Connexion avec Microsoft');
    // TODO: OAuth Microsoft
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      handleSubmit();
    }
  };

  return (
    <div className="min-h-screen flex">
      {/* Partie gauche avec image et overlay */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden">
        {/* Image de fond */}
        <div className="absolute inset-0">
          <img 
            src="/login-background.jpg" 
            alt="Background" 
            className="w-full h-full object-cover"
          />
        </div>

        {/* Overlay bordeaux avec dégradé */}
        <div className="absolute inset-0 bg-gradient-to-r from-[#99334C]/95 via-[#99334C]/85 to-transparent" />

        {/* Contenu */}
        <div className="relative z-10 flex flex-col justify-between p-12 text-white w-full">
          {/* Bouton retour */}
          <button className="flex items-center gap-2 text-white/90 hover:text-white transition-colors w-fit">
            <ArrowLeft className="w-5 h-5" />
            <span className="font-medium">Retour</span>
          </button>

          {/* Texte principal */}
          <div className="max-w-md">
            <h1 className="text-5xl font-bold mb-6 leading-tight">
              Ravi de vous<br />revoir !
            </h1>
            <p className="text-lg text-white/90 leading-relaxed mb-8">
              Notre plateforme vous permet de créer, organiser et partager vos contenus pédagogiques de manière intuitive.
            </p>

            {/* Icônes sociales */}
            <div className="flex gap-4">
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                aria-label="Facebook"
              >
                <Facebook className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                aria-label="Instagram"
              >
                <Instagram className="w-5 h-5" />
              </a>
              <a 
                href="#" 
                className="w-10 h-10 rounded-full bg-white/20 backdrop-blur-sm flex items-center justify-center hover:bg-white/30 transition-all"
                aria-label="Twitter"
              >
                <Twitter className="w-5 h-5" />
              </a>
            </div>
          </div>

          {/* Mentions légales */}
          <p className="text-sm text-white/70">
            En cliquant sur Se connecter, vous acceptez notre{' '}
            <a href="#" className="underline hover:text-white">Politique de confidentialité</a>
            {' '}et nos{' '}
            <a href="#" className="underline hover:text-white">Conditions d'utilisation</a>.
          </p>
        </div>
      </div>

      {/* Partie droite avec formulaire */}
      <div className="w-full lg:w-1/2 flex items-center justify-center p-6 bg-white">
        <div className="w-full max-w-md">
          {/* Header mobile */}
          <div className="lg:hidden mb-8">
            <button className="flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors mb-6">
              <ArrowLeft className="w-5 h-5" />
              <span className="font-medium">Retour</span>
            </button>
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-600">Accédez à votre espace XCCM2</p>
          </div>

          {/* Titre desktop */}
          <div className="hidden lg:block mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Connexion</h2>
            <p className="text-gray-600">Accédez à votre espace XCCM2</p>
          </div>

          {/* Formulaire */}
          <div className="space-y-6">
            {/* Email */}
            <div>
              <label htmlFor="email" className="block text-sm font-semibold text-gray-700 mb-2">
                E-mail
              </label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all"
                placeholder="exemple@email.com"
              />
            </div>

            {/* Mot de passe */}
            <div>
              <label htmlFor="password" className="block text-sm font-semibold text-gray-700 mb-2">
                Mot de Passe
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  id="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#99334C]/20 focus:border-[#99334C] transition-all pr-12"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors"
                >
                  {showPassword ? (
                    <EyeOff className="w-5 h-5" />
                  ) : (
                    <Eye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Se souvenir de moi */}
            <div className="flex items-center">
              <input
                type="checkbox"
                id="remember"
                checked={rememberMe}
                onChange={(e) => setRememberMe(e.target.checked)}
                className="w-4 h-4 rounded border-gray-300 text-[#99334C] focus:ring-[#99334C]/20"
              />
              <label htmlFor="remember" className="ml-2 text-sm text-gray-700">
                Se souvenir de moi
              </label>
            </div>

            {/* Bouton de connexion */}
            <button
              onClick={handleSubmit}
              className="w-full bg-[#99334C] text-white py-3 rounded-xl font-semibold hover:bg-[#7a283d] transition-all shadow-lg hover:shadow-xl"
            >
              Se connecter
            </button>

            {/* Divider */}
            <div className="relative my-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-200"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">Ou continuer avec</span>
              </div>
            </div>

            {/* Boutons OAuth */}
            <div className="grid grid-cols-2 gap-4">
              <button
                onClick={handleGoogleLogin}
                className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700"
              >
                <svg className="w-5 h-5" viewBox="0 0 24 24">
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
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                  />
                </svg>
                <span className="hidden sm:inline">Google</span>
              </button>

              <button
                onClick={handleMicrosoftLogin}
                className="flex items-center justify-center gap-3 px-4 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition-all font-medium text-gray-700"
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

            {/* Lien mot de passe oublié */}
            <div className="text-center">
              <a 
                href="#" 
                className="text-sm text-[#99334C] hover:underline font-medium"
              >
                Mot de Passe oublié ?
              </a>
            </div>

            {/* Lien inscription */}
            <div className="text-center pt-4 border-t border-gray-200">
              <p className="text-sm text-gray-600">
                Pas encore de compte ?{' '}
                <a href="#" className="text-[#99334C] hover:underline font-semibold">
                  Créer un compte
                </a>
              </p>
            </div>
          </div>

          {/* Mentions légales mobile */}
          <p className="lg:hidden mt-8 text-xs text-center text-gray-500">
            En vous connectant, vous acceptez notre{' '}
            <a href="#" className="underline">Politique de confidentialité</a>
            {' '}et nos{' '}
            <a href="#" className="underline">Conditions d'utilisation</a>.
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;