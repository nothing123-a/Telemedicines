const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8001';

export const dataAgentAPI = {
  async ingestPatientData({ patientNote, patientJsonText, images }) {
    const formData = new FormData();
    
    if (patientNote) {
      formData.append('patient_note', patientNote);
    }
    
    if (patientJsonText) {
      formData.append('patient_json_text', patientJsonText);
    }
    
    if (images && images.length > 0) {
      images.forEach(image => {
        formData.append('images', image);
      });
    }
    
    const response = await fetch(`${API_BASE_URL}/ingest`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.detail?.error || error.detail || 'Request failed');
    }
    
    return await response.json();
  },

  async healthCheck() {
    const response = await fetch(`${API_BASE_URL}/health`);
    return await response.json();
  }
};