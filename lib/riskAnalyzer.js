// lib/riskAnalyzer.js

class RiskAnalyzer {
  constructor() {
    // Use lightweight keyword-based analysis only
  }

  async analyzeRisk(text) {
    try {
      // Direct keyword analysis without external service
      return this._keywordAnalysis(text);
    } catch (error) {
      console.error('Risk analysis failed:', error);
      return { risk_level: "Normal", confidence: 0.5, method: "error-fallback" };
    }
  }

  _keywordAnalysis(text) {
    const textLower = text.toLowerCase();
    
    const suicidal_keywords = [
      "suicide", "kill myself", "end my life", "want to die", "better off dead",
      "end it all", "take my own life", "not worth living", "wish i was dead"
    ];
    
    const depressed_keywords = [
      "hopeless", "worthless", "useless", "burden", "hate myself",
      "severely depressed", "can't go on", "no point", "empty inside"
    ];

    const anxiety_keywords = [
      "panic", "anxious", "overwhelmed", "scared", "terrified", "nervous"
    ];

    if (suicidal_keywords.some(kw => textLower.includes(kw))) {
      return { risk_level: "Suicidal", confidence: 0.9, method: "keyword" };
    }
    
    if (depressed_keywords.some(kw => textLower.includes(kw))) {
      return { risk_level: "Depressed", confidence: 0.8, method: "keyword" };
    }

    if (anxiety_keywords.some(kw => textLower.includes(kw))) {
      return { risk_level: "Anxious", confidence: 0.7, method: "keyword" };
    }
    
    return { risk_level: "Normal", confidence: 0.6, method: "keyword" };
  }

  async checkHealth() {
    return true; // Always healthy since no external service
  }
}

export default RiskAnalyzer;