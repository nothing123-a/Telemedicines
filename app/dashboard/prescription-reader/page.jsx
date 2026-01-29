"use client";
import { useState } from 'react';

export default function PrescriptionReaderPage() {
  const [selectedFile, setSelectedFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [preview, setPreview] = useState(null);
  const [dragOver, setDragOver] = useState(false);

  const handleFileSelect = (file) => {
    if (file) {
      setSelectedFile(file);
      setAnalysis(null);
      
      // Create preview
      const reader = new FileReader();
      reader.onload = (e) => setPreview(e.target.result);
      reader.readAsDataURL(file);
    }
  };

  const handleInputChange = (event) => {
    const file = event.target.files[0];
    handleFileSelect(file);
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file && file.type.startsWith('image/')) {
      handleFileSelect(file);
    }
  };

  const analyzeImage = async () => {
    if (!selectedFile) return;

    setLoading(true);
    
    try {
      const formData = new FormData();
      formData.append('image', selectedFile);

      const response = await fetch('/api/prescription-reader', {
        method: 'POST',
        body: formData
      });

      const data = await response.json();
      
      if (data.success) {
        setAnalysis(data);
      } else {
        alert('Error: ' + data.error);
      }
    } catch (error) {
      alert('Error analyzing prescription: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const clearAll = () => {
    setSelectedFile(null);
    setAnalysis(null);
    setPreview(null);
  };

  return (
    <div className="p-3 sm:p-6 max-w-full sm:max-w-4xl mx-auto w-full overflow-x-hidden">
      <h1 className="text-2xl sm:text-3xl font-bold mb-4 sm:mb-6 text-center">🔍 Prescription Reader</h1>
      <p className="text-gray-600 text-center mb-6 sm:mb-8 text-sm sm:text-base px-2">
        Upload a prescription image to extract text and verify if it's a valid medical prescription
      </p>

      {/* Upload Section */}
      <div 
        className={`bg-white border-2 border-dashed rounded-lg p-4 sm:p-8 text-center mb-4 sm:mb-6 transition-colors ${
          dragOver ? 'border-blue-500 bg-blue-50' : 'border-gray-300'
        }`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          type="file"
          accept="image/*"
          onChange={handleInputChange}
          className="hidden"
          id="imageInput"
        />
        
        {!preview ? (
          <div>
            <div className="text-6xl mb-4">📄</div>
            <label htmlFor="imageInput" className="cursor-pointer">
              <div className="bg-blue-500 text-white px-6 py-3 rounded-lg hover:bg-blue-600 inline-block">
                Choose Prescription Image
              </div>
            </label>
            <p className="text-gray-500 mt-2">Or drag and drop an image here</p>
            <p className="text-gray-400 text-sm">PNG, JPG, JPEG up to 10MB</p>
          </div>
        ) : (
          <div>
            <img src={preview} alt="Preview" className="max-w-full sm:max-w-md max-h-48 sm:max-h-64 mx-auto mb-4 rounded-lg shadow-lg" />
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-4 sm:space-x-0">
              <button
                onClick={analyzeImage}
                disabled={loading}
                className="bg-green-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-green-600 disabled:bg-gray-300 text-sm sm:text-base"
              >
                {loading ? 'Analyzing...' : 'Analyze Prescription'}
              </button>
              <button
                onClick={clearAll}
                className="bg-gray-500 text-white px-4 sm:px-6 py-2 rounded-lg hover:bg-gray-600 text-sm sm:text-base"
              >
                Clear
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Results Section */}
      {analysis && (
        <div className="bg-white border rounded-lg p-4 sm:p-6 shadow-lg">
          <h2 className="text-2xl font-semibold mb-4">📋 Analysis Results</h2>
          
          {/* Classification */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-2">Classification:</h3>
            <div className={`inline-flex items-center px-4 py-2 rounded-full text-sm font-medium ${
              analysis.is_prescription 
                ? 'bg-green-100 text-green-800' 
                : 'bg-red-100 text-red-800'
            }`}>
              {analysis.is_prescription ? '✅ Valid Medical Prescription' : '❌ Not a Medical Prescription'}
            </div>
            <div className="mt-2 text-sm text-gray-600">
              Confidence: {(analysis.confidence * 100).toFixed(1)}%
            </div>
          </div>

          {/* Medicine Information */}
          <div className="mb-6">
            <h3 className="text-lg font-semibold mb-4">💊 Prescribed Medicines:</h3>
            {analysis.medicines && analysis.medicines.length > 0 ? (
              <div className="space-y-3">
                {analysis.medicines.map((medicine, index) => (
                  <div key={index} className="bg-white border rounded-lg p-4 shadow-sm">
                    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-2 sm:gap-4">
                      <div>
                        <label className="text-sm font-medium text-gray-600">Medicine Name</label>
                        <div className="text-lg font-semibold text-blue-600">{medicine.name}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Dosage</label>
                        <div className="text-lg font-semibold text-green-600">{medicine.dosage}</div>
                      </div>
                      <div>
                        <label className="text-sm font-medium text-gray-600">Frequency</label>
                        <div className="text-lg font-semibold text-orange-600">{medicine.frequency}</div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="bg-gray-50 p-4 rounded-lg border text-center text-gray-500">
                No medicines could be extracted from the prescription
              </div>
            )}
          </div>

          {/* Additional Info */}
          {analysis.is_prescription && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-blue-800 mb-2">💊 Prescription Detected</h3>
              <p className="text-blue-700 text-sm">
                This appears to be a valid medical prescription. Please verify the details with your healthcare provider 
                and follow the prescribed dosage instructions carefully.
              </p>
            </div>
          )}

          {analysis.fallback && (
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mt-4">
              <h3 className="text-lg font-semibold text-yellow-800 mb-2">⚠️ Service Notice</h3>
              <p className="text-yellow-700 text-sm">
                The OCR service is currently unavailable. Please try again later.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Instructions */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold mb-3">📝 How to use:</h3>
        <ol className="list-decimal list-inside space-y-2 text-sm text-gray-700">
          <li>Take a clear photo of your prescription or upload an existing image</li>
          <li>Make sure the text is readable and well-lit</li>
          <li>Click "Analyze Prescription" to extract and verify the text</li>
          <li>Review the extracted information for accuracy</li>
          <li>Always consult your healthcare provider for medical advice</li>
        </ol>
      </div>
    </div>
  );
}