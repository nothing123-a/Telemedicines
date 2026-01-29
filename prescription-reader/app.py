from flask import Flask, request, jsonify, render_template_string
from flask_cors import CORS
import os
import torch
from PIL import Image
from transformers import VisionEncoderDecoderModel, DonutProcessor, pipeline
import io
import base64
import json

app = Flask(__name__)
CORS(app)

# Global variables for models
processor = None
donut_model = None
classifier = None
device = "cuda" if torch.cuda.is_available() else "cpu"

def initialize_models():
    """Initialize the OCR and classification models"""
    global processor, donut_model, classifier
    
    current_dir = os.path.dirname(os.path.abspath(__file__))
    donut_model_path = os.path.join(current_dir, "model")
    
    try:
        if os.path.exists(donut_model_path):
            print("Loading Donut OCR model...")
            processor = DonutProcessor.from_pretrained(donut_model_path)
            donut_model = VisionEncoderDecoderModel.from_pretrained(donut_model_path)
            donut_model.to(device)
            donut_model.eval()
            print("✅ Donut model loaded successfully")
        else:
            print("❌ Model not found. Please run: python model_download.py")
            return False
            
        print("Loading classification model...")
        classifier = pipeline("zero-shot-classification", model="facebook/bart-large-mnli", device=0 if device == "cuda" else -1)
        print("✅ Classification model loaded successfully")
        
        return True
        
    except Exception as e:
        print(f"❌ Error loading models: {e}")
        return False

def extract_text_from_image(image):
    """Extract text from image using Donut OCR model"""
    if processor is None or donut_model is None:
        return "Models not loaded"
        
    try:
        image = image.convert("RGB")
        encoding = processor(images=image, return_tensors="pt").to(device)
        
        with torch.no_grad():
            generated_ids = donut_model.generate(
                encoding.pixel_values, 
                max_length=512, 
                num_beams=1,
                early_stopping=True,
                decoder_start_token_id=processor.tokenizer.convert_tokens_to_ids("<s_ocr>")
            )
        
        generated_text = processor.tokenizer.batch_decode(generated_ids, skip_special_tokens=True)[0].strip()
        return generated_text
        
    except Exception as e:
        print(f"OCR Error: {e}")
        return f"Error extracting text: {str(e)}"

