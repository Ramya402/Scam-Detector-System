"""
Prediction & Inference Pipeline Module
"""

import os
import pickle
import numpy as np

def load_models(model_dir="models"):
    """
    Safely loads model.pkl, category_model.pkl, and vectorizer.pkl.
    Searches both models/ directory and current directory.
    """
    candidates = [
        model_dir,
        ".",
        os.path.join(os.path.dirname(__file__), "..", "models"),
        os.path.join(os.path.dirname(__file__), "..")
    ]
    
    for c in candidates:
        m_path = os.path.join(c, 'model.pkl')
        cat_path = os.path.join(c, 'category_model.pkl')
        vec_path = os.path.join(c, 'vectorizer.pkl')
        
        if os.path.exists(m_path) and os.path.exists(cat_path) and os.path.exists(vec_path):
            try:
                with open(m_path, 'rb') as f:
                    model = pickle.load(f)
                with open(cat_path, 'rb') as f:
                    cat_model = pickle.load(f)
                with open(vec_path, 'rb') as f:
                    vectorizer = pickle.load(f)
                return model, cat_model, vectorizer
            except Exception as e:
                print(f"Error loading models from {c}: {e}")
                
    return None, None, None

def predict_single(message: str, model, category_model, vectorizer, threshold: float = 0.50):
    """
    Executes calibrated inference for ANY random or unseen message payload.
    Returns prediction, safety_score (0-100%), threat_score (0-100%), confidence, and category.
    """
    if not message or not message.strip():
        return {
            "prediction": "SAFE",
            "safety_score": 100.0,
            "threat_score": 0.0,
            "confidence": 1.0,
            "category": "None",
            "raw_scam_prob": 0.0,
            "raw_safe_prob": 1.0,
            "safety_rationale": "Empty message contains no malicious vectors."
        }
        
    vec_msg = vectorizer.transform([message])
    prob_array = model.predict_proba(vec_msg)[0]
    classes = list(model.classes_)
    
    scam_idx = classes.index("SCAM") if "SCAM" in classes else 1
    raw_scam_prob = float(prob_array[scam_idx])
    raw_safe_prob = float(prob_array[0 if scam_idx == 1 else 1])
    
    import re
    lowered = message.lower()
    
    scam_triggers = [
        r'\b(win|winner|lottery|jackpot|prize)\b',
        r'\b(free money|claim reward|collect reward|cash reward)\b',
        r'\b(urgent|urgently|act now|immediately|expires soon|final notice)\b',
        r'\b(account.*(?:blocked|closed|suspended|unauthorized|restricted))\b',
        r'\b(verify.*(?:identity|account|password|card|details))\b',
        r'\b(update.*(?:password|details|billing|kyc))\b',
        r'\b(bank details|pin number|cvv|otp|seed phrase|private key)\b',
        r'\b(wire transfer|inheritance waiting|investment.*return|crypto.*deposit)\b',
        r'\b(meeku|gelicharu|dabbu|guddiga|vachindi|freega|lottary)\b',
        r'\b(paisa|milega|jeet|jeeta|inam|khata.*band|jaldi.*kijiye)\b',
        r'https?://[^\s]+\.(xyz|top|click|info|biz|cc|bit|shorturl|tk|ml)\b',
        r'wa\.me/\d+'
    ]
    
    safe_markers = [
        r'\b(meeting|lunch|dinner|breakfast|coffee|party|birthday)\b',
        r'\b(project|class|school|college|exam|homework|presentation|slides|notes)\b',
        r'\b(tomorrow|yesterday|today|weekend|morning|afternoon|evening|night)\b',
        r'\b(thanks|thank you|hello|hi|hey|how are you|see you|good morning|take care)\b',
        r'\b(weather|sunny|rain|cloudy|traffic|driving|grocery|shopping|cooking)\b',
        r'\b(family|friend|mom|dad|brother|sister|baby|doctor|hospital|flight)\b',
        r'\b(congratulations.*(?:promotion|graduating|baby|anniversary|wedding|job|pass))\b',
        r'\b(call|call me|available|free|talk|contact|reach out|text me|a moment|get a chance)\b'
    ]
    
    matched_scam = [t for t in scam_triggers if re.search(t, lowered)]
    matched_safe = [s for s in safe_markers if re.search(s, lowered)]
    
    tokens = re.findall(r'\b[a-z]{2,}\b', lowered)
    in_vocab_tokens = [t for t in tokens if t in vectorizer.vocabulary_]
    is_mostly_oov = len(tokens) > 0 and (len(in_vocab_tokens) / len(tokens) < 0.25)
    
    if matched_scam:
        severity = len(matched_scam)
        scam_prob = min(0.98, max(raw_scam_prob, 0.65 + (severity * 0.10)))
        safe_prob = 1.0 - scam_prob
        prediction = "SCAM"
        confidence = scam_prob
        category = category_model.predict(vec_msg)[0] if category_model else "Phishing"
        rationale = f"Detected {severity} suspicious threat indicator(s)."
    elif matched_safe or is_mostly_oov:
        safe_prob = max(0.88, raw_safe_prob)
        scam_prob = 1.0 - safe_prob
        prediction = "SAFE"
        confidence = safe_prob
        category = "None"
        rationale = "Zero scam indicators detected. Normal, safe communication pattern."
    else:
        scam_prob = raw_scam_prob
        safe_prob = raw_safe_prob
        if raw_scam_prob >= threshold:
            prediction = "SCAM"
            confidence = raw_scam_prob
            category = category_model.predict(vec_msg)[0] if category_model else "Phishing"
            rationale = "Statistical risk indicators identified."
        else:
            prediction = "SAFE"
            confidence = raw_safe_prob
            category = "None"
            rationale = "Statistical threat evaluation below threshold."
            
    safety_score = round(safe_prob * 100, 1)
    threat_score = round(scam_prob * 100, 1)
    
    return {
        "prediction": prediction,
        "safety_score": safety_score,
        "threat_score": threat_score,
        "confidence": float(confidence),
        "category": category,
        "raw_scam_prob": float(raw_scam_prob),
        "raw_safe_prob": float(raw_safe_prob),
        "safety_rationale": rationale
    }

def predict_batch(messages, model, category_model, vectorizer, threshold: float = 0.50):
    """
    Executes inference across a list or series of messages.
    """
    results = []
    for msg in messages:
        res = predict_single(msg, model, category_model, vectorizer, threshold)
        results.append(res)
    return results
