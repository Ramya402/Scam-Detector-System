"""
End-to-End Pipeline Verification Test
Verifies dataset loading, preprocessing, model training, prediction, heuristics, and DB.
"""

import os
import sqlite3
import pandas as pd
from src.data_loader import load_data, get_dataset_summary
from src.preprocessing import build_vectorizer, clean_text
from src.train import train_models
from src.predict import load_models, predict_single, predict_batch
from src.heuristics import (
    execute_regex_heuristic_engine,
    process_multilingual_lexicon_flags,
    execute_xai_word_highlighter,
    evaluate_transmission_headers
)
from src.db import init_threat_db, save_telemetry_to_db, fetch_telemetry_history, purge_all_db_telemetry

def run_tests():
    print("==========================================")
    print("🧪 RUNNING END-TO-END PIPELINE VERIFICATION")
    print("==========================================")

    # 1. Dataset Loading Test
    print("\n1. Testing Dataset Loading...")
    df = load_data()
    summary = get_dataset_summary(df)
    assert len(df) > 0, "Dataset is empty!"
    print(f"   [PASS] Loaded {len(df)} records. Safe: {summary['safe_count']}, Scam: {summary['scam_count']}")

    # 2. Preprocessing Test
    print("\n2. Testing Preprocessing...")
    sample_text = "   Claim your free reward now at http://fake.xyz   "
    cleaned = clean_text(sample_text)
    assert cleaned == "Claim your free reward now at http://fake.xyz"
    print(f"   [PASS] Text cleaning works.")

    # 3. Model Training Test
    print("\n3. Testing Model Training...")
    results = train_models()
    assert results['label_accuracy'] > 0.80, "Label accuracy lower than expected"
    print(f"   [PASS] Label Accuracy: {results['label_accuracy']:.2%}")
    print(f"   [PASS] Category Accuracy: {results['category_accuracy']:.2%}")

    # 4. Model Loading & Inference Test
    print("\n4. Testing Model Loading & Prediction...")
    m, cat, vec = load_models()
    assert m is not None, "Failed to load model.pkl"
    assert cat is not None, "Failed to load category_model.pkl"
    assert vec is not None, "Failed to load vectorizer.pkl"
    
    # Test SCAM sample
    scam_test = predict_single("Claim your reward now and get free money", m, cat, vec)
    print(f"   Payload: 'Claim your reward now and get free money'")
    print(f"   Result: {scam_test['prediction']} (Confidence: {scam_test['confidence']:.1%}, Category: {scam_test['category']})")
    assert scam_test['prediction'] == "SCAM", f"Expected SCAM, got {scam_test['prediction']}"
    print("   [PASS] SCAM prediction correct.")

    # Test SAFE sample
    safe_test = predict_single("Meeting tomorrow at 5pm in conference room", m, cat, vec)
    print(f"   Payload: 'Meeting tomorrow at 5pm in conference room'")
    print(f"   Result: {safe_test['prediction']} (Confidence: {safe_test['confidence']:.1%})")
    assert safe_test['prediction'] == "SAFE", f"Expected SAFE, got {safe_test['prediction']}"
    print("   [PASS] SAFE prediction correct.")

    # 5. Batch Inference Test
    print("\n5. Testing Batch Inference...")
    batch_msgs = ["Meeting at 9am", "You won a prize click here", "Delivery completed successfully"]
    batch_res = predict_batch(batch_msgs, m, cat, vec)
    assert len(batch_res) == 3
    print(f"   [PASS] Processed {len(batch_res)} batch messages successfully.")

    # 6. Heuristics & Dialect Tests
    print("\n6. Testing Heuristics & Multilingual Flags...")
    telugu_msg = "meeku lottery gelicharu dabbu claim cheyyandi"
    t_flags = process_multilingual_lexicon_flags(telugu_msg)
    assert len(t_flags) > 0, "Failed to detect Teenglish flags"
    print(f"   [PASS] Detected Teenglish flag: {t_flags[0]}")

    hindi_msg = "aapka khata band ho jayega jaldi kijiye paisa bhejo"
    h_flags = process_multilingual_lexicon_flags(hindi_msg)
    assert len(h_flags) > 0, "Failed to detect Hinglish flags"
    print(f"   [PASS] Detected Hinglish flag: {h_flags[0]}")

    url_flags = execute_regex_heuristic_engine("Verify wallet at http://secure-login.xyz")
    assert len(url_flags) > 0, "Failed to detect malicious TLD"
    print(f"   [PASS] Detected URL flag: {url_flags[0]}")

    xai_out = execute_xai_word_highlighter("urgent claim your free reward")
    assert "<b style=" in xai_out, "XAI highlighter failed"
    print("   [PASS] Explainable AI HTML highlighting generated.")

    # 7. Database Integrity Test
    print("\n7. Testing SQLite Database...")
    init_threat_db()
    save_telemetry_to_db("2026-10-02 22:30:00", "admin", "Admin", "Email", "Test verify link", "SCAM", "88.5%", "🔴 Critical")
    history = fetch_telemetry_history()
    assert len(history) >= 1, "Failed to insert/fetch telemetry log"
    print(f"   [PASS] Telemetry logged successfully. Row count: {len(history)}")

    purge_all_db_telemetry()
    history_after = fetch_telemetry_history()
    assert len(history_after) == 0, "Failed to purge telemetry"
    print("   [PASS] SQLite purge and reset verified.")

    print("\n==========================================")
    print("🎉 ALL 7 END-TO-END PIPELINE TESTS PASSED!")
    print("==========================================")

if __name__ == "__main__":
    run_tests()
