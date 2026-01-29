'use client';

import { useState } from 'react';
import { dataAgentAPI } from '@/lib/apiClient';

export default function UploadPage() {
  const [patientNote, setPatientNote] = useState('');
  const [patientJsonText, setPatientJsonText] = useState('');
  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await dataAgentAPI.ingestPatientData({
        patientNote: patientNote || null,
        patientJsonText: patientJsonText || null,
        images: Array.from(images)
      });
      setResult(response);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-2xl mx-auto p-6">
      <h1 className="text-2xl font-bold mb-6">Patient Data Upload</h1>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium mb-2">Patient Note</label>
          <textarea
            value={patientNote}
            onChange={(e) => setPatientNote(e.target.value)}
            className="w-full p-3 border rounded-md"
            rows={4}
            placeholder="Enter patient notes..."
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Patient JSON Data</label>
          <textarea
            value={patientJsonText}
            onChange={(e) => setPatientJsonText(e.target.value)}
            className="w-full p-3 border rounded-md"
            rows={3}
            placeholder='{"age": 45, "gender": "M", "blood_pressure": "140/90"}'
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-2">Medical Images (JPG/PNG)</label>
          <input
            type="file"
            multiple
            accept="image/jpeg,image/png,image/jpg"
            onChange={(e) => setImages(e.target.files)}
            className="w-full p-3 border rounded-md"
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white py-3 px-4 rounded-md hover:bg-blue-700 disabled:opacity-50"
        >
          {loading ? 'Processing...' : 'Submit Patient Data'}
        </button>
      </form>

      {error && (
        <div className="mt-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          Error: {error}
        </div>
      )}

      {result && (
        <div className="mt-6 p-4 bg-green-100 border border-green-400 rounded">
          <h3 className="font-bold text-green-800 mb-4">Patient Bundle Created</h3>
          
          <div className="space-y-3">
            <div>
              <span className="font-semibold">Request ID:</span> {result.request_id}
            </div>
            
            <div>
              <span className="font-semibold">Created At:</span> {new Date(result.created_at).toLocaleString()}
            </div>
            
            <div>
              <span className="font-semibold">Content Types:</span> {result.content_types.join(', ')}
            </div>
            
            {result.patient_note && (
              <div>
                <span className="font-semibold">Patient Note:</span>
                <p className="mt-1 p-2 bg-white border rounded text-sm">{result.patient_note}</p>
              </div>
            )}
            
            {result.patient_structured && (
              <div>
                <span className="font-semibold">Structured Data:</span>
                <pre className="mt-1 p-2 bg-white border rounded text-sm overflow-auto">
                  {JSON.stringify(result.patient_structured, null, 2)}
                </pre>
              </div>
            )}
            
            {result.images && result.images.length > 0 && (
              <div>
                <span className="font-semibold">Images:</span>
                <div className="mt-2 space-y-4">
                  {result.images.map((image, index) => (
                    <div key={index} className="p-2 bg-white border rounded">
                      <div className="text-sm mb-2">
                        <strong>Filename:</strong> {image.filename}
                      </div>
                      <div className="text-sm mb-2">
                        <strong>Type:</strong> {image.mime_type}
                      </div>
                      <div className="text-sm mb-3">
                        <strong>URI:</strong> 
                        <a 
                          href={`${process.env.NEXT_PUBLIC_API_URL}${image.uri}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline ml-1"
                        >
                          {image.uri}
                        </a>
                      </div>
                      <img 
                        src={`${process.env.NEXT_PUBLIC_API_URL}${image.uri}`}
                        alt={image.filename}
                        className="max-w-full h-auto max-h-64 border rounded"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}