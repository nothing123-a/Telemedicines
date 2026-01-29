#!/usr/bin/env python3

import pvporcupine
from pvrecorder import PvRecorder
from datetime import datetime

ACCESS_KEY = "6PYLS0t6bAGUrZriAoDXbgXTXjeBR4x2GQ/eiNybJ25XBkRStSfLFQ=="
KEYWORD_PATH = "/Users/darshanpatil/Documents/Mern/Pccoe Hackathon/hey--genie_en_mac_v3_0_0/hey--genie_en_mac_v3_0_0.ppn"

def test_hey_genie():
    try:
        print("🧞♂️ Initializing Hey Genie wake word detection...")
        
        porcupine = pvporcupine.create(
            access_key=ACCESS_KEY,
            keyword_paths=[KEYWORD_PATH],
            sensitivities=[0.7]  # Higher sensitivity for better detection
        )
        
        recorder = PvRecorder(frame_length=porcupine.frame_length)
        recorder.start()
        
        print("🎤 Listening for 'Hey Genie'... (Press Ctrl+C to stop)")
        print("💡 Try saying: 'Hey Genie' clearly")
        
        detection_count = 0
        
        while True:
            pcm = recorder.read()
            result = porcupine.process(pcm)
            
            if result >= 0:
                detection_count += 1
                print(f"🎉 Hey Genie detected! #{detection_count} at {datetime.now().strftime('%H:%M:%S')}")
                print("🧞♂️ Genie is ready to help!")
                
    except KeyboardInterrupt:
        print(f"\n✅ Test completed. Total detections: {detection_count}")
    except Exception as e:
        print(f"❌ Error: {e}")
    finally:
        if 'recorder' in locals():
            recorder.delete()
        if 'porcupine' in locals():
            porcupine.delete()

if __name__ == '__main__':
    test_hey_genie()