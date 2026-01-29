"use client";

import { useState, useEffect, useRef } from 'react';

export default function GenieDebugger() {
  const [logs, setLogs] = useState([]);
  const [isListening, setIsListening] = useState(false);
  const [testResponse, setTestResponse] = useState('');
  
  const recognitionRef = useRef(null);
  const synthRef = useRef(null);

  const addLog = (message) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    console.log(message);
  };

  useEffect(() => {
    addLog('🧞♂️ Genie Debugger initialized');
    initializeComponents();
  }, []);

  const initializeComponents = () => {
    // Test Speech Recognition
    if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
      addLog('✅ Speech Recognition supported');
      const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
      recognitionRef.current = new SpeechRecognition();
      recognitionRef.current.continuous = false;
      recognitionRef.current.interimResults = false;
      recognitionRef.current.lang = 'en-US';

      recognitionRef.current.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        addLog(`🎤 Heard: "${transcript}"`);
        testGenieAPI(transcript);
      };

      recognitionRef.current.onerror = (event) => {
        addLog(`❌ STT Error: ${event.error}`);
        setIsListening(false);
      };

      recognitionRef.current.onend = () => {
        addLog('🎤 STT ended');
        setIsListening(false);
      };
    } else {
      addLog('❌ Speech Recognition not supported');
    }

    // Test Speech Synthesis
    if ('speechSynthesis' in window) {
      addLog('✅ Speech Synthesis supported');
      synthRef.current = window.speechSynthesis;
      
      // List available voices
      const voices = synthRef.current.getVoices();
      addLog(`🔊 Available voices: ${voices.length}`);
    } else {
      addLog('❌ Speech Synthesis not supported');
    }
  };

  const testGenieAPI = async (query) => {
    addLog(`🧠 Testing Genie API with: "${query}"`);
    
    try {
      const response = await fetch('/api/genie-chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ message: query }),
      });

      const data = await response.json();
      
      if (data.success) {
        addLog('✅ Genie API success');
        addLog(`🤖 Response: "${data.response}"`);
        setTestResponse(data.response);
        testTTS(data.response);
      } else {
        addLog(`❌ Genie API error: ${data.error}`);
      }
    } catch (error) {
      addLog(`❌ Request failed: ${error.message}`);
    }
  };

  const testTTS = (text) => {
    addLog(`🔊 Testing TTS with: "${text}"`);
    
    if (synthRef.current && text) {
      synthRef.current.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.9;
      utterance.volume = 1.0;
      
      utterance.onstart = () => addLog('🔊 TTS started');
      utterance.onend = () => addLog('🔊 TTS ended');
      utterance.onerror = (e) => addLog(`❌ TTS error: ${e.error}`);
      
      synthRef.current.speak(utterance);
    }
  };

  const startListening = () => {
    if (recognitionRef.current) {
      addLog('🎤 Starting speech recognition...');
      setIsListening(true);
      recognitionRef.current.start();
    }
  };

  const testWakeWord = () => {
    addLog('🧞♂️ Testing wake word detection...');
    testGenieAPI('Hey Genie');
  };

  const testQuickQueries = () => {
    const queries = [
      'Hello, how are you?',
      'I need mental health support',
      'What can you help me with?'
    ];
    
    queries.forEach((query, index) => {
      setTimeout(() => {
        testGenieAPI(query);
      }, index * 3000);
    });
  };

  const clearLogs = () => {
    setLogs([]);
  };

  return (
    <div className="fixed bottom-4 left-4 w-96 h-96 bg-white border-2 border-purple-500 rounded-lg shadow-lg z-50 overflow-hidden">
      {/* Header */}
      <div className="bg-purple-500 text-white p-2 flex justify-between items-center">
        <h3 className="font-bold">🧞♂️ Genie Debugger</h3>
        <button onClick={clearLogs} className="text-xs bg-purple-600 px-2 py-1 rounded">
          Clear
        </button>
      </div>

      {/* Controls */}
      <div className="p-2 border-b flex flex-wrap gap-1">
        <button
          onClick={startListening}
          disabled={isListening}
          className="text-xs bg-blue-500 text-white px-2 py-1 rounded disabled:opacity-50"
        >
          {isListening ? 'Listening...' : 'Test STT'}
        </button>
        <button
          onClick={testWakeWord}
          className="text-xs bg-green-500 text-white px-2 py-1 rounded"
        >
          Test Wake Word
        </button>
        <button
          onClick={testQuickQueries}
          className="text-xs bg-orange-500 text-white px-2 py-1 rounded"
        >
          Test Queries
        </button>
        <button
          onClick={() => testTTS('Hello! I am Genie. How can I assist you?')}
          className="text-xs bg-red-500 text-white px-2 py-1 rounded"
        >
          Test TTS
        </button>
      </div>

      {/* Response Display */}
      {testResponse && (
        <div className="p-2 border-b bg-green-50">
          <p className="text-xs font-bold">Last Response:</p>
          <p className="text-xs">{testResponse}</p>
        </div>
      )}

      {/* Logs */}
      <div className="flex-1 overflow-y-auto p-2 text-xs font-mono">
        {logs.map((log, index) => (
          <div key={index} className="mb-1 text-gray-700">
            {log}
          </div>
        ))}
        {logs.length === 0 && (
          <div className="text-gray-400 italic">No logs yet...</div>
        )}
      </div>
    </div>
  );
}