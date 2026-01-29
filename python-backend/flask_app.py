from flask import Flask, request, jsonify
from flask_cors import CORS
import os
import re
from dotenv import load_dotenv
import PyPDF2
import io
import google.generativeai as genai

load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure Gemini
api_key = os.getenv('GEMINI_API_KEY')
print(f"Using Gemini API key: {api_key}")
genai.configure(api_key=api_key)
model = genai.GenerativeModel('gemini-1.5-flash')

def extract_pdf_text(pdf_bytes):
    """Extract text from PDF bytes"""
    try:
        pdf_reader = PyPDF2.PdfReader(io.BytesIO(pdf_bytes))
        text = ""
        for page in pdf_reader.pages:
            text += page.extract_text()
        return text
    except Exception as e:
        print(f"PDF extraction error: {e}")
        return ""

def extract_values_manually(text):
    """Extract medical values using regex patterns"""
    values = []
    text_lower = text.lower()
    
    # Blood pressure patterns
    bp_patterns = [
        r'(\d{2,3})/(\d{2,3})\s*mmhg',
        r'blood pressure[:\s]*(\d{2,3})/(\d{2,3})',
        r'bp[:\s]*(\d{2,3})/(\d{2,3})'
    ]
    
    for pattern in bp_patterns:
        matches = re.finditer(pattern, text_lower)
        for match in matches:
            sys_val = int(match.group(1))
            dia_val = int(match.group(2))
            status = 'Normal' if sys_val < 120 and dia_val < 80 else 'Elevated'
            values.append(f"Blood Pressure: {sys_val}/{dia_val} mmHg (Normal: <120/80) - {status}")
    
    # Lab values
    lab_patterns = [
        (r'hemoglobin[:\s]*(\d+\.?\d*)\s*g/dl', 'Hemoglobin', 'g/dL', 12, 16),
        (r'glucose[:\s]*(\d+)\s*mg/dl', 'Glucose', 'mg/dL', 70, 100),
        (r'cholesterol[:\s]*(\d+)\s*mg/dl', 'Cholesterol', 'mg/dL', 0, 200)
    ]
    
    for pattern, name, unit, min_val, max_val in lab_patterns:
        matches = re.finditer(pattern, text_lower)
        for match in matches:
            val = float(match.group(1))
            if val < min_val:
                status = 'Low'
            elif val > max_val:
                status = 'High'
            else:
                status = 'Normal'
            values.append(f"{name}: {val} {unit} (Normal: {min_val}-{max_val}) - {status}")
    
    return {
        "summary": "Medical values extracted using pattern matching",
        "key_values": values if values else ["No medical values found in standard format"],
        "findings": ["Automated extraction completed"],
        "suggestions": ["Review values with healthcare provider"],
        "risk_level": "Medium" if any('High' in v or 'Elevated' in v for v in values) else "Low",
        "confidence": 0.7,
        "method": "regex-extraction"
    }

def analyze_with_gemini(text):
    """Analyze medical report using Gemini AI"""
    if not text or len(text.strip()) < 10:
        return {
            "summary": "No readable text found in document",
            "key_values": ["Text extraction failed"],
            "findings": ["Document may be image-based or corrupted"],
            "suggestions": ["Try uploading a text-based PDF"],
            "risk_level": "Unknown",
            "confidence": 0.1,
            "method": "no-text"
        }
    
    try:
        # Direct analysis without test
        prompt = f"""Extract medical values from this report:

{text[:8000]}

Find:
- Blood pressure readings
- Lab values (hemoglobin, glucose, etc.)
- Vital signs

Format as: Parameter: Value (Normal range) - Status"""
        
        print(f"Sending to Gemini...")
        response = model.generate_content(prompt)
        print(f"Gemini response: {response.text[:100]}...")
        
        if response and response.text:
            print(f"Gemini response received: {len(response.text)} characters")
            
            # Parse the response to extract clean values
            response_lines = response.text.strip().split('\n')
            clean_values = []
            
            for line in response_lines:
                line = line.strip()
                if line and (':' in line or 'mmHg' in line or 'g/dL' in line or 'mg/dL' in line):
                    # Remove bullet points and clean up
                    clean_line = line.replace('- ', '').replace('• ', '').replace('* ', '')
                    if any(medical_term in clean_line.lower() for medical_term in 
                          ['pressure', 'hemoglobin', 'glucose', 'cholesterol', 'heart rate', 'bpm', 'mmhg', 'g/dl', 'mg/dl']):
                        clean_values.append(clean_line)
            
            if not clean_values:
                clean_values = ["No medical values detected in this report"]
            
            return {
                "summary": "Medical values extracted from report",
                "key_values": clean_values,
                "findings": ["Medical parameters identified"],
                "suggestions": ["Consult healthcare provider for interpretation"],
                "risk_level": "Medium",
                "confidence": 0.8,
                "method": "gemini-medical"
            }
        else:
            raise Exception("Empty response from Gemini")
        
    except Exception as e:
        print(f"Gemini failed: {str(e)}")
        print("Using manual extraction as fallback...")
        return extract_values_manually(text)

