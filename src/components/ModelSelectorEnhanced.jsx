import React, { useState, useEffect } from "react";
import { Brain, Zap, Star, Crown, ChevronDown, CheckCircle, Sparkles, Award, Eye } from "lucide-react";

const ModelSelector = ({ selectedModel, onModelChange }) => {
  const [isOpen, setIsOpen] = useState(false);

  const models = [
    {
      id: "gemini-1.5-flash",
      name: "Gemini 1.5 Flash",
      description: "Fast and efficient for quick cover letters",
      icon: Zap,
      speed: "Fast",
      quality: "Good",
      cost: "Low",
      recommended: true,
      color: "text-green-600",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
      gradient: "from-green-500 to-emerald-600",
    },
    {
      id: "gemini-1.5-pro",
      name: "Gemini 1.5 Pro",
      description: "Premium quality with advanced reasoning",
      icon: Crown,
      speed: "Medium",
      quality: "Excellent",
      cost: "Higher",
      premium: true,
      color: "text-purple-600",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
      gradient: "from-purple-500 to-violet-600",
    },
    {
      id: "gemini-1.0-pro",
      name: "Gemini 1.0 Pro",
      description: "Reliable and cost-effective option",
      icon: Star,
      speed: "Medium",
      quality: "Very Good",
      cost: "Medium",
      color: "text-blue-600",
      bgColor: "bg-blue-50",
      borderColor: "border-blue-200",
      gradient: "from-blue-500 to-cyan-600",
    },
    {
      id: "gemini-2.5-pro",
      name: "Gemini 2.5 Pro",
      description: "Latest model with enhanced capabilities",
      icon: Brain,
      speed: "Fast",
      quality: "Excellent",
      cost: "High",
      latest: true,
      color: "text-indigo-600",
      bgColor: "bg-indigo-50",
      borderColor: "border-indigo-200",
      gradient: "from-indigo-500 to-blue-600",
    },
    {
      id: "gemini-2.5-flash",
      name: "Gemini 2.5 Flash",
      description: "Latest model with fast performance",
      icon: Zap,
      speed: "Very Fast",
      quality: "Good",
      cost: "Medium",
      latest: true,
      color: "text-amber-600",
      bgColor: "bg-amber-50",
      borderColor: "border-amber-200",
      gradient: "from-amber-500 to-orange-600",
    },
  ];

  const selectedModelData = models.find((model) => model.id === selectedModel);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isOpen && !event.target.closest(".model-selector")) {
        setIsOpen(false);
      }
    };

    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, [isOpen]);

  const getSpeedColor = (speed) => {
    switch (speed) {
      case "Very Fast":
        return "text-green-600 bg-green-100";
      case "Fast":
        return "text-blue-600 bg-blue-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getQualityColor = (quality) => {
    switch (quality) {
      case "Excellent":
        return "text-purple-600 bg-purple-100";
      case "Very Good":
        return "text-blue-600 bg-blue-100";
      case "Good":
        return "text-green-600 bg-green-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  const getCostColor = (cost) => {
    switch (cost) {
      case "Low":
        return "text-green-600 bg-green-100";
      case "Medium":
        return "text-yellow-600 bg-yellow-100";
      case "High":
      case "Higher":
        return "text-red-600 bg-red-100";
      default:
        return "text-gray-600 bg-gray-100";
    }
  };

  return (
    <div className="model-selector relative">
      <label className="block text-sm font-semibold text-gray-700 mb-3">
        <div className="flex items-center gap-2">
          <Brain className="w-4 h-4 text-indigo-600" />
          AI Model Selection
        </div>
      </label>

      <div className="relative">
        <button
          type="button"
          onClick={() => setIsOpen(!isOpen)}
          className="w-full bg-white border-2 border-gray-200 rounded-xl px-4 py-4 text-left shadow-sm hover:shadow-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 hover:border-gray-300"
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              {selectedModelData && (
                <>
                  <div
                    className={`w-12 h-12 rounded-lg ${selectedModelData.bgColor} ${selectedModelData.borderColor} border-2 flex items-center justify-center`}
                  >
                    <selectedModelData.icon className={`w-6 h-6 ${selectedModelData.color}`} />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="font-semibold text-gray-900 text-lg">{selectedModelData.name}</span>
                      {selectedModelData.recommended && (
                        <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1">
                          <Award className="w-3 h-3" />
                          Recommended
                        </span>
                      )}
                      {selectedModelData.premium && (
                        <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium flex items-center gap-1">
                          <Crown className="w-3 h-3" />
                          Premium
                        </span>
                      )}
                      {selectedModelData.latest && (
                        <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium flex items-center gap-1">
                          <Sparkles className="w-3 h-3" />
                          Latest
                        </span>
                      )}
                    </div>
                    <span className="text-sm text-gray-600">{selectedModelData.description}</span>
                  </div>
                </>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform duration-200 ${isOpen ? "rotate-180" : ""}`}
            />
          </div>
        </button>

        {isOpen && (
          <div className="absolute z-20 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden">
            <div className="py-2 max-h-96 overflow-y-auto">
              {models.map((model, index) => {
                const IconComponent = model.icon;
                const isSelected = selectedModel === model.id;
                return (
                  <button
                    key={model.id}
                    onClick={() => {
                      onModelChange(model.id);
                      setIsOpen(false);
                    }}
                    className={`w-full px-4 py-4 text-left hover:bg-gray-50 transition-all duration-200 relative ${
                      isSelected ? `${model.bgColor} border-r-4 ${model.borderColor}` : ""
                    } ${index !== 0 ? "border-t border-gray-100" : ""}`}
                  >
                    <div className="flex items-start gap-4">
                      <div
                        className={`w-12 h-12 rounded-lg ${model.bgColor} ${
                          model.borderColor
                        } border-2 flex items-center justify-center transition-all duration-200 ${
                          isSelected ? "scale-110" : ""
                        }`}
                      >
                        <IconComponent className={`w-6 h-6 ${model.color}`} />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-gray-900 text-lg">{model.name}</span>
                          {isSelected && <CheckCircle className="w-5 h-5 text-green-600" />}
                          {model.recommended && (
                            <span className="px-2 py-1 text-xs bg-green-100 text-green-700 rounded-full font-medium flex items-center gap-1">
                              <Award className="w-3 h-3" />
                              Recommended
                            </span>
                          )}
                          {model.premium && (
                            <span className="px-2 py-1 text-xs bg-purple-100 text-purple-700 rounded-full font-medium flex items-center gap-1">
                              <Crown className="w-3 h-3" />
                              Premium
                            </span>
                          )}
                          {model.latest && (
                            <span className="px-2 py-1 text-xs bg-blue-100 text-blue-700 rounded-full font-medium flex items-center gap-1">
                              <Sparkles className="w-3 h-3" />
                              Latest
                            </span>
                          )}
                        </div>
                        <p className="text-sm text-gray-600 mb-3">{model.description}</p>
                        <div className="flex gap-3">
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getSpeedColor(model.speed)}`}>
                            ⚡ {model.speed}
                          </span>
                          <span
                            className={`px-2 py-1 text-xs rounded-full font-medium ${getQualityColor(model.quality)}`}
                          >
                            ⭐ {model.quality}
                          </span>
                          <span className={`px-2 py-1 text-xs rounded-full font-medium ${getCostColor(model.cost)}`}>
                            💰 {model.cost}
                          </span>
                        </div>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            <div className="border-t border-gray-200 px-4 py-3 bg-gradient-to-r from-indigo-50 to-purple-50">
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <Brain className="w-4 h-4 text-indigo-600" />
                <span>
                  <strong className="text-gray-800">Pro Tip:</strong> Flash models are perfect for most use cases. Pro
                  models offer enhanced creativity and reasoning for complex applications.
                </span>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ModelSelector;
