import React, { useState } from "react";
import { LogIn, Bot, Shield, Zap, Brain, Sparkles, CheckCircle, ArrowRight, Star, Crown, Award } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";

const LoginPage = () => {
  const { signInWithGoogle } = useAuth();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleGoogleSignIn = async () => {
    try {
      setIsLoading(true);
      setError("");
      await signInWithGoogle();
    } catch (error) {
      console.error("Login error:", error);
      setError("Failed to sign in. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const features = [
    {
      icon: Shield,
      title: "Secure API Key Storage",
      description: "Your Gemini API key is encrypted and stored securely",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Zap,
      title: "Cloud Resume Storage",
      description: "Access your resumes from any device, anytime",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Brain,
      title: "Multiple AI Models",
      description: "Choose from Flash, Pro, and latest Gemini models",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Sparkles,
      title: "Enhanced Privacy",
      description: "All file processing happens locally in your browser",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  const benefits = [
    "Save unlimited resumes with metadata",
    "Generate cover letters with multiple AI models",
    "Track your cover letter generation history",
    "Sync data across all your devices",
    "Premium model access with your own API key",
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-blue-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-4xl w-full">
        <div className="grid md:grid-cols-2 gap-8 items-center">
          {/* Left Side - Branding and Features */}
          <div className="space-y-8">
            {/* Header */}
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Bot className="w-7 h-7 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">AI Cover Letter</h1>
                  <p className="text-xl text-gray-600 font-medium">Generator</p>
                </div>
              </div>
              <p className="text-lg text-gray-600 max-w-md mx-auto md:mx-0">
                Generate professional, personalized cover letters in seconds using advanced AI technology
              </p>
            </div>

            {/* Features Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {features.map((feature, index) => (
                <div key={index} className="bg-white rounded-xl p-4 shadow-sm border border-gray-100 hover:shadow-md transition-all duration-200">
                  <div className="flex items-start gap-3">
                    <div className={`w-10 h-10 rounded-lg ${feature.bgColor} flex items-center justify-center`}>
                      <feature.icon className={`w-5 h-5 ${feature.color}`} />
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 text-sm">{feature.title}</h3>
                      <p className="text-xs text-gray-600 mt-1">{feature.description}</p>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Benefits List */}
            <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-100">
              <h3 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Award className="w-5 h-5 text-indigo-600" />
                What You Get
              </h3>
              <div className="space-y-3">
                {benefits.map((benefit, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                    <span className="text-sm text-gray-700">{benefit}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side - Sign In Form */}
          <div className="bg-white rounded-2xl shadow-2xl p-8 border border-gray-100">
            <div className="text-center mb-8">
              <div className="w-16 h-16 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-4">
                <LogIn className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-2xl font-bold text-gray-900 mb-2">Welcome Back!</h2>
              <p className="text-gray-600">
                Sign in to access your personal AI writing assistant
              </p>
            </div>

            {error && (
              <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 bg-red-500 rounded-full"></div>
                  <span className="text-red-700 text-sm font-medium">{error}</span>
                </div>
              </div>
            )}

            <button
              onClick={handleGoogleSignIn}
              disabled={isLoading}
              className="w-full bg-white border-2 border-gray-200 rounded-xl px-6 py-4 hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50 disabled:cursor-not-allowed transition-all duration-200 shadow-sm hover:shadow-md"
            >
              <div className="flex items-center justify-center gap-4">
                {isLoading ? (
                  <div className="w-6 h-6 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                ) : (
                  <svg className="w-6 h-6" viewBox="0 0 24 24">
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
                )}
                <div className="text-left">
                  <div className="text-gray-900 font-semibold">
                    {isLoading ? 'Signing in...' : 'Continue with Google'}
                  </div>
                  <div className="text-gray-500 text-sm">
                    Quick & secure authentication
                  </div>
                </div>
                {!isLoading && <ArrowRight className="w-5 h-5 text-gray-400" />}
              </div>
            </button>

            <div className="mt-6 pt-6 border-t border-gray-100">
              <div className="flex items-center justify-center gap-2 text-sm text-gray-500">
                <Shield className="w-4 h-4" />
                <span>Your data is encrypted and secure</span>
              </div>
            </div>

            <p className="text-xs text-gray-500 text-center mt-4 leading-relaxed">
              By signing in, you agree to our{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">
                Terms of Service
              </a>{' '}
              and{' '}
              <a href="#" className="text-indigo-600 hover:text-indigo-700 underline">
                Privacy Policy
              </a>
            </p>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-8">
          <div className="inline-flex items-center gap-2 bg-white rounded-full px-6 py-3 shadow-sm border border-gray-100">
            <Star className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-700">
              Join thousands of professionals getting their dream jobs
            </span>
            <Star className="w-4 h-4 text-yellow-500" />
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
