"use client";

import { useState } from "react";
import { Upload, Brain, Activity, AlertCircle, CheckCircle, FileText } from "lucide-react";

const getAnalysisDetails = (scanType) => {
  const details = {
    mri: [
      "Brain tumors and lesions detection",
      "White matter abnormalities",
      "Structural brain changes",
      "Hemorrhage and stroke signs",
      "Ventricular enlargement",
      "Mass effect evaluation"
    ],
    xray: [
      "Bone fractures and breaks",
      "Pneumonia detection",
      "Tuberculosis screening",
      "Joint abnormalities",
      "Foreign object detection",
      "Bone density assessment"
    ],
    chest: [
      "Lung field asymmetry",
      "Cardiomegaly detection",
      "Pleural effusion",
      "Pneumothorax identification",
      "Pulmonary edema",
      "Mediastinal abnormalities"
    ],
    kidney: [
      "Kidney cysts detection",
      "Kidney stones identification",
      "Organ size assessment",
      "Structural abnormalities",
      "Hydronephrosis signs",
      "Renal atrophy evaluation"
    ],
    heart: [
      "Cardiomegaly assessment",
      "Ventricular hypertrophy",
      "Wall motion abnormalities",
      "Valve calcification",
      "Pericardial effusion",
      "Chamber size evaluation"
    ],
    skin: [
      "Melanoma risk assessment",
      "Irregular pigmentation",
      "Border irregularities",
      "Lesion size analysis",
      "Color variation detection",
      "Asymmetry evaluation"
    ],
    liver: [
      "Fatty liver detection",
      "Liver texture analysis",
      "Nodular lesions",
      "Hepatomegaly assessment",
      "Cirrhosis signs",
      "Liver density evaluation"
    ]
  };
  return details[scanType] || [];
};

