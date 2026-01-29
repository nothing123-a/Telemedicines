import { GoogleGenerativeAI } from "@google/generative-ai";


const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const SERPER_API_KEY = "b15321aee5370f5e506e764fb6141b8fa80c4d0f";

class HealthAdvisor {
  constructor() {
    this.model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });
  }

  async analyzeReport(reportText) {
    try {
      const prompt = `Analyze this medical report and provide a clear summary:

SUMMARY:
Key findings and health status

VITAL PARAMETERS:
Hemoglobin: [value] g/dL
WBC: [value] cells/uL
Platelets: [value] /uL
Glucose: [value] mg/dL
Cholesterol: [value] mg/dL

ABNORMAL VALUES:
List any concerning values

CLINICAL SIGNIFICANCE:
What these results mean

RECOMMENDATIONS:
Next steps and advice

Report text: ${reportText.substring(0, 2000)}

Use plain text only, no special formatting.`;

      const result = await this.model.generateContent(prompt);
      return result.response.text() || 'Analysis completed successfully';
    } catch (error) {
      console.error('AI analysis failed:', error);
      return `Medical report analysis:

SUMMARY:
Report contains ${reportText.length} characters of medical data.

VITAL PARAMETERS:
Please consult healthcare provider for parameter interpretation.

RECOMMENDATIONS:
Share this report with your doctor for professional analysis.`;
    }
  }

  async searchHealthArticles(summary) {
    try {
      const searchQuery = summary.substring(0, 100).replace(/[^a-zA-Z0-9\s]/g, ' ');
      const response = await fetch('https://google.serper.dev/search', {
        method: 'POST',
        headers: {
          'X-API-KEY': SERPER_API_KEY,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          q: `medical health ${searchQuery}`,
          num: 5
        })
      });

      if (!response.ok) {
        console.error('Search API failed:', response.status);
        return [];
      }

      const data = await response.json();
      return data.organic?.map(result => ({
        title: result.title || 'Medical Article',
        url: result.link || '#',
        snippet: result.snippet || 'Health information'
      })) || [];
    } catch (error) {
      console.error('Search failed:', error);
      return [];
    }
  }

  async generateRecommendations(summary, articles) {
    const articlesText = articles.map(a => `${a.title}: ${a.snippet}`).join('\n');
    
    const prompt = `
You are a medical doctor. Based on this health report summary and relevant articles, provide:
1. Specific health recommendations
2. Lifestyle changes
3. Follow-up suggestions
4. Preventive measures

Report Summary: ${summary}

Relevant Articles: ${articlesText}
`;

    const result = await this.model.generateContent(prompt);
    return result.response.text();
  }

  async processHealthReport(reportText) {
    try {
      console.log('Processing health report, text length:', reportText.length);
      
      if (!reportText || reportText.trim().length < 10) {
        throw new Error('Report text is too short or empty');
      }
      
      // Step 1: Analyze report
      console.log('Step 1: Analyzing report...');
      const summary = await this.analyzeReport(reportText);
      console.log('Summary generated, length:', summary.length);
      
      // Step 2: Find relevant articles (don't fail if this fails)
      console.log('Step 2: Searching for articles...');
      let articles = [];
      try {
        articles = await this.searchHealthArticles(summary.substring(0, 200));
        console.log('Found articles:', articles.length);
      } catch (searchError) {
        console.error('Article search failed, continuing without articles:', searchError);
      }
      
      // Step 3: Generate recommendations
      console.log('Step 3: Generating recommendations...');
      const recommendations = await this.generateRecommendations(summary, articles);
      console.log('Recommendations generated, length:', recommendations.length);
      
      return {
        summary: summary || 'Analysis completed',
        articles: articles || [],
        recommendations: recommendations || 'Follow up with your healthcare provider'
      };
    } catch (error) {
      console.error('Health advisor processing failed:', error);
      
      // Return basic analysis if main processing fails
      return {
        summary: `Basic analysis of the provided medical report. Text length: ${reportText.length} characters. Please consult with a healthcare professional for detailed interpretation.`,
        articles: [],
        recommendations: 'Please share this report with your healthcare provider for professional medical advice.'
      };
    }
  }
}

export default HealthAdvisor;