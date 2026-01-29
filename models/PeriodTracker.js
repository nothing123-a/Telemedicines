import mongoose from "mongoose";

const PeriodTrackerSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    // Cycle tracking
    cycles: [{
      startDate: { type: Date, required: true },
      endDate: { type: Date },
      cycleLength: { type: Number },
      flowIntensity: [{
        date: { type: Date },
        intensity: { type: String, enum: ["spotting", "light", "medium", "heavy"] }
      }]
    }],
    
    // Symptoms tracking
    symptoms: [{
      date: { type: Date, required: true },
      physical: [{
        type: String,
        enum: ["cramps", "headaches", "bloating", "acne", "breast_tenderness", "fatigue", "back_pain", "nausea"]
      }],
      mood: [{
        type: String, 
        enum: ["irritability", "sadness", "anxiety", "happiness", "mood_swings", "depression", "energy_high", "energy_low"]
      }],
      cravings: [String],
      notes: String
    }],

    // Settings & Preferences
    settings: {
      cycleLength: { type: Number, default: 28 },
      periodLength: { type: Number, default: 5 },
      reminderSettings: {
        periodReminder: { type: Boolean, default: true },
        fertilityReminder: { type: Boolean, default: true },
        pillReminder: { type: Boolean, default: false },
        pillTime: String
      },
      discreetMode: { type: Boolean, default: false },
      emergencyContact: {
        name: String,
        phone: String,
        relationship: String
      }
    },

    // Health conditions
    healthConditions: {
      hasPCOS: { type: Boolean, default: false },
      irregularCycles: { type: Boolean, default: false },
      onBirthControl: { type: Boolean, default: false },
      birthControlType: String
    },

    // Lifestyle tracking
    lifestyle: [{
      date: { type: Date },
      sleep: Number, // hours
      exercise: { type: String, enum: ["none", "light", "moderate", "intense"] },
      waterIntake: Number, // glasses
      weight: Number
    }]
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.PeriodTracker || mongoose.model("PeriodTracker", PeriodTrackerSchema);