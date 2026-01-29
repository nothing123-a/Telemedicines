#!/usr/bin/env python3

import sys
from transformers import pipeline
from PIL import Image
import numpy as np
import requests

def test_model(model_name, task="image-classification"):
    """Test if a Hugging Face model works"""
    try:
        print(f"Testing {model_name}...")
        
        # Try to load the model
        classifier = pipeline(task, model=model_name, device=-1)
        
        # Create a dummy image for testing
        dummy_image = Image.fromarray(np.random.randint(0, 255, (224, 224, 3), dtype=np.uint8))
        
        # Test prediction
        result = classifier(dummy_image)
        print(f"✅ {model_name} - WORKING")
        print(f"   Sample output: {result[0] if result else 'No output'}")
        return True
        
    except Exception as e:
        print(f"❌ {model_name} - FAILED: {str(e)}")
        return False

def main():
    print("🔬 Testing Hugging Face Medical Models\n")
    
    models_to_test = [
        # Chest X-Ray Models
        ("ayushirathour/chest-xray-pneumonia-detection", "image-classification"),
        ("Borjamg/pneumonia_model", "image-classification"),
        
        # Brain MRI Models
        ("alanjafari/BrainTumorAI", "object-detection"),
        ("kingabzpro/medgemma-brain-cancer", "image-text-to-text"),
        ("wizaye/MRI_LLM", "image-classification"),
        ("lukmanaj/brain-tumor-multimodal", "image-classification"),
        
        # Skin Analysis Models
        ("actavkid/vit-large-patch32-384-finetuned-skin-lesion-classification", "image-classification"),
        ("loonister/Skin-Lesion-Detection-CNN", "image-classification"),
        ("sreejith782/Dermacare_Skin_Lesion_classification", "image-classification"),
        ("syaha/skin_cancer_detection_model", "image-classification"),
    ]
    
    working_models = []
    failed_models = []
    
    for model_name, task in models_to_test:
        if test_model(model_name, task):
            working_models.append((model_name, task))
        else:
            failed_models.append((model_name, task))
        print()
    
    print("=" * 60)
    print(f"✅ WORKING MODELS ({len(working_models)}):")
    for model, task in working_models:
        print(f"   • {model}")
    
    print(f"\n❌ FAILED MODELS ({len(failed_models)}):")
    for model, task in failed_models:
        print(f"   • {model}")
    
    print(f"\nSuccess Rate: {len(working_models)}/{len(models_to_test)} ({len(working_models)/len(models_to_test)*100:.1f}%)")

if __name__ == "__main__":
    main()