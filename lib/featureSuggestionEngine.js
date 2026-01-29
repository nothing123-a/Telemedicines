import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

class FeatureSuggestionEngine {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
    this.platformFeatures = {
      aiCounselor: {
        name: "AI Counselor",
        description: "24/7 emotional support and therapy chat",
        triggers: ["anxiety", "depression", "stress", "emotional", "sad", "worried", "overwhelmed", "lonely", "hopeless", "mental health"],
        route: "/dashboard/mental-counselor"
      },
      periodTracker: {
        name: "Period Tracker",
        description: "Menstrual cycle monitoring and women's health",
        triggers: ["period", "menstrual", "cycle", "pms", "cramps", "women health", "hormonal", "irregular periods"],
        route: "/dashboard/mental-counselor/period-tracker"
      },
      reportsAnalyzer: {
        name: "Reports Analyzer",
        description: "AI analysis of medical reports and blood tests",
        triggers: ["medical report", "blood test", "lab results", "diagnosis", "test results", "medical analysis"],
        route: "/dashboard/reports-analyzer"
      },
      onlinePharmacy: {
        name: "Online Pharmacy",
        description: "Order medicines and prescriptions online",
        triggers: ["medicine", "pharmacy", "prescription", "drugs", "medication", "pills"],
        route: "/dashboard/pharmacy/online"
      },
      prescriptionReader: {
        name: "Prescription Reader",
        description: "Scan and analyze prescriptions",
        triggers: ["prescription", "scan prescription", "read prescription", "medicine list"],
        route: "/dashboard/prescription-reader"
      },
      emergencySOS: {
        name: "Emergency SOS",
        description: "Accident and crisis support",
        triggers: ["emergency", "crisis", "accident", "urgent help", "sos", "immediate support"],
        route: "/dashboard/emergency-sos"
      },
      healthMonitor: {
        name: "Health Monitor",
        description: "Vital signs and symptom tracking",
        triggers: ["symptoms", "vital signs", "health monitoring", "track health", "body temperature"],
        route: "/dashboard/health-monitor"
      },
      telemedicine: {
        name: "Telemedicine",
        description: "Virtual doctor consultations",
        triggers: ["doctor", "consultation", "telemedicine", "virtual doctor", "online doctor"],
        route: "/dashboard/telemedicine"
      },
      routineDoctor: {
        name: "Routine Doctor",
        description: "Schedule regular checkups",
        triggers: ["routine checkup", "regular doctor", "appointment", "schedule visit"],
        route: "/dashboard/routine-doctor"
      },
      nearbyServices: {
        name: "Nearby Services",
        description: "Find hospitals, clinics, and pharmacies",
        triggers: ["nearby hospital", "find clinic", "pharmacy near me", "medical services"],
        route: "/dashboard/nearby-services"
      },
      scansAnalyzer: {
        name: "Scans Analyzer",
        description: "Medical scan analysis (MRI, X-Ray, etc.)",
        triggers: ["mri", "xray", "scan", "medical imaging", "chest scan", "kidney scan"],
        route: "/dashboard/scans-analyzer"
      },
      personalDoctor: {
        name: "Personal Doctor",
        description: "Your assigned physician",
        triggers: ["personal doctor", "assigned doctor", "my doctor"],
        route: "/dashboard/personal-doctor"
      }
    };
  }

  async analyzeUserContext(userMessage, userProfile = {}) {
    const contextPrompt = `
Analyze this user message and profile to understand their mental health context and needs:

User Message: "${userMessage}"
User Profile: ${JSON.stringify(userProfile)}

Identify:
1. Primary emotional state (anxious, depressed, stressed, neutral, positive)
2. Specific concerns or issues mentioned
3. Urgency level (low, medium, high, crisis)
4. Health-related topics (physical, mental, women's health)
5. Support needs (immediate, ongoing, informational)

Respond in JSON format:
{
  "emotionalState": "string",
  "concerns": ["array of concerns"],
  "urgencyLevel": "string", 
  "healthTopics": ["array"],
  "supportNeeds": ["array"],
  "keywords": ["relevant keywords for feature matching"]
}`;

    try {
      const result = await this.model.generateContent(contextPrompt);
      const response = result.response.text();
      return JSON.parse(response.replace(/```json|```/g, '').trim());
    } catch (error) {
      console.error('Context analysis failed:', error);
      return this._fallbackAnalysis(userMessage);
    }
  }

  _fallbackAnalysis(message) {
    const msgLower = message.toLowerCase();
    const keywords = [];
    
    // Extract keywords from message
    Object.values(this.platformFeatures).forEach(feature => {
      feature.triggers.forEach(trigger => {
        if (msgLower.includes(trigger)) {
          keywords.push(trigger);
        }
      });
    });

    return {
      emotionalState: msgLower.includes('sad') || msgLower.includes('depressed') ? 'negative' : 'neutral',
      concerns: keywords,
      urgencyLevel: msgLower.includes('urgent') || msgLower.includes('crisis') ? 'high' : 'medium',
      healthTopics: keywords.filter(k => ['health', 'medical', 'period', 'symptoms'].includes(k)),
      supportNeeds: ['emotional'],
      keywords
    };
  }

  generateFeatureSuggestions(context) {
    const suggestions = [];
    const { keywords, emotionalState, urgencyLevel, healthTopics, concerns } = context;

    // Priority scoring for each feature
    Object.entries(this.platformFeatures).forEach(([key, feature]) => {
      let score = 0;
      
      // Keyword matching
      const matchingTriggers = feature.triggers.filter(trigger => 
        keywords.some(keyword => keyword.includes(trigger) || trigger.includes(keyword))
      );
      score += matchingTriggers.length * 10;

      // Emotional state matching
      if (key === 'mentalCounselor' && ['anxious', 'depressed', 'stressed', 'negative'].includes(emotionalState)) {
        score += 15;
      }

      // Urgency matching
      if (key === 'crisisSupport' && urgencyLevel === 'crisis') {
        score += 25;
      }
      if (key === 'routineDoctor' && urgencyLevel === 'high') {
        score += 15;
      }

      // Health topic matching
      if (key === 'healthAdvisor' && healthTopics.length > 0) {
        score += 12;
      }
      if (key === 'periodTracker' && healthTopics.some(topic => 
        ['period', 'menstrual', 'women'].some(w => topic.includes(w))
      )) {
        score += 20;
      }

      if (score > 5) {
        suggestions.push({
          feature: key,
          ...feature,
          score,
          matchingTriggers,
          relevanceReason: this._generateRelevanceReason(feature, context)
        });
      }
    });

    // Sort by score and return top 3
    return suggestions
      .sort((a, b) => b.score - a.score)
      .slice(0, 3)
      .map(({ score, matchingTriggers, ...rest }) => rest);
  }

  _generateRelevanceReason(feature, context) {
    const { emotionalState, concerns, urgencyLevel } = context;
    
    if (feature.name.includes('Mental Health') && emotionalState === 'negative') {
      return "Based on your emotional state, our AI counselor can provide immediate support";
    }
    if (feature.name.includes('Health Report') && concerns.some(c => c.includes('health'))) {
      return "Upload your medical reports for AI-powered analysis and insights";
    }
    if (feature.name.includes('Period Tracker') && concerns.some(c => c.includes('period'))) {
      return "Track your menstrual health with personalized AI insights";
    }
    if (feature.name.includes('Doctor') && urgencyLevel === 'high') {
      return "Connect with verified doctors for professional medical advice";
    }
    if (feature.name.includes('Crisis') && urgencyLevel === 'crisis') {
      return "Get immediate crisis support and emergency assistance";
    }
    
    return `This feature can help address your current concerns: ${concerns.join(', ')}`;
  }

  async generatePersonalizedMessage(suggestions, userProfile = {}) {
    if (suggestions.length === 0) {
      return {
        message: "I'm here to support you. Feel free to explore our mental health counselor or health advisor features.",
        suggestions: []
      };
    }

    const messagePrompt = `
Create a warm, empathetic message suggesting these platform features to a user:

Features to suggest: ${JSON.stringify(suggestions)}
User Profile: ${JSON.stringify(userProfile)}

Create a personalized message that:
1. Shows empathy and understanding
2. Naturally introduces the suggested features
3. Explains how each feature can help their specific situation
4. Uses encouraging, supportive tone
5. Keeps it concise (2-3 sentences max)

Return only the message text, no JSON or formatting.`;

    try {
      const result = await this.model.generateContent(messagePrompt);
      return {
        message: result.response.text().trim(),
        suggestions
      };
    } catch (error) {
      console.error('Message generation failed:', error);
      return {
        message: `I understand you're going through something difficult. I'd like to suggest some features that might help: ${suggestions.map(s => s.name).join(', ')}. These tools are designed to support your wellbeing.`,
        suggestions
      };
    }
  }

  async processUserInput(userMessage, userProfile = {}) {
    try {
      // Step 1: Analyze user context
      const context = await this.analyzeUserContext(userMessage, userProfile);
      
      // Step 2: Generate feature suggestions
      const suggestions = this.generateFeatureSuggestions(context);
      
      // Step 3: Create personalized message
      const result = await this.generatePersonalizedMessage(suggestions, userProfile);
      
      return {
        ...result,
        context,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error('Feature suggestion processing failed:', error);
      return {
        message: "I'm here to help. You can explore our mental health counselor for emotional support or health advisor for medical insights.",
        suggestions: [this.platformFeatures.mentalCounselor],
        context: { error: error.message },
        timestamp: new Date().toISOString()
      };
    }
  }
}

export default FeatureSuggestionEngine;