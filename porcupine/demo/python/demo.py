#!/usr/bin/env python3

import argparse
import pvporcupine
from pvrecorder import PvRecorder
from datetime import datetime

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument('--access_key', required=True, help='AccessKey from Picovoice Console')
    parser.add_argument('--keyword', default='picovoice', help='Built-in keyword to detect')
    parser.add_argument('--keyword_path', help='Path to custom .ppn file')
    parser.add_argument('--sensitivity', type=float, default=0.5, help='Sensitivity (0.0-1.0)')
    
    args = parser.parse_args()
    
    # Use custom keyword file if provided, otherwise use built-in
    if args.keyword_path:
        keyword_paths = [args.keyword_path]
        keywords = ['custom']
    else:
        if args.keyword not in pvporcupine.KEYWORDS:
            print(f"Available keywords: {', '.join(sorted(pvporcupine.KEYWORDS))}")
            return
        keyword_paths = [pvporcupine.KEYWORD_PATHS[args.keyword]]
        keywords = [args.keyword]
    
    try:
        # Initialize Porcupine
        porcupine = pvporcupine.create(
            access_key=args.access_key,
            keyword_paths=keyword_paths,
            sensitivities=[args.sensitivity]
        )
        
        # Initialize recorder
        recorder = PvRecorder(frame_length=porcupine.frame_length)
        recorder.start()
        
        print(f'Listening for "{keywords[0]}"... (Press Ctrl+C to exit)')
        print('Available built-in keywords:', ', '.join(sorted(pvporcupine.KEYWORDS)))
        
        while True:
            pcm = recorder.read()
            result = porcupine.process(pcm)
            
            if result >= 0:
                print(f'[{datetime.now()}] 🎉 Detected "{keywords[result]}"!')
                
    except KeyboardInterrupt:
        print('\nStopping...')
    except Exception as e:
        print(f'Error: {e}')
    finally:
        if 'recorder' in locals():
            recorder.delete()
        if 'porcupine' in locals():
            porcupine.delete()

if __name__ == '__main__':
    main()