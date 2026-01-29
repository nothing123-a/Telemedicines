from flask import Flask, request, jsonify
from transformers import pipeline, AutoTokenizer, AutoModelForSequenceClassification
import torch
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

class RiskAnalyzer:
    def __init__(self):
        self.model_name = "emilyalsentzer/Bio_ClinicalBERT"
        self.tokenizer = None
        self.model = None
        self.classifier = None
        self._load_model()
    
    def _load_model(self):
        try:
            logging.info("Loading BioClinicalBERT model...")
            self.tokenizer = AutoTokenizer.from_pretrained(self.model_name)
            self.model = AutoModelForSequenceClassification.from_pretrained(
                self.model_name, 
                num_labels=3  # Normal, Depressed, Suicidal
            )
            
            # Create custom classifier pipeline
            self.classifier = pipeline(
                "text-classification",
                model=self.model,
                tokenizer=self.tokenizer,
                return_all_scores=True
            )
            logging.info("Model loaded successfully")
        except Exception as e:
            logging.error(f"Error loading model: {e}")
            # Fallback to keyword-based classification
            self.classifier = None
    
    def classify_risk(self, text):
        if not text or not text.strip():
            return {"risk_level": "Normal", "confidence": 0.0, "method": "empty_text"}
        
        text = text.lower().strip()
        
        # If model failed to load, use keyword-based fallback
        if self.classifier is None:
            return self._keyword_classification(text)
        
        try:
            # Use BioClinicalBERT for classification
            results = self.classifier(text)
            
            # Map model outputs to risk levels
            risk_mapping = {
                "LABEL_0": "Normal",
                "LABEL_1": "Depressed", 
                "LABEL_2": "Suicidal"
            }
            
            # Get highest confidence prediction
            best_result = max(results, key=lambda x: x['score'])
            risk_level = risk_mapping.get(best_result['label'], "Normal")
            confidence = best_result['score']
            
            return {
                "risk_level": risk_level,
                "confidence": confidence,
                "method": "bioclinicalbert"
            }
            
        except Exception as e:
            logging.error(f"Model classification error: {e}")
            return self._keyword_classification(text)
    
    def _keyword_classification(self, text):
        suicidal_keywords = [
            "suicide", "kill myself", "end my life", "want to die", "better off dead",
            "end it all", "take my own life", "not worth living", "wish i was dead"
        ]
        
        depressed_keywords = [
            "hopeless", "worthless", "useless", "burden", "hate myself",
            "severely depressed", "can't go on", "no point", "empty inside"
        ]
        
        # Check for suicidal indicators first
        if any(keyword in text for keyword in suicidal_keywords):
            return {"risk_level": "Suicidal", "confidence": 0.9, "method": "keyword"}
        
        # Check for depression indicators
        if any(keyword in text for keyword in depressed_keywords):
            return {"risk_level": "Depressed", "confidence": 0.8, "method": "keyword"}
        
        return {"risk_level": "Normal", "confidence": 0.7, "method": "keyword"}

# Initialize risk analyzer
risk_analyzer = RiskAnalyzer()

@app.route('/health', methods=['GET'])
def health_check():
    return jsonify({"status": "healthy", "model_loaded": risk_analyzer.classifier is not None})

@app.route('/analyze-risk', methods=['POST'])
def analyze_risk():
    try:
        data = request.get_json()
        if not data or 'text' not in data:
            return jsonify({"error": "Missing 'text' field"}), 400
        
        result = risk_analyzer.classify_risk(data['text'])
        return jsonify(result)
        
    except Exception as e:
        logging.error(f"Analysis error: {e}")
        return jsonify({"error": "Analysis failed"}), 500

if __name__ == '__main__':
    import os
    port = int(os.environ.get('PORT', 5001))
    app.run(host='0.0.0.0', port=port, debug=False)