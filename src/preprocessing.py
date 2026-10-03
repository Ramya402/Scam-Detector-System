"""
Data Preprocessing & Feature Extraction Module
"""

import re
from sklearn.feature_extraction.text import TfidfVectorizer

def clean_text(text: str) -> str:
    """
    Standard text normalization: strips extra whitespace and handles strings.
    """
    if not isinstance(text, str):
        return ""
    text = text.strip()
    return text

def build_vectorizer(max_features: int = 100) -> TfidfVectorizer:
    """
    Creates and returns a TF-IDF vectorizer configured for scam classification.
    """
    return TfidfVectorizer(max_features=max_features, lowercase=True, stop_words='english')
