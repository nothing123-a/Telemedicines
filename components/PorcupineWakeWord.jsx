"use client";

import { useEffect, useRef, useState } from 'react';

export default function PorcupineWakeWord({ onWakeWordDetected }) {
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState('');
  const workerRef = useRef(null);
  const webVoiceProcessorRef = useRef(null);

  useEffect(() => {
    initializePorcupine();
    return () => cleanup();
  }, []);

  const initializePorcupine = async () => {
    try {
      // Load Porcupine Web SDK
      if (typeof window !== 'undefined') {
        // Check if scripts are loaded
        if (!window.PorcupineWeb || !window.WebVoiceProcessor) {
          // Dynamically load scripts
          await loadScripts();
        }

        const accessKey = "6PYLS0t6bAGUrZriAoDXbgXTXjeBR4x2GQ/eiNybJ25XBkRStSfLFQ==";
        
        // Create Porcupine worker with Hey Genie keyword
        workerRef.current = await window.PorcupineWeb.PorcupineWorker.create(
          accessKey,
          {
            // For custom keyword file, you'd use:
            // publicPath: "/hey_genie.ppn",
            // customWritePath: "hey_genie"
            
            // For now, using built-in keyword for testing
            builtin: "picovoice" // Change to your custom keyword when ready
          },
          (detection) => {
            console.log('Wake word detected:', detection);
            if (onWakeWordDetected) {
              onWakeWordDetected(detection);
            }
          }
        );

        // Start voice processing
        await window.WebVoiceProcessor.WebVoiceProcessor.subscribe(workerRef.current);
        
        setIsInitialized(true);
        console.log('Porcupine wake word detection initialized');
        
      }
    } catch (error) {
      console.error('Failed to initialize Porcupine:', error);
      setError(error.message);
    }
  };

  const loadScripts = () => {
    return new Promise((resolve, reject) => {
      let scriptsLoaded = 0;
      const totalScripts = 2;

      const checkComplete = () => {
        scriptsLoaded++;
        if (scriptsLoaded === totalScripts) {
          resolve();
        }
      };

      // Load Porcupine Web
      const porcupineScript = document.createElement('script');
      porcupineScript.src = 'https://unpkg.com/@picovoice/porcupine-web/dist/iife/index.js';
      porcupineScript.onload = checkComplete;
      porcupineScript.onerror = () => reject(new Error('Failed to load Porcupine Web'));
      document.head.appendChild(porcupineScript);

      // Load Web Voice Processor
      const voiceProcessorScript = document.createElement('script');
      voiceProcessorScript.src = 'https://unpkg.com/@picovoice/web-voice-processor/dist/iife/index.js';
      voiceProcessorScript.onload = checkComplete;
      voiceProcessorScript.onerror = () => reject(new Error('Failed to load Web Voice Processor'));
      document.head.appendChild(voiceProcessorScript);
    });
  };

  const cleanup = async () => {
    try {
      if (workerRef.current && window.WebVoiceProcessor) {
        await window.WebVoiceProcessor.WebVoiceProcessor.unsubscribe(workerRef.current);
        workerRef.current.release();
        workerRef.current.terminate();
      }
    } catch (error) {
      console.error('Cleanup error:', error);
    }
  };

  // This component doesn't render anything visible
  return null;
}