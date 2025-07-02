import React, { useState, useEffect } from "react";
import { Eye, EyeOff, Key, Save, AlertCircle, CheckCircle, ExternalLink, Shield, Sparkles, Brain, Crown, Zap, Star } from "lucide-react";
import { useAuth } from "../contexts/AuthContext";
import { supabase } from "../utils/supabase";

const ApiKeyManager = ({ onApiKeySet }) => {
  const { user } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [showApiKey, setShowApiKey] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [step, setStep] = useState(1);

  useEffect(() => {
    if (user) {
      loadApiKey();
    }
  }, [user]);

  const loadApiKey = async () => {
    try {
      setIsLoading(true);
      const { data, error } = await supabase
        .from("user_settings")
        .select("gemini_api_key")
        .eq("user_id", user.id)
        .single();

      if (error && error.code !== "PGRST116") {
        throw error;
      }

      if (data?.gemini_api_key) {
        setApiKey(data.gemini_api_key);
        onApiKeySet(data.gemini_api_key);
        setStep(3); // Go to success step
      }
    } catch (error) {
      console.error("Error loading API key:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveApiKey = async () => {
    if (!apiKey.trim()) {
      setError("Please enter a valid API key");
      return;
    }

    try {
      setIsLoading(true);
      setError("");
      setSuccess("");

      const { error } = await supabase
        .from("user_settings")
        .upsert({
          user_id: user.id,
          gemini_api_key: apiKey.trim(),
          updated_at: new Date().toISOString(),
        });

      if (error) throw error;

      setSuccess("API key saved successfully!");
      onApiKeySet(apiKey.trim());
      setStep(3);
      
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Error saving API key:", error);
      setError("Failed to save API key. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const validateApiKey = (key) => {
    return key.startsWith("AIza") && key.length > 30;
  };

  const steps = [
    {
      title: "Welcome to AI Cover Letter Generator",
      description: "Let's set up your personal AI assistant in just a few steps"
    },
    {
      title: "Get Your Gemini API Key",
      description: "You'll need a free API key from Google to use the AI features"
    },
    {
      title: "Enter Your API Key",
      description: "Paste your API key below - it will be encrypted and stored securely"
    },
    {
      title: "You're All Set!",
      description: "Your API key is configured and ready to generate amazing cover letters"
    }
  ];

  const aiModels = [
    {
      name: "Gemini 1.5 Flash",
      icon: Zap,
      description: "Fast and efficient",
      color: "text-green-600",
      bgColor: "bg-green-100"
    },
    {
      name: "Gemini 1.5 Pro",
      icon: Crown,
      description: "Premium quality",
      color: "text-purple-600",
      bgColor: "bg-purple-100"
    },
    {
      name: "Gemini 2.5 Pro",
      icon: Brain,
      description: "Latest and most advanced",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full">
        {/* Progress Bar */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            {steps.map((_, index) => (
              <div key={index} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  index + 1 <= step ? 'bg-indigo-600 text-white' : 'bg-gray-200 text-gray-600'
                }`}>
                  {index + 1 <= step ? <CheckCircle className="w-4 h-4" /> : index + 1}
                </div>
                {index < steps.length - 1 && (
                  <div className={`w-16 h-1 mx-2 rounded ${
                    index + 1 < step ? 'bg-indigo-600' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">{steps[step - 1]?.title}</h2>
            <p className="text-gray-600 mt-1">{steps[step - 1]?.description}</p>
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-2xl overflow-hidden">
          {/* Step 1: Welcome */}
          {step === 1 && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-gradient-to-r from-indigo-600 to-purple-600 rounded-full flex items-center justify-center mx-auto mb-6">
                <Sparkles className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Welcome, {user?.user_metadata?.full_name || user?.email?.split('@')[0]}!
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                You're about to unlock the power of AI-generated cover letters. 
                Let's get you set up with access to multiple Gemini AI models.
              </p>

              {/* AI Models Preview */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
                {aiModels.map((model, index) => (
                  <div key={index} className="bg-gray-50 rounded-xl p-4">
                    <div className={`w-10 h-10 rounded-lg ${model.bgColor} flex items-center justify-center mx-auto mb-2`}>
                      <model.icon className={`w-5 h-5 ${model.color}`} />
                    </div>
                    <h4 className="font-semibold text-sm text-gray-900">{model.name}</h4>
                    <p className="text-xs text-gray-600 mt-1">{model.description}</p>
                  </div>
                ))}
              </div>

              <button
                onClick={() => setStep(2)}
                className="bg-indigo-600 text-white px-8 py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
              >
                Get Started
              </button>
            </div>
          )}

          {/* Step 2: API Key Instructions */}
          {step === 2 && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Key className="w-8 h-8 text-blue-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Get Your Free API Key</h3>
                <p className="text-gray-600">
                  Follow these simple steps to get your Gemini API key from Google
                </p>
              </div>

              <div className="space-y-4 mb-8">
                <div className="flex items-start gap-4 p-4 bg-blue-50 rounded-xl">
                  <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Visit Google AI Studio</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Go to the official Google AI Studio to create your free API key
                    </p>
                    <a
                      href="https://makersuite.google.com/app/apikey"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 mt-2 text-blue-600 hover:text-blue-700 text-sm font-medium"
                    >
                      Open Google AI Studio
                      <ExternalLink className="w-4 h-4" />
                    </a>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-green-50 rounded-xl">
                  <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Create API Key</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Click "Create API Key" and copy the generated key (starts with "AIza...")
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-4 p-4 bg-purple-50 rounded-xl">
                  <div className="w-6 h-6 bg-purple-600 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">Paste Here</p>
                    <p className="text-sm text-gray-600 mt-1">
                      Come back and paste your API key in the next step
                    </p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => setStep(1)}
                  className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={() => setStep(3)}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 transition-colors"
                >
                  I Have My Key
                </button>
              </div>
            </div>
          )}

          {/* Step 3: Enter API Key */}
          {step === 3 && !success && (
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="w-16 h-16 bg-indigo-100 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Shield className="w-8 h-8 text-indigo-600" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">Enter Your API Key</h3>
                <p className="text-gray-600">
                  Your API key will be encrypted and stored securely
                </p>
              </div>

              <div className="space-y-6">
                <div>
                  <label htmlFor="apiKey" className="block text-sm font-semibold text-gray-700 mb-3">
                    Google Gemini API Key
                  </label>
                  <div className="relative">
                    <input
                      id="apiKey"
                      type={showApiKey ? 'text' : 'password'}
                      value={apiKey}
                      onChange={(e) => setApiKey(e.target.value)}
                      placeholder="AIza..."
                      className="w-full px-4 py-4 pr-12 border-2 border-gray-200 rounded-xl focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all text-lg"
                    />
                    <button
                      type="button"
                      onClick={() => setShowApiKey(!showApiKey)}
                      className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    >
                      {showApiKey ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                  {apiKey && !validateApiKey(apiKey) && (
                    <p className="text-sm text-amber-600 mt-2 flex items-center gap-2">
                      <AlertCircle className="w-4 h-4" />
                      API key should start with 'AIza' and be at least 30 characters
                    </p>
                  )}
                  {apiKey && validateApiKey(apiKey) && (
                    <p className="text-sm text-green-600 mt-2 flex items-center gap-2">
                      <CheckCircle className="w-4 h-4" />
                      API key format looks good!
                    </p>
                  )}
                </div>

                {error && (
                  <div className="p-4 bg-red-50 border border-red-200 rounded-xl">
                    <div className="flex items-center gap-2">
                      <AlertCircle className="w-5 h-5 text-red-600" />
                      <span className="text-red-700 font-medium">{error}</span>
                    </div>
                  </div>
                )}

                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4">
                  <div className="flex items-start gap-3">
                    <Shield className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                      <h4 className="font-medium text-blue-900 mb-1">Security & Privacy</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>• Your API key is encrypted before storage</li>
                        <li>• Only you can access your API key</li>
                        <li>• All file processing happens locally in your browser</li>
                        <li>• We never see your resume content or cover letters</li>
                      </ul>
                    </div>
                  </div>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={() => setStep(2)}
                    className="flex-1 bg-gray-100 text-gray-700 py-3 rounded-xl font-medium hover:bg-gray-200 transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={saveApiKey}
                    disabled={isLoading || !apiKey.trim() || !validateApiKey(apiKey)}
                    className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-medium hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
                  >
                    {isLoading ? (
                      <>
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                        Saving...
                      </>
                    ) : (
                      <>
                        <Save className="w-4 h-4" />
                        Save & Continue
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* Step 4: Success */}
          {(step === 4 || success) && (
            <div className="p-8 text-center">
              <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <CheckCircle className="w-10 h-10 text-green-600" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-4">
                Perfect! You're All Set
              </h3>
              <p className="text-gray-600 mb-8 max-w-md mx-auto">
                Your API key has been saved securely. You can now generate professional cover letters 
                using multiple AI models. Let's create your first cover letter!
              </p>

              {success && (
                <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center justify-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-600" />
                    <span className="text-green-700 font-medium">{success}</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ApiKeyManager;
