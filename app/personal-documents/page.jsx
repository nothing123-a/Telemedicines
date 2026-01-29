'use client';

import { useState, useEffect } from 'react';
import { Upload, FileText, User, Lock, Eye, EyeOff, Download, Trash2 } from 'lucide-react';

export default function PersonalDocuments() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLogin, setIsLogin] = useState(true);
  const [showPassword, setShowPassword] = useState(false);
  const [documents, setDocuments] = useState([]);
  const [loading, setLoading] = useState(false);
  const [user, setUser] = useState(null);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [showPreview, setShowPreview] = useState(false);
  
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    phone: ''
  });

  useEffect(() => {
    const token = localStorage.getItem('docToken');
    if (token) {
      verifyToken(token);
    }
  }, []);

  const verifyToken = async (token) => {
    try {
      console.log('🔍 Verifying token by fetching documents...');
      const response = await fetch('/api/documents/files', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      console.log('Token verification response:', response.status);
      
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          console.log('✅ Token valid, user data:', data.user);
          setIsAuthenticated(true);
          setUser(data.user);
          setDocuments(data.documents);
        }
      } else {
        console.log('❌ Token invalid, removing...');
        localStorage.removeItem('docToken');
      }
    } catch (error) {
      console.log('❌ Token verification error:', error);
      localStorage.removeItem('docToken');
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    // Validation
    if (!isLogin && !formData.name.trim()) {
      alert('Name is required for registration');
      setLoading(false);
      return;
    }

    if (!formData.email.trim() || !formData.password.trim()) {
      alert('Email and password are required');
      setLoading(false);
      return;
    }

    try {
      const endpoint = isLogin ? '/api/documents/login' : '/api/documents/register';
      const payload = isLogin 
        ? { email: formData.email.trim(), password: formData.password }
        : { ...formData, email: formData.email.trim() };
      
      console.log('🔄 Submitting to:', endpoint);
      console.log('📤 Payload:', payload);
      console.log('🔐 Is Login:', isLogin);
      
      const response = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      console.log('📡 Response status:', response.status);
      console.log('📡 Response ok:', response.ok);
      
      const text = await response.text();
      console.log('📜 Raw response:', text);
      
      if (!text) {
        throw new Error('Empty response from server');
      }
      
      const data = JSON.parse(text);
      console.log('📥 Response data:', data);

      if (data.success) {
        console.log('✅ Success!');
        if (isLogin) {
          console.log('🔑 Storing token and logging in...');
          localStorage.setItem('docToken', data.token);
          setIsAuthenticated(true);
          setUser(data.user);
          fetchDocuments(data.token);
        } else {
          console.log('📝 Registration complete, switching to login...');
          alert('Registration successful! Please login.');
          setIsLogin(true);
          setFormData({ name: '', email: formData.email, password: '', phone: '' });
        }
      } else {
        console.log('❌ Error:', data.error);
        alert(data.error || 'Authentication failed');
      }
    } catch (error) {
      console.error('Auth error:', error);
      alert('Network error. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const fetchDocuments = async (token) => {
    try {
      const authToken = token || localStorage.getItem('docToken');
      console.log('🔍 Fetching documents with token:', authToken ? authToken.substring(0, 20) + '...' : 'NO TOKEN');
      
      if (!authToken) {
        console.log('❌ No token available');
        return;
      }
      
      const response = await fetch('/api/documents/files', {
        headers: { 'Authorization': `Bearer ${authToken}` }
      });
      
      console.log('📡 Fetch response status:', response.status);
      
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          console.log('✅ Documents fetched:', data.documents?.length || 0);
          setDocuments(data.documents || []);
        }
      } else {
        console.log('❌ Fetch failed:', response.status);
        if (response.status === 401) {
          console.log('🔑 Token expired, clearing auth');
          localStorage.removeItem('docToken');
          setIsAuthenticated(false);
          setUser(null);
        }
      }
    } catch (error) {
      console.error('❌ Fetch error:', error);
    }
  };

  const handleFileUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem('docToken');
    console.log('📤 Uploading file:', file.name, 'with token:', token ? token.substring(0, 20) + '...' : 'NO TOKEN');
    
    if (!token) {
      alert('Please login first');
      return;
    }
    
    try {
      const payload = {
        fileName: file.name || 'untitled',
        fileType: file.type || 'application/octet-stream',
        fileSize: file.size || 0
      };
      
      console.log('📤 Sending payload:', payload);
      
      const response = await fetch('/api/documents/files', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      console.log('📡 Upload response status:', response.status);
      
      if (response.ok) {
        const text = await response.text();
        if (text) {
          const data = JSON.parse(text);
          console.log('✅ Upload successful:', data);
          fetchDocuments();
          alert('Document uploaded successfully!');
        }
      } else {
        const errorText = await response.text();
        console.log('❌ Upload failed:', response.status, errorText);
        alert(`Upload failed: ${response.status}`);
      }
    } catch (error) {
      console.error('❌ Upload error:', error);
      alert('Upload error: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('docToken');
    setIsAuthenticated(false);
    setUser(null);
    setDocuments([]);
    setFormData({ name: '', email: '', password: '', phone: '' });
  };

  const handleViewDocument = (doc) => {
    setSelectedDoc(doc);
    setShowPreview(true);
  };

  const handleDownloadDocument = (doc) => {
    // Create download link
    const link = document.createElement('a');
    link.href = `data:${doc.fileType};base64,${btoa(doc.fileName)}`; // Placeholder for actual file data
    link.download = doc.fileName;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleDeleteDocument = async (docId) => {
    if (!confirm('Are you sure you want to delete this document?')) return;
    
    const token = localStorage.getItem('docToken');
    try {
      const response = await fetch(`/api/documents/files/${docId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      
      if (response.ok) {
        fetchDocuments();
        alert('Document deleted successfully!');
      } else {
        alert('Delete failed');
      }
    } catch (error) {
      alert('Delete error');
    }
  };

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 w-full max-w-md">
          <div className="text-center mb-8">
            <FileText className="w-16 h-16 text-blue-600 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-gray-800">Personal Documents</h1>
            <p className="text-gray-600">Secure document storage</p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                <input
                  type="text"
                  required
                  value={formData.name}
                  onChange={(e) => setFormData({...formData, name: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
              <input
                type="email"
                required
                value={formData.email}
                onChange={(e) => setFormData({...formData, email: e.target.value})}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  required
                  value={formData.password}
                  onChange={(e) => setFormData({...formData, password: e.target.value})}
                  className="w-full px-3 py-2 pr-10 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone (Optional)</label>
                <input
                  type="tel"
                  value={formData.phone}
                  onChange={(e) => setFormData({...formData, phone: e.target.value})}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center"
            >
              {loading ? (
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
              ) : (
                <>
                  {isLogin ? <Lock className="w-4 h-4 mr-2" /> : <User className="w-4 h-4 mr-2" />}
                  {isLogin ? 'Login' : 'Register'}
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <button
              onClick={() => {
                console.log('🔄 Switching mode from', isLogin ? 'login' : 'register', 'to', !isLogin ? 'login' : 'register');
                setIsLogin(!isLogin);
                setFormData({ name: '', email: '', password: '', phone: '' });
              }}
              className="text-blue-600 hover:text-blue-800 text-sm"
            >
              {isLogin ? "Don't have an account? Register" : "Already have an account? Login"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-gray-800">Personal Documents</h1>
              <p className="text-gray-600">Welcome back, {user?.name}</p>
            </div>
            <button
              onClick={handleLogout}
              className="bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
            >
              Logout
            </button>
          </div>

          {/* Upload Section */}
          <div className="border-2 border-dashed border-gray-300 rounded-xl p-8 text-center mb-8">
            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-700 mb-2">Upload Document</h3>
            <p className="text-gray-500 mb-4">PDF, Images, or other files</p>
            <input
              type="file"
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

          {/* Documents List */}
          <div className="space-y-4">
            <h3 className="text-xl font-semibold text-gray-800">Your Documents</h3>
            {documents.length === 0 ? (
              <p className="text-gray-500 text-center py-8">No documents uploaded yet</p>
            ) : (
              <div className="grid gap-4">
                {documents.map((doc) => (
                  <div key={doc.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center">
                        <FileText className="w-8 h-8 text-blue-600 mr-3" />
                        <div>
                          <h4 className="font-medium text-gray-800">{doc.fileName}</h4>
                          <p className="text-sm text-gray-500">
                            {new Date(doc.uploadDate).toLocaleDateString()} • {(doc.fileSize / 1024).toFixed(1)} KB
                          </p>
                        </div>
                      </div>
                      <span className="px-2 py-1 bg-green-100 text-green-800 text-xs rounded-full">
                        {doc.status}
                      </span>
                    </div>
                    
                    <div className="flex gap-2">
                      <button
                        onClick={() => handleViewDocument(doc)}
                        className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-lg hover:bg-blue-700 flex items-center justify-center"
                      >
                        <Eye className="w-4 h-4 mr-2" />
                        View
                      </button>
                      <button
                        onClick={() => handleDownloadDocument(doc)}
                        className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 flex items-center justify-center"
                      >
                        <Download className="w-4 h-4 mr-2" />
                        Download
                      </button>
                      <button
                        onClick={() => handleDeleteDocument(doc.id)}
                        className="bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Document Preview Modal */}
      {showPreview && selectedDoc && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-4xl max-h-[90vh] w-full overflow-hidden">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-xl font-semibold text-gray-800">{selectedDoc.fileName}</h3>
              <button
                onClick={() => setShowPreview(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                <Eye className="w-6 h-6" />
              </button>
            </div>
            <div className="p-6 overflow-auto max-h-[70vh]">
              <div className="text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h4 className="text-lg font-medium text-gray-800 mb-2">{selectedDoc.fileName}</h4>
                <p className="text-gray-600 mb-4">
                  Type: {selectedDoc.fileType} | Size: {(selectedDoc.fileSize / 1024).toFixed(1)} KB
                </p>
                <p className="text-gray-500 mb-6">
                  Uploaded: {new Date(selectedDoc.uploadDate).toLocaleDateString()}
                </p>
                <div className="flex gap-4 justify-center">
                  <button
                    onClick={() => handleDownloadDocument(selectedDoc)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 flex items-center"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Download
                  </button>
                  <button
                    onClick={() => setShowPreview(false)}
                    className="bg-gray-600 text-white px-6 py-2 rounded-lg hover:bg-gray-700"
                  >
                    Close
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}