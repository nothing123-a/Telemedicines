#!/usr/bin/env python3

import pvporcupine
from pvrecorder import PvRecorder
from datetime import datetime
import sys

ACCESS_KEY = "6PYLS0t6bAGUrZriAoDXbgXTXjeBR4x2GQ/eiNybJ25XBkRStSfLFQ=="

def test_keyword(keyword):
    try:
        porcupine = pvporcupine.create(
            access_key=ACCESS_KEY,
            keywords=[keyword]
        )
        
        recorder = PvRecorder(frame_length=porcupine.frame_length)
        recorder.start()
        
        print(f'🎤 Say "{keyword}" (Press Ctrl+C to stop)')
        
        while True:
            pcm = recorder.read()
            result = porcupine.process(pcm)
            
            if result >= 0:
                print(f'🎉 Detected "{keyword}" at {datetime.now().strftime("%H:%M:%S")}')
                break
                
    except KeyboardInterrupt:
        print('\nStopped')
    finally:
        if 'recorder' in locals():
            recorder.delete()
        if 'porcupine' in locals():
            porcupine.delete()

if __name__ == '__main__':
    keyword = sys.argv[1] if len(sys.argv) > 1 else 'picovoice'
    test_keyword(keyword)