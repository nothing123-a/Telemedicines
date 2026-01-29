'use client';

import { useState, useEffect } from 'react';
import { Upload, Eye, Download, Trash2, FileText, Image, File, Lock, User } from 'lucide-react';

export default function PersonalDocuments() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showAuth, setShowAuth] = useState(true);
  const [authMode, setAuthMode] = useState('login');
  const [credentials, setCredentials] = useState({ name: '', password: '' });
  const [documents, setDocuments] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape') setShowPreview(false);
    };
    if (showPreview) {
      document.addEventListener('keydown', handleEsc);
      return () => document.removeEventListener('keydown', handleEsc);
    }
  }, [showPreview]);
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(null);

  useEffect(() => {
    const savedToken = localStorage.getItem('docToken');
    const savedUser = localStorage.getItem('docUser');
    if (savedToken && savedUser) {
      setToken(savedToken);
      setUser(JSON.parse(savedUser));
      setIsAuthenticated(true);
      setShowAuth(false);
      fetchDocuments(savedToken);
    }
  }, []);

  const handleAuth = async () => {
    try {
      const endpoint = authMode === 'login' ? '/api/documents/login' : '/api/documents/register';
      const payload = authMode === 'login' 
        ? { email: credentials.name, password: credentials.password }
        : { name: credentials.name, email: credentials.name, password: credentials.password };
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      const data = await response.json();
      
      if (data.success) {
        localStorage.setItem('docToken', data.token);
        localStorage.setItem('docUser', JSON.stringify(data.user));
        setToken(data.token);
        setUser(data.user);
        setIsAuthenticated(true);
        setShowAuth(false);
        fetchDocuments(data.token);
      } else {
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      alert('Authentication failed');
    }
  };

  const fetchDocuments = async (authToken = token) => {
    try {
      const response = await fetch('/api/documents/files', {
        headers: {
          'Authorization': `Bearer ${authToken}`
        }
      });
      const data = await response.json();
      setDocuments(data.documents || []);
    } catch (error) {
      console.error('Error fetching documents:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const allowedTypes = ['application/pdf', 'image/jpeg', 'image/png', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'];
    if (!allowedTypes.includes(file.type)) {
      alert('Only PDF, JPG, PNG, and DOCX files are allowed');
      return;
    }

    setUploading(true);
    
    const reader = new FileReader();
    reader.onload = async () => {
      try {
        const response = await fetch('/api/documents/files', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}`
          },
          body: JSON.stringify({
            name: file.name,
            type: file.type,
            size: file.size,
            data: reader.result,
            tags: '',
            description: ''
          })
        });
        
        if (response.ok) {
          fetchDocuments();
        }
      } catch (error) {
        alert('Upload failed');
      } finally {
        setUploading(false);
      }
    };
    
    reader.readAsDataURL(file);
  };

  const deleteDocument = async (docId) => {
    if (confirm('Are you sure you want to delete this document?')) {
      try {
        const response = await fetch(`/api/documents/files/${docId}`, {
          method: 'DELETE',
          headers: {
            'Authorization': `Bearer ${token}`
          }
        });
        
        if (response.ok) {
          fetchDocuments();
        }
      } catch (error) {
        alert('Delete failed');
      }
    }
  };

  const downloadDocument = (doc) => {
    const link = document.createElement('a');
    link.href = doc.data;
    link.download = doc.name;
    link.click();
  };

  const updateDocumentInfo = async (docId, field, value) => {
    try {
      await fetch(`/api/documents/files/${docId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ [field]: value })
      });
      
      const updatedDocs = documents.map(doc => 
        doc._id === docId ? { ...doc, [field]: value } : doc
      );
      setDocuments(updatedDocs);
    } catch (error) {
      console.error('Update failed:', error);
    }
  };

  const getFileIcon = (type) => {
    if (type.includes('pdf')) return <FileText className="w-8 h-8 text-red-500" />;
    if (type.includes('image')) return <Image className="w-8 h-8 text-blue-500" />;
    return <File className="w-8 h-8 text-gray-500" />;
  };

  const formatFileSize = (bytes) => {
    return (bytes / 1024 / 1024).toFixed(2) + ' MB';
  };

  const logout = () => {
    localStorage.removeItem('docToken');
    localStorage.removeItem('docUser');
    setToken(null);
    setUser(null);
    setIsAuthenticated(false);
    setShowAuth(true);
    setCredentials({ name: '', password: '' });
    setDocuments([]);
  };

  if (showAuth) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-2xl p-8 w-full max-w-md border-2 border-black">
          <div className="text-center mb-6">
            <Lock className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-black">Secure Document Access</h1>
            <p className="text-black mt-2">
              {authMode === 'login' ? 'Enter your credentials' : 'Create your account'}
            </p>
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-black mb-1">Name</label>
              <input
                type="text"
                value={credentials.name}
                onChange={(e) => setCredentials({...credentials, name: e.target.value})}
                className="w-full p-3 border-2 border-black rounded-xl text-black"
                placeholder="Enter your name"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-black mb-1">Password</label>
              <input
                type="password"
                value={credentials.password}
                onChange={(e) => setCredentials({...credentials, password: e.target.value})}
                className="w-full p-3 border-2 border-black rounded-xl text-black"
                placeholder="Enter your password"
              />
            </div>
            <button
              onClick={handleAuth}
              className="w-full bg-blue-600 text-black py-3 rounded-xl hover:bg-blue-700 border-2 border-black font-semibold"
            >
              {authMode === 'login' ? 'Login' : 'Register'}
            </button>
            <button
              onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
              className="w-full text-black underline"
            >
              {authMode === 'login' ? 'Create new account' : 'Already have account? Login'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-black">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <FileText className="w-8 h-8 text-blue-600" />
              <h1 className="text-3xl font-bold text-black">Personal Documents</h1>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-black">Welcome, {user?.name}</span>
              <button
                onClick={logout}
                className="px-4 py-2 bg-red-600 text-black rounded-xl hover:bg-red-700 border-2 border-black font-semibold"
              >
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Upload Section */}
        <div className="bg-white rounded-2xl shadow-xl p-6 mb-8 border-2 border-black">
          <h2 className="text-xl font-semibold text-black mb-4">Upload Document</h2>
          <div className="border-2 border-dashed border-black rounded-xl p-8 text-center">
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p className="text-black mb-4">Upload PDF, JPG, PNG, or DOCX files</p>
            <input
              type="file"
              onChange={handleFileUpload}
              accept=".pdf,.jpg,.jpeg,.png,.docx"
              className="hidden"
              id="fileUpload"
              disabled={uploading}
            />
            <label
              htmlFor="fileUpload"
              className="bg-blue-600 text-black px-6 py-3 rounded-xl hover:bg-blue-700 cursor-pointer border-2 border-black font-semibold inline-block"
            >
              {uploading ? 'Uploading...' : 'Choose File'}
            </label>
          </div>
        </div>

        {/* Documents List */}
        <div className="bg-white rounded-2xl shadow-xl p-6 border-2 border-black">
          <h2 className="text-xl font-semibold text-black mb-6">Your Documents ({documents.length})</h2>
          
          {documents.length === 0 ? (
            <div className="text-center py-12">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <p className="text-black">No documents uploaded yet</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {documents.map((doc) => (
                <div key={doc._id} className="border-2 border-black rounded-xl p-4 hover:shadow-lg transition-shadow">
                  <div className="flex items-center gap-3 mb-3">
                    {getFileIcon(doc.type)}
                    <div className="flex-1">
                      <h3 className="font-semibold text-black truncate">{doc.name}</h3>
                      <p className="text-sm text-black">{formatFileSize(doc.size)}</p>
                    </div>
                  </div>
                  
                  <p className="text-xs text-black mb-3">
                    Uploaded: {new Date(doc.uploadDate).toLocaleDateString()}
                  </p>

                  <div className="space-y-2 mb-4">
                    <input
                      type="text"
                      placeholder="Add tags..."
                      value={doc.tags}
                      onChange={(e) => updateDocumentInfo(doc._id, 'tags', e.target.value)}
                      className="w-full p-2 border-2 border-black rounded-lg text-black text-sm"
                    />
                    <textarea
                      placeholder="Add description..."
                      value={doc.description}
                      onChange={(e) => updateDocumentInfo(doc._id, 'description', e.target.value)}
                      className="w-full p-2 border-2 border-black rounded-lg text-black text-sm h-16"
                    />
                  </div>

                  <div className="flex gap-2">
                    <button
                      onClick={() => {setSelectedDoc(doc); setShowPreview(true);}}
                      className="flex-1 bg-blue-600 text-black py-2 px-3 rounded-xl hover:bg-blue-700 text-sm border-2 border-black"
                    >
                      <Eye className="w-4 h-4 inline mr-1" />
                      View
                    </button>
                    <button
                      onClick={() => downloadDocument(doc)}
                      className="flex-1 bg-green-600 text-black py-2 px-3 rounded-xl hover:bg-green-700 text-sm border-2 border-black"
                    >
                      <Download className="w-4 h-4 inline mr-1" />
                      Download
                    </button>
                    <button
                      onClick={() => deleteDocument(doc._id)}
                      className="p-2 text-black hover:text-red-600 border-2 border-black rounded-xl"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Preview Modal */}
        {showPreview && selectedDoc && (
          <div className="fixed inset-0 bg-black bg-opacity-90 z-50">
            <div className="bg-white h-full w-full flex flex-col">
              <div className="flex justify-between items-center p-4 border-b-2 border-black bg-white">
                <h3 className="text-lg font-semibold text-black">{selectedDoc.name}</h3>
                <div className="mr-16">
                  <button
                    onClick={() => setShowPreview(false)}
                    className="bg-blue-600 text-black px-6 py-3 rounded-xl hover:bg-blue-700 border-2 border-black font-bold"
                  >
                    Done
                  </button>
                </div>
              </div>
              <div className="flex-1 p-4 overflow-auto">
                {selectedDoc.type.includes('image') ? (
                  <img src={selectedDoc.data} alt={selectedDoc.name} className="w-full h-full object-contain" />
                ) : selectedDoc.type.includes('pdf') ? (
                  <iframe src={selectedDoc.data} className="w-full h-full" />
                ) : (
                  <div className="flex items-center justify-center h-full">
                    <div className="text-center">
                      <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                      <p className="text-black mb-4">Preview not available for this file type</p>
                      <button
                        onClick={() => downloadDocument(selectedDoc)}
                        className="bg-blue-600 text-black px-6 py-2 rounded-xl hover:bg-blue-700 border-2 border-black"
                      >
                        Download to View
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}