def extract_medicine_info(text):
    """Extract medicine name, dosage, and frequency from prescription text"""
    import re
    
    medicines = []
    
    # Common medicine names database (partial list for validation)
    known_medicines = {
        'paracetamol', 'acetaminophen', 'ibuprofen', 'aspirin', 'amoxicillin', 'azithromycin',
        'ciprofloxacin', 'metformin', 'atorvastatin', 'amlodipine', 'lisinopril', 'omeprazole',
        'pantoprazole', 'ranitidine', 'cetirizine', 'loratadine', 'prednisolone', 'dexamethasone',
        'insulin', 'metoprolol', 'atenolol', 'furosemide', 'hydrochlorothiazide', 'warfarin',
        'clopidogrel', 'simvastatin', 'rosuvastatin', 'levothyroxine', 'gabapentin', 'tramadol',
        'morphine', 'codeine', 'diazepam', 'alprazolam', 'sertraline', 'fluoxetine', 'citalopram',
        'amitriptyline', 'duloxetine', 'venlafaxine', 'risperidone', 'quetiapine', 'olanzapine',
        'haloperidol', 'chlorpromazine', 'lithium', 'carbamazepine', 'phenytoin', 'valproate',
        'levetiracetam', 'topiramate', 'lamotrigine', 'baclofen', 'cyclobenzaprine', 'tizanidine',
        'albuterol', 'salbutamol', 'ipratropium', 'budesonide', 'fluticasone', 'montelukast',
        'digoxin', 'verapamil', 'diltiazem', 'nifedipine', 'losartan', 'valsartan', 'telmisartan',
        'spironolactone', 'eplerenone', 'bisoprolol', 'carvedilol', 'propranolol', 'timolol',
        'doxycycline', 'tetracycline', 'erythromycin', 'clarithromycin', 'vancomycin', 'gentamicin',
        'tobramycin', 'amikacin', 'ceftriaxone', 'cefuroxime', 'cephalexin', 'penicillin',
        'ampicillin', 'piperacillin', 'meropenem', 'imipenem', 'ertapenem', 'levofloxacin',
        'moxifloxacin', 'norfloxacin', 'ofloxacin', 'trimethoprim', 'sulfamethoxazole', 'nitrofurantoin',
        'metronidazole', 'tinidazole', 'fluconazole', 'itraconazole', 'ketoconazole', 'terbinafine',
        'acyclovir', 'valacyclovir', 'oseltamivir', 'ribavirin', 'interferon', 'hydroxychloroquine',
        'chloroquine', 'mefloquine', 'doxorubicin', 'cyclophosphamide', 'methotrexate', 'vincristine',
        'paclitaxel', 'carboplatin', 'cisplatin', 'tamoxifen', 'anastrozole', 'letrozole'
    }
    
    # Medicine name suffixes that indicate pharmaceutical compounds
    medicine_suffixes = {
        'cillin', 'mycin', 'floxacin', 'zole', 'pril', 'sartan', 'statin', 'olol', 'pine', 
        'ide', 'ine', 'ate', 'one', 'zine', 'pam', 'done', 'lone', 'sone', 'tide', 'mide',
        'fen', 'sal', 'mol', 'tol', 'nol', 'dine', 'sine', 'tine', 'rine', 'mine', 'line'
    }
    
    # Clean the text - remove non-medical content
    text = re.sub(r'Ph\.[+]\d+.*|Web:.*|Email:.*|www\..*|@.*\.com', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Dr\.?\s+[A-Z][a-z]+.*|Doctor.*|Clinic.*|Hospital.*', '', text, flags=re.IGNORECASE)
    text = re.sub(r'Smile|Designing|Teeth|Whitening|Dental|Implants|General|Dentistry', '', text, flags=re.IGNORECASE)
    
    # Look for medicine patterns with strict validation
    patterns = [
        # Pattern 1: Tab/Cap/Syp followed by medicine name and dosage
        r'(?:Tab\.?|Cap\.?|Syp\.?)\s*([A-Z][a-z]+(?:[A-Z][a-z]*)*)\s*(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g))',
        # Pattern 2: Medicine name followed by dosage
        r'\b([A-Z][a-z]{3,}(?:[A-Z][a-z]+)*)\s*(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g))\b',
        # Pattern 3: Known medicine names (exact match)
        r'\b(' + '|'.join(known_medicines) + r')\b'
    ]
    
    for pattern in patterns:
        matches = re.finditer(pattern, text, re.IGNORECASE)
        for match in matches:
            name = match.group(1).strip()
            
            # Validate medicine name
            name_lower = name.lower()
            
            # Check if it's a known medicine or has valid suffix
            is_valid_medicine = (
                name_lower in known_medicines or
                any(name_lower.endswith(suffix) for suffix in medicine_suffixes) or
                (len(name) >= 6 and re.match(r'^[A-Z][a-z]+(?:[A-Z][a-z]+)*$', name))
            )
            
            # Skip if not a valid medicine name
            if not is_valid_medicine:
                continue
            
            # Skip partial words or common non-medicine terms
            if (name_lower.startswith(('designin', 'whitenin', 'smilin', 'teethin')) or
                name_lower in {'smile', 'design', 'teeth', 'white', 'dental', 'general'}):
                continue
            
            # Extract dosage
            dosage = 'Not specified'
            if len(match.groups()) >= 2 and match.group(2):
                dosage = match.group(2).strip()
            else:
                # Look for dosage nearby
                context = text[max(0, match.start()-30):match.end()+30]
                dosage_match = re.search(r'(\d+(?:\.\d+)?\s*(?:mg|ml|mcg|g))', context, re.IGNORECASE)
                if dosage_match:
                    dosage = dosage_match.group(1)
            
            # Extract frequency
            frequency = 'As directed'
            context = text[max(0, match.start()-50):match.end()+100]
            
            freq_patterns = [
                (r'(\d+\s*-\s*\d+\s*-\s*\d+(?:\s*x\s*\d+\s*days?)?)', 'frequency_pattern'),
                (r'(once\s+daily|twice\s+daily|thrice\s+daily|OD|BD|TDS)', 'daily_pattern'),
                (r'(before\s+meals?|after\s+meals?|with\s+meals?)', 'meal_pattern'),
                (r'(\d+\s*times?\s*(?:a\s*)?day)', 'times_pattern')
            ]
            
            for freq_pattern, _ in freq_patterns:
                freq_match = re.search(freq_pattern, context, re.IGNORECASE)
                if freq_match:
                    frequency = freq_match.group(1).strip()
                    break
            
            medicines.append({
                'name': name,
                'dosage': dosage,
                'frequency': frequency
            })
    
    # Remove duplicates and return
    seen = set()
    unique_medicines = []
    for med in medicines:
        key = med['name'].lower()
        if key not in seen and len(med['name']) >= 4:  # Minimum 4 characters
            seen.add(key)
            unique_medicines.append(med)
    
    return unique_medicines if unique_medicines else [{'name': 'No medicines found', 'dosage': '-', 'frequency': '-'}]

def classify_prescription(text):
    """Classify if text is from a medical prescription"""
    if not text or classifier is None:
        return "unknown", 0.0
    
    try:
        candidate_labels = ["medical prescription", "not medical prescription"]
        result = classifier(text, candidate_labels)
        
        predicted_label = result["labels"][0]
        confidence = result["scores"][0]
        
        # Medical keywords for heuristic check
        medical_keywords = [
            "prescribed", "take", "mg", "ml", "mcg", "capsules", "tablets", "dosage",
            "dr.", "doctor", "patient", "medications", "apply", "signature",
            "clinic", "pharmacy", "rx", "dose", "medicine", "drug", "tablet",
            "syrup", "injection", "ointment", "cream", "drops", "inhaler",
            "morning", "evening", "daily", "twice", "thrice", "before meals", "after meals"
        ]
        
        text_lower = text.lower()
        has_medical_keywords = any(keyword in text_lower for keyword in medical_keywords)
        
        # Adjust prediction based on heuristics
        if predicted_label == "not medical prescription" and has_medical_keywords:
            predicted_label = "medical prescription"
            confidence = max(confidence, 0.75)
        elif predicted_label == "medical prescription" and not has_medical_keywords:
            predicted_label = "not medical prescription"
            confidence = max(confidence, 0.75)
        
        return predicted_label, confidence
        
    except Exception as e:
        print(f"Classification Error: {e}")
        return "error", 0.0

@app.route('/')
def home():
    """Simple web interface for testing"""
    html = """
    <!DOCTYPE html>
    <html>
    <head>
        <title>Prescription Reader OCR</title>
        <style>
            body { font-family: Arial, sans-serif; max-width: 800px; margin: 0 auto; padding: 20px; }
            .upload-area { border: 2px dashed #ccc; padding: 40px; text-align: center; margin: 20px 0; }
            .result { background: #f5f5f5; padding: 20px; margin: 20px 0; border-radius: 5px; }
            button { background: #007bff; color: white; padding: 10px 20px; border: none; border-radius: 5px; cursor: pointer; }
            button:hover { background: #0056b3; }
        </style>
    </head>
    <body>
        <h1>🔍 Prescription Reader OCR</h1>
        <p>Upload a prescription image to extract text and analyze it.</p>
        
        <div class="upload-area">
            <input type="file" id="imageInput" accept="image/*" style="display: none;">
            <button onclick="document.getElementById('imageInput').click()">Choose Image</button>
            <p>Or drag and drop an image here</p>
        </div>
        
        <button onclick="analyzeImage()" id="analyzeBtn" style="display: none;">Analyze Prescription</button>
        
        <div id="results" class="result" style="display: none;">
            <h3>Results:</h3>
            <div id="resultContent"></div>
        </div>
        
        <script>
            let selectedFile = null;
            
            document.getElementById('imageInput').addEventListener('change', function(e) {
                selectedFile = e.target.files[0];
                if (selectedFile) {
                    document.getElementById('analyzeBtn').style.display = 'block';
                }
            });
            
            function analyzeImage() {
                if (!selectedFile) return;
                
                const formData = new FormData();
                formData.append('image', selectedFile);
                
                document.getElementById('resultContent').innerHTML = 'Analyzing...';
                document.getElementById('results').style.display = 'block';
                
                fetch('/analyze-prescription', {
                    method: 'POST',
                    body: formData
                })
                .then(response => response.json())
                .then(data => {
                    if (data.success) {
                        document.getElementById('resultContent').innerHTML = `
                            <h4>Extracted Text:</h4>
                            <p>${data.extracted_text}</p>
                            <h4>Classification:</h4>
                            <p><strong>${data.classification}</strong> (Confidence: ${(data.confidence * 100).toFixed(1)}%)</p>
                        `;
                    } else {
                        document.getElementById('resultContent').innerHTML = `<p style="color: red;">Error: ${data.error}</p>`;
                    }
                })
                .catch(error => {
                    document.getElementById('resultContent').innerHTML = `<p style="color: red;">Error: ${error.message}</p>`;
                });
            }
        </script>
    </body>
    </html>
    """
    return html

@app.route('/analyze-prescription', methods=['POST'])
def analyze_prescription():
    """API endpoint to analyze prescription images"""
    try:
        if 'image' not in request.files:
            return jsonify({'success': False, 'error': 'No image provided'}), 400
        
        file = request.files['image']
        if file.filename == '':
            return jsonify({'success': False, 'error': 'No image selected'}), 400
        
        # Read and process image
        image_bytes = file.read()
        image = Image.open(io.BytesIO(image_bytes))
        
        # Extract text using OCR
        extracted_text = extract_text_from_image(image)
        
        # Extract structured medicine information
        medicines = extract_medicine_info(extracted_text)
        
        # Classify the text
        classification, confidence = classify_prescription(extracted_text)
        
        return jsonify({
            'success': True,
            'medicines': medicines,
            'classification': classification,
            'confidence': confidence,
            'is_prescription': classification == "medical prescription"
        })
        
    except Exception as e:
        return jsonify({'success': False, 'error': str(e)}), 500

@app.route('/health')
def health():
    """Health check endpoint"""
    model_status = "loaded" if (processor is not None and donut_model is not None and classifier is not None) else "not loaded"
    return jsonify({
        'status': 'healthy',
        'service': 'prescription-reader',
        'models': model_status,
        'device': device
    })

if __name__ == '__main__':
    print("🔍 Starting Prescription Reader OCR Service...")
    
    # Initialize models
    if initialize_models():
        print("✅ All models loaded successfully!")
        print("🚀 Starting Flask server on port 5009...")
        app.run(host='0.0.0.0', port=5009, debug=True)
    else:
        print("❌ Failed to load models. Please run: python model_download.py")
        print("💡 Or check if the model files exist in the 'model' directory")