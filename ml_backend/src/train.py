"""
Model Training Module
Trains:
1. Binary Classifier (SAFE vs SCAM) using Logistic Regression & TF-IDF
2. Multi-class Category Classifier (for SCAM types: Phishing, Reward Scam, Financial Fraud, etc.)
Saves model artifacts to models/ and root directory.
"""

import os
import pickle
import pandas as pd
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import classification_report, accuracy_score

from .data_loader import load_data

def train_models(data_path=None, output_dir="models"):
    """
    Trains the vectorizer and models on data.csv and persists artifacts.
    """
    # 1. Load Data
    df = load_data(data_path)
    print(f"📊 Loaded {len(df)} samples from dataset.")
    
    # 2. Train Label Model (SAFE / SCAM)
    X = df['message']
    y = df['label']
    
    vectorizer = TfidfVectorizer(max_features=100)
    X_vectorized = vectorizer.fit_transform(X)
    
    label_model = LogisticRegression(max_iter=200, random_state=42)
    label_model.fit(X_vectorized, y)
    label_acc = label_model.score(X_vectorized, y)
    
    # 3. Train Category Model (for SCAM categories only)
    scam_df = df[df['label'] == 'SCAM'].dropna(subset=['category'])
    X_scam = scam_df['message']
    y_scam = scam_df['category']
    
    X_scam_vectorized = vectorizer.transform(X_scam)
    
    category_model = LogisticRegression(max_iter=300, random_state=42)
    category_model.fit(X_scam_vectorized, y_scam)
    cat_acc = category_model.score(X_scam_vectorized, y_scam)
    
    # 4. Save Artifacts to both output_dir and root directory
    os.makedirs(output_dir, exist_ok=True)
    
    destinations = [output_dir, "."]
    for dest in destinations:
        pickle.dump(label_model, open(os.path.join(dest, 'model.pkl'), 'wb'))
        pickle.dump(category_model, open(os.path.join(dest, 'category_model.pkl'), 'wb'))
        pickle.dump(vectorizer, open(os.path.join(dest, 'vectorizer.pkl'), 'wb'))

    # Export client-side JSON representation for React web runtime
    import json
    export_data = {
        "binary_model": {
            "classes": [str(c) for c in label_model.classes_],
            "coef": label_model.coef_.tolist(),
            "intercept": label_model.intercept_.tolist()
        },
        "category_model": {
            "classes": [str(c) for c in category_model.classes_],
            "coef": category_model.coef_.tolist(),
            "intercept": category_model.intercept_.tolist()
        },
        "vectorizer": {
            "vocabulary": {str(k): int(v) for k, v in vectorizer.vocabulary_.items()},
            "idf": vectorizer.idf_.tolist()
        }
    }
    json_path = os.path.join(os.path.dirname(__file__), "model_export.json")
    with open(json_path, "w") as jf:
        json.dump(export_data, jf, indent=2)
        
    print("✅ Models trained and saved successfully!")
    print(f"  • Label Model Accuracy: {label_acc:.2%}")
    print(f"  • Category Model Accuracy: {cat_acc:.2%}")
    
    return {
        "label_model": label_model,
        "category_model": category_model,
        "vectorizer": vectorizer,
        "label_accuracy": label_acc,
        "category_accuracy": cat_acc,
        "classes": list(label_model.classes_),
        "categories": list(category_model.classes_)
    }

if __name__ == "__main__":
    train_models()
