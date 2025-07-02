import React, { useState } from "react";
import { AuthProvider, useAuth } from "./contexts/AuthContext.jsx";
import CoverLetterGenerator from "./components/CoverLetterGenerator.jsx";
import LoginPage from "./components/LoginPage.jsx";
import ApiKeyManager from "./components/ApiKeyManager.jsx";

// Main app content component
const AppContent = () => {
  const { user, loading } = useAuth();
  const [apiKey, setApiKey] = useState("");
  const [hasValidApiKey, setHasValidApiKey] = useState(false);

  const handleApiKeySet = (key) => {
    setApiKey(key);
    setHasValidApiKey(!!key);
  };

  // Show loading spinner while checking auth status
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  // Show login page if not authenticated
  if (!user) {
    return <LoginPage />;
  }

  // Show API key setup if no valid API key
  if (!hasValidApiKey) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <ApiKeyManager onApiKeySet={handleApiKeySet} />
      </div>
    );
  }

  // Show main application
  return (
    <div className="App">
      <CoverLetterGenerator apiKey={apiKey} />
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