export default function ScanAnalyzer({ scanType, title, description, iconName }) {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState("");
  const [analysisProgress, setAnalysisProgress] = useState(0);

  const handleFileUpload = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      setFile(selectedFile);
      setError("");
      setResult(null);
    }
  };

  const analyzeScan = async () => {
    if (!file) return;

    setLoading(true);
    setError("");
    setResult(null);
    setAnalysisProgress(0);

    // Simulate real-time progress
    const progressInterval = setInterval(() => {
      setAnalysisProgress(prev => {
        if (prev >= 90) {
          clearInterval(progressInterval);
          return 90;
        }
        return prev + Math.random() * 15;
      });
    }, 200);

    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('scan_type', scanType);

      const response = await fetch('http://localhost:5003/analyze', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();

      clearInterval(progressInterval);
      setAnalysisProgress(100);

      if (data.error) {
        setError(data.error);
      } else {
        // Add processing time simulation
        setTimeout(() => {
          setResult(data);
        }, 500);
      }
    } catch (err) {
      clearInterval(progressInterval);
      setError("Failed to analyze scan. Please ensure the scan analyzer service is running.");
    } finally {
      setTimeout(() => {
        setLoading(false);
        setAnalysisProgress(0);
      }, 1000);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              {iconName === 'Brain' && <Brain className="text-white w-6 h-6" />}
              {iconName === 'Zap' && <Activity className="text-white w-6 h-6" />}
              {iconName === 'Stethoscope' && <Activity className="text-white w-6 h-6" />}
              {iconName === 'Droplets' && <Activity className="text-white w-6 h-6" />}
              {iconName === 'Heart' && <Activity className="text-white w-6 h-6" />}
              {iconName === 'Eye' && <Activity className="text-white w-6 h-6" />}
              {iconName === 'Activity' && <Activity className="text-white w-6 h-6" />}
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">{title}</h1>
              <p className="text-gray-600">{description}</p>
            </div>
          </div>
          
          {/* Real-time Analysis Badge */}
          <div className="flex items-center gap-2 mb-4">
            <div className="flex items-center gap-2 bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm">
              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              Real-time AI Analysis
            </div>
            <div className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-sm">
              ⚡ Instant Results
            </div>
          </div>
          
          {/* Detailed Description */}
          <div className="bg-gray-50 rounded-lg p-4">
            <h3 className="font-semibold text-gray-900 mb-2">What this analysis detects:</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm text-gray-700">
              {getAnalysisDetails(scanType).map((detail, index) => (
                <div key={index} className="flex items-center gap-2">
                  <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                  <span>{detail}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 mb-6">
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Upload {title}</h3>
            <p className="text-gray-600 mb-4">Supports JPG, PNG, DICOM formats</p>
            
            <input
              type="file"
              accept="image/*"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 cursor-pointer transition-colors"
            >
              <Upload className="w-4 h-4" />
              Choose File
            </label>
            
            {file && (
              <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                <p className="text-blue-800 font-medium">{file.name}</p>
                <p className="text-blue-600 text-sm">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
              </div>
            )}
          </div>

          {file && (
            <div className="mt-6">
              <div className="text-center mb-4">
                <button
                  onClick={analyzeScan}
                  disabled={loading}
                  className="bg-gradient-to-r from-blue-600 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                >
                  {loading ? (
                    <div className="flex items-center gap-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      Analyzing...
                    </div>
                  ) : (
                    `Analyze ${title}`
                  )}
                </button>
              </div>
              
              {/* Real-time Progress Bar */}
              {loading && (
                <div className="bg-gray-200 rounded-full h-2 mb-4">
                  <div 
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${analysisProgress}%` }}
                  ></div>
                </div>
              )}
              
              {/* Analysis Steps */}
              {loading && (
                <div className="bg-blue-50 rounded-lg p-4">
                  <h4 className="font-semibold text-blue-900 mb-2">Real-time Analysis Progress:</h4>
                  <div className="space-y-2 text-sm">
                    <div className={`flex items-center gap-2 ${analysisProgress > 20 ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${analysisProgress > 20 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Image preprocessing and enhancement
                    </div>
                    <div className={`flex items-center gap-2 ${analysisProgress > 50 ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${analysisProgress > 50 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      AI pattern recognition
                    </div>
                    <div className={`flex items-center gap-2 ${analysisProgress > 80 ? 'text-green-600' : 'text-gray-500'}`}>
                      <div className={`w-2 h-2 rounded-full ${analysisProgress > 80 ? 'bg-green-500' : 'bg-gray-300'}`}></div>
                      Generating medical insights
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Error */}
        {error && (
          <div className="bg-red-50 border border-red-200 rounded-2xl p-4 mb-6">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <p className="text-red-800">{error}</p>
            </div>
          </div>
        )}

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Status */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <div className="flex items-center gap-3 mb-4">
                {result.status === 'Normal' ? (
                  <CheckCircle className="w-8 h-8 text-green-600" />
                ) : (
                  <AlertCircle className="w-8 h-8 text-red-600" />
                )}
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{result.scan_type}</h3>
                  <p className={`text-lg font-medium ${result.status === 'Normal' ? 'text-green-600' : 'text-red-600'}`}>
                    Status: {result.status}
                  </p>
                </div>
              </div>
              
              {/* Validation Message */}
              {result.validation_message && (
                <div className={`p-3 rounded-lg border-l-4 ${result.image_validated ? 'bg-green-50 border-green-500' : 'bg-yellow-50 border-yellow-500'}`}>
                  <p className={`text-sm ${result.image_validated ? 'text-green-700' : 'text-yellow-700'}`}>
                    <strong>Image Validation:</strong> {result.validation_message}
                  </p>
                </div>
              )}
            </div>

            {/* Detected Conditions */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-600" />
                Detected Conditions
              </h3>
              <div className="space-y-3">
                {result.detected_conditions.map((condition, index) => (
                  <div key={index} className={`p-3 rounded-lg border-l-4 ${
                    result.status === 'Normal' ? 'bg-green-50 border-green-500' : 'bg-red-50 border-red-500'
                  }`}>
                    <p className="font-medium text-gray-900">{condition}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* Confidence Scores */}
            {Object.keys(result.confidence_scores || {}).length > 0 && (
              <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Confidence Scores</h3>
                <div className="space-y-3">
                  {Object.entries(result.confidence_scores).map(([condition, score]) => (
                    <div key={condition} className="flex items-center justify-between">
                      <span className="text-gray-700">{condition}</span>
                      <div className="flex items-center gap-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div 
                            className="bg-blue-600 h-2 rounded-full" 
                            style={{ width: `${score * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium text-gray-600">
                          {(score * 100).toFixed(1)}%
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Recommendations */}
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-green-600" />
                Medical Recommendations
              </h3>
              <div className="space-y-3">
                {result.recommendations.map((rec, index) => {
                  const isUrgent = rec.toLowerCase().includes('urgent') || rec.toLowerCase().includes('immediate');
                  return (
                    <div key={index} className={`p-3 rounded-lg border-l-4 ${
                      isUrgent ? 'bg-red-50 border-red-500' : 'bg-blue-50 border-blue-500'
                    }`}>
                      <p className={isUrgent ? 'text-red-800 font-semibold' : 'text-gray-800'}>
                        {isUrgent && '⚠️ '}{rec}
                      </p>
                    </div>
                  );
                })}
              </div>
              
              {/* Disclaimer */}
              <div className="mt-4 p-3 bg-gray-50 rounded-lg border border-gray-200">
                <p className="text-xs text-gray-600">
                  <strong>Disclaimer:</strong> This AI analysis is for screening purposes only and should not replace professional medical diagnosis. Always consult with a qualified healthcare provider for proper medical evaluation.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}