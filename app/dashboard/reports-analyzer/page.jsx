'use client';

import { useState } from 'react';
import { Upload, FileText, BarChart3, Brain } from 'lucide-react';

export default function ReportsAnalyzer() {
  const [file, setFile] = useState(null);
  const [analysis, setAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const selectedFile = e.target.files[0];
    if (!selectedFile) return;

    setFile(selectedFile);
    setLoading(true);

    try {
      const formData = new FormData();
      formData.append('file', selectedFile);

      const response = await fetch('/api/reports/upload', {
        method: 'POST',
        body: formData,
      });

      const result = await response.json();
      setAnalysis(result);
    } catch (error) {
      console.error('Analysis failed:', error);
      setAnalysis({ error: 'Analysis failed' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex items-center gap-3 mb-8">
            <Brain className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-800">SMART REPORTS ANALYZER</h1>
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-8">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Upload Medical Report</h3>
            <p className="text-gray-500 mb-4">Support: PDF, CSV, Excel files</p>
            <input
              type="file"
              accept=".pdf,.csv,.xlsx,.xls"
              onChange={handleFileUpload}
              className="hidden"
              id="file-upload"
            />
            <label
              htmlFor="file-upload"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 cursor-pointer"
            >
              <Upload className="w-5 h-5 mr-2" />
              Choose File
            </label>
          </div>

          {/* Loading */}
          {loading && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
              <p className="mt-4 text-gray-600">Analyzing report with AI...</p>
            </div>
          )}

          {/* Results */}
          {analysis && !loading && (
            <div className="space-y-8">
              {analysis.error ? (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                  <p className="text-red-600">Error: {analysis.error}</p>
                </div>
              ) : (
                <>
                  {/* Summary */}
                  <div className="bg-green-50 border border-green-200 rounded-lg p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <FileText className="w-5 h-5 text-green-600" />
                      <h3 className="text-lg font-semibold text-green-800">AI Summary</h3>
                    </div>
                    <p className="text-green-700">{analysis.summary}</p>
                  </div>

                  {/* Main Analysis Results */}
                  {analysis.analysis && (
                    <div className="space-y-6">
                      {/* AI Summary */}
                      <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg p-6">
                        <div className="flex items-center gap-2 mb-4">
                          <Brain className="w-6 h-6 text-blue-600" />
                          <h3 className="text-xl font-bold text-blue-800">AI Medical Analysis</h3>
                        </div>
                        <div className="bg-white rounded-lg p-4 border-l-4 border-blue-500">
                          <p className="text-gray-800 leading-relaxed">{analysis.analysis.summary}</p>
                        </div>
                      </div>
                      <div className="space-y-4">
                        {analysis.analysis.key_values && analysis.analysis.key_values.length > 0 && (
                          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-4">
                            <h4 className="font-semibold text-blue-800 mb-3 flex items-center">
                              <span className="mr-2">📊</span> Numerical Values
                            </h4>
                            <div className="grid gap-3">
                              {analysis.analysis.key_values.map((value, idx) => {
                                const isAbnormal = value.toLowerCase().includes('high') || value.toLowerCase().includes('low') || value.toLowerCase().includes('abnormal') || value.toLowerCase().includes('elevated');
                                const isNormal = value.toLowerCase().includes('normal') || value.toLowerCase().includes('within range');
                                
                                return (
                                  <div key={idx} className={`p-3 rounded-lg border-l-4 ${
                                    isAbnormal ? 'border-red-500 bg-red-50' : 
                                    isNormal ? 'border-green-500 bg-green-50' : 
                                    'border-blue-500 bg-blue-50'
                                  }`}>
                                    <div className="flex items-center justify-between">
                                      <span className={`font-medium text-sm ${
                                        isAbnormal ? 'text-red-800' : 
                                        isNormal ? 'text-green-800' : 
                                        'text-blue-800'
                                      }`}>{value}</span>
                                      <span className={`text-xs px-2 py-1 rounded-full ${
                                        isAbnormal ? 'bg-red-200 text-red-800' : 
                                        isNormal ? 'bg-green-200 text-green-800' : 
                                        'bg-blue-200 text-blue-800'
                                      }`}>
                                        {isAbnormal ? '⚠️ Abnormal' : isNormal ? '✅ Normal' : '📊 Value'}
                                      </span>
                                    </div>
                                  </div>
                                );
                              })}
                            </div>
                          </div>
                        )}
                        <div className="grid md:grid-cols-2 gap-4">
                          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h4 className="font-semibold text-yellow-800 mb-3 flex items-center">
                              <span className="mr-2">🔍</span> Key Findings
                            </h4>
                            <ul className="space-y-2">
                              {analysis.analysis.findings.map((finding, idx) => (
                                <li key={idx} className="text-yellow-700 text-sm flex items-start">
                                  <span className="mr-2 mt-1">•</span>
                                  <span>{finding}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <h4 className="font-semibold text-green-800 mb-3 flex items-center">
                              <span className="mr-2">💡</span> Recommendations
                            </h4>
                            <ul className="space-y-2">
                              {(analysis.analysis.suggestions || analysis.analysis.recommendations || []).map((rec, idx) => (
                                <li key={idx} className="text-green-700 text-sm flex items-start">
                                  <span className="mr-2 mt-1">✓</span>
                                  <span>{rec}</span>
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className={`px-3 py-1 rounded-full text-sm ${
                            (analysis.analysis.risk_level || analysis.analysis.riskLevel) === 'High' ? 'bg-red-100 text-red-800' :
                            (analysis.analysis.risk_level || analysis.analysis.riskLevel) === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                            'bg-green-100 text-green-800'
                          }`}>
                            Risk Level: {analysis.analysis.risk_level || analysis.analysis.riskLevel}
                          </span>
                          <span className="text-sm text-gray-600">
                            Confidence: {Math.round(analysis.analysis.confidence * 100)}%
                          </span>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Document Preview */}
                  {analysis.extractedText && (
                    <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
                      <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                        <span className="mr-2">📄</span> Document Preview
                      </h3>
                      <div className="bg-white border rounded-lg p-4 max-h-96 overflow-y-auto">
                        <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono leading-relaxed">
                          {analysis.extractedText}
                        </pre>
                      </div>
                      <div className="mt-3 text-xs text-gray-500">
                        📊 Showing extracted text from: {analysis.filename}
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}