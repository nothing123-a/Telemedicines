// lib/escalationService.js
const EscalationRequest = require('../models/EscalationRequest');

class EscalationService {
  constructor() {
    this.io = null;
  }

  setSocketIO(io) {
    this.io = io;
  }

  async triggerEscalation(userId, riskAnalysis, userMessage) {
    try {
      // Create escalation record
      const escalation = new EscalationRequest({
        userId,
        riskLevel: riskAnalysis.risk_level,
        confidence: riskAnalysis.confidence,
        triggerMessage: userMessage,
        status: 'pending',
        timestamp: new Date()
      });
      
      await escalation.save();

      // Notify via Socket.IO
      if (this.io) {
        this.io.emit('escalation_triggered', {
          userId,
          escalationId: escalation._id,
          riskLevel: riskAnalysis.risk_level,
          confidence: riskAnalysis.confidence
        });
      }

      // TODO: Integrate WhatsApp API notification
      await this._notifyEmergencyContact(userId, escalation);
      
      // TODO: Connect available doctor
      await this._connectDoctor(userId, escalation);

      return escalation;
    } catch (error) {
      console.error('Escalation failed:', error);
      throw error;
    }
  }

  async _notifyEmergencyContact(userId, escalation) {
    // TODO: Implement WhatsApp API integration
    console.log(`[PLACEHOLDER] Notifying emergency contact for user ${userId}`);
    console.log(`Escalation ID: ${escalation._id}, Risk: ${escalation.riskLevel}`);
  }

  async _connectDoctor(userId, escalation) {
    // TODO: Implement doctor connection logic
    console.log(`[PLACEHOLDER] Connecting doctor for user ${userId}`);
    console.log(`Escalation ID: ${escalation._id}, Risk: ${escalation.riskLevel}`);
  }
}

module.exports = new EscalationService();