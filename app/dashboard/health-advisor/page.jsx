"use client";

import { useState } from "react";
import { FileText, Upload, Brain, ExternalLink, Loader2 } from "lucide-react";
import ReportDownload from "@/components/ReportDownload";

export default function HealthAdvisorPage() {
  const [file, setFile] = useState(null);
  const [reportText, setReportText] = useState("");
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileUpload = async (e) => {
    const uploadedFile = e.target.files[0];
    if (uploadedFile && uploadedFile.type === "application/pdf") {
      setFile(uploadedFile);
      setLoading(true);
      
      try {
        const formData = new FormData();
        formData.append('file', uploadedFile);
        
        const response = await fetch('/api/health-advisor/upload', {
          method: 'POST',
          body: formData
        });
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const contentType = response.headers.get('content-type');
        if (!contentType || !contentType.includes('application/json')) {
          const text = await response.text();
          throw new Error('Server returned non-JSON response: ' + text.substring(0, 100));
        }
        
        const data = await response.json();
        if (data.success) {
          setReportText(data.text);
          console.log(`PDF processed: ${data.wordCount} words, ${data.text.length} characters`);
          alert(`✅ PDF processed successfully! Extracted ${data.wordCount} words.`);
        } else {
          alert('PDF extraction failed: ' + data.error);
        }
      } catch (error) {
        alert('Upload failed: ' + error.message);
      } finally {
        setLoading(false);
      }
    }
  };

  const analyzeReport = async () => {
    if (!reportText.trim()) return;

    setLoading(true);
    try {
      const response = await fetch("/api/health-advisor", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reportText }),
      });

      const data = await response.json();
      if (data.success) {
        setResult(data.data);
      } else {
        alert("Analysis failed: " + data.error);
      }
    } catch (error) {
      alert("Error: " + error.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full h-full space-y-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-gradient-to-br from-purple-500 to-pink-600 rounded-lg flex items-center justify-center">
          <Brain className="w-5 h-5 text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-blue-800">Health Report Advisor</h1>
          <p className="text-blue-600">AI-powered medical report analysis and recommendations</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Input Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800 mb-4 flex items-center gap-2">
            <Upload className="w-5 h-5" />
            Upload Report
          </h2>

          <div className="space-y-4">
            <div className="border-2 border-dashed border-blue-200 rounded-lg p-6 text-center">
              <FileText className="w-12 h-12 text-blue-400 mx-auto mb-2" />
              <p className="text-blue-600 mb-2">Upload PDF Report</p>
              <input
                type="file"
                accept=".pdf"
                onChange={handleFileUpload}
                className="hidden"
                id="file-upload"
                disabled={loading}
              />
              <label
                htmlFor="file-upload"
                className={`px-4 py-2 rounded-lg cursor-pointer ${
                  loading 
                    ? 'bg-gray-400 cursor-not-allowed' 
                    : 'bg-blue-500 hover:bg-blue-600'
                } text-white`}
              >
                {loading ? 'Processing...' : 'Choose PDF File'}
              </label>
              {file && (
                <div className="mt-2">
                  <p className="text-sm text-green-600">✅ {file.name}</p>
                  <p className="text-xs text-blue-500">PDF uploaded successfully - text extracted</p>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-blue-700 mb-2">
                Or paste your report text:
              </label>
              <textarea
                value={reportText}
                onChange={(e) => setReportText(e.target.value)}
                className="w-full h-32 p-3 border border-blue-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Paste your medical report text here..."
              />
            </div>

            <button
              onClick={analyzeReport}
              disabled={loading || !reportText.trim()}
              className="w-full bg-gradient-to-r from-purple-500 to-pink-600 text-white py-3 rounded-lg font-medium hover:from-purple-600 hover:to-pink-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  Analyzing...
                </>
              ) : (
                <>
                  <Brain className="w-4 h-4" />
                  Analyze Report
                </>
              )}
            </button>
          </div>
        </div>

        {/* Results Section */}
        <div className="bg-white rounded-xl p-6 shadow-lg border border-blue-100">
          <h2 className="text-xl font-semibold text-blue-800 mb-4">Analysis Results</h2>
          
          {!result ? (
            <div className="text-center py-12 text-blue-400">
              <Brain className="w-16 h-16 mx-auto mb-4 opacity-50" />
              <p>Upload and analyze a report to see results</p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Articles */}
              {result.articles?.length > 0 && (
                <div>
                  <h3 className="font-semibold text-blue-700 mb-2">📚 Related Articles</h3>
                  <div className="space-y-2">
                    {result.articles.slice(0, 5).map((article, idx) => (
                      <div key={idx} className="bg-purple-50 p-3 rounded-lg">
                        <a
                          href={article.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-purple-700 font-medium hover:text-purple-800 flex items-center gap-1"
                        >
                          {article.title}
                          <ExternalLink className="w-3 h-3" />
                        </a>
                        <p className="text-xs text-purple-600 mt-1">{article.snippet}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
              
              {/* Download Report */}
              <ReportDownload result={result} reportText={reportText} />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}