def parse_gemini_response(response_text):
    """Parse Gemini response into structured format"""
    try:
        sections = {}
        current_section = None
        
        lines = response_text.split('\n')
        for line in lines:
            line = line.strip()
            if line.startswith('SUMMARY:'):
                current_section = 'summary'
                sections[current_section] = line.replace('SUMMARY:', '').strip()
            elif line.startswith('NUMERICAL VALUES:'):
                current_section = 'values'
                sections[current_section] = []
            elif line.startswith('KEY FINDINGS:'):
                current_section = 'findings'
                sections[current_section] = []
            elif line.startswith('RECOMMENDATIONS:'):
                current_section = 'suggestions'
                sections[current_section] = []
            elif line.startswith('RISK ASSESSMENT:'):
                sections['risk_level'] = line.replace('RISK ASSESSMENT:', '').strip()
            elif line and current_section in ['values', 'findings', 'suggestions']:
                if line.startswith('-') or line.startswith('•'):
                    sections[current_section].append(line[1:].strip())
                elif line and not line.isupper():
                    sections[current_section].append(line)
        
        return {
            "summary": sections.get('summary', 'Medical report analyzed'),
            "key_values": sections.get('values', []),
            "findings": sections.get('findings', ['Report processed successfully']),
            "suggestions": sections.get('suggestions', ['Maintain regular health checkups']),
            "risk_level": sections.get('risk_level', 'Low'),
            "confidence": 0.9,
            "method": "gemini-ai"
        }
        
    except Exception as e:
        print(f"Response parsing error: {e}")
        return fallback_analysis("")

def fallback_analysis(text):
    """Fallback keyword-based analysis"""
    text_lower = text.lower()
    
    findings = []
    suggestions = []
    values = []
    risk_level = "Low"
    
    # Extract common medical values
    if 'hemoglobin' in text_lower or 'hb' in text_lower:
        hb_match = re.search(r'h[ae]moglobin[:\s]*(\d+\.?\d*)', text_lower)
        if hb_match:
            hb_val = float(hb_match.group(1))
            values.append(f"Hemoglobin: {hb_val} g/dL")
            if hb_val < 12:
                findings.append("Low hemoglobin detected")
                suggestions.append("Consider iron-rich foods and supplements")
                risk_level = "Medium"
    
    if 'glucose' in text_lower:
        glucose_match = re.search(r'glucose[:\s]*(\d+)', text_lower)
        if glucose_match:
            glucose_val = int(glucose_match.group(1))
            values.append(f"Glucose: {glucose_val} mg/dL")
            if glucose_val > 140:
                findings.append("Elevated glucose levels")
                suggestions.append("Monitor blood sugar and consider dietary changes")
                risk_level = "High"
    
    if not findings:
        findings = ["Medical parameters within expected ranges"]
    
    # Extract more values using regex patterns
    if not values:
        patterns = [
            (r'hemoglobin[:\s]*(\d+\.?\d*)\s*g/dl', 'Hemoglobin', 'g/dL', (12, 16)),
            (r'hb[:\s]*(\d+\.?\d*)\s*g/dl', 'Hemoglobin', 'g/dL', (12, 16)),
            (r'glucose[:\s]*(\d+)\s*mg/dl', 'Glucose', 'mg/dL', (70, 100)),
            (r'cholesterol[:\s]*(\d+)\s*mg/dl', 'Cholesterol', 'mg/dL', (0, 200)),
            (r'wbc[:\s]*(\d+\.?\d*)', 'WBC Count', '/μL', (4000, 11000)),
            (r'rbc[:\s]*(\d+\.?\d*)', 'RBC Count', 'million/μL', (4.5, 5.5))
        ]
        
        for pattern, name, unit, (min_val, max_val) in patterns:
            matches = re.finditer(pattern, text_lower)
            for match in matches:
                val = float(match.group(1))
                if val < min_val:
                    status = 'Low'
                elif val > max_val:
                    status = 'High'
                else:
                    status = 'Normal'
                values.append(f"{name}: {val} {unit} (Normal: {min_val}-{max_val}) - {status}")
        
        # Blood pressure pattern
        bp_matches = re.finditer(r'(\d{2,3})/(\d{2,3})\s*mmhg', text_lower)
        for match in bp_matches:
            sys_val = int(match.group(1))
            dia_val = int(match.group(2))
            status = 'Normal' if sys_val < 120 and dia_val < 80 else 'Elevated'
            values.append(f"Blood Pressure: {sys_val}/{dia_val} mmHg (Normal: <120/80) - {status}")
    
    if not suggestions:
        suggestions = ["Continue regular health monitoring", "Maintain healthy lifestyle"]
    
    return {
        "summary": "Medical report processed with keyword analysis",
        "key_values": values if values else ["No numerical values found in report"],
        "findings": findings,
        "suggestions": suggestions,
        "risk_level": risk_level,
        "confidence": 0.7,
        "method": "keyword-fallback"
    }

@app.route('/analyze-report', methods=['POST'])
def analyze_report():
    try:
        if 'file' not in request.files:
            return jsonify({"error": "No file provided"}), 400
        
        file = request.files['file']
        if file.filename == '':
            return jsonify({"error": "No file selected"}), 400
        
        # Read file content
        file_content = file.read()
        
        # Extract text based on file type
        if file.filename.lower().endswith('.pdf'):
            extracted_text = extract_pdf_text(file_content)
        else:
            extracted_text = file_content.decode('utf-8', errors='ignore')
        
        print(f"Extracted text length: {len(extracted_text)}")
        print(f"First 200 chars: {extracted_text[:200]}")
        
        if not extracted_text.strip():
            return jsonify({"error": "Could not extract text from file"}), 400
        
        # Analyze with Gemini AI
        analysis = analyze_with_gemini(extracted_text)
        
        return jsonify({
            "success": True,
            "filename": file.filename,
            "extracted_text": extracted_text[:5000],  # Show first 5000 chars for preview
            "full_text_length": len(extracted_text),
            "analysis": analysis
        })
        
    except Exception as e:
        print(f"Analysis error: {e}")
        return jsonify({"error": str(e)}), 500

@app.route('/health', methods=['GET'])
def health():
    return jsonify({"status": "healthy", "service": "gemini-medical-analyzer"})

if __name__ == '__main__':
    port = int(os.getenv('PORT', 8002))
    app.run(host='0.0.0.0', port=port, debug=True)