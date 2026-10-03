"""
Data Loader Module
Responsible for safely finding and loading the dataset.
"""

import os
import pandas as pd

def get_data_path(custom_path=None):
    """
    Locates the data.csv file across standard paths.
    """
    if custom_path and os.path.exists(custom_path):
        return custom_path
    
    candidates = [
        "data/data.csv",
        "data.csv",
        os.path.join(os.path.dirname(__file__), "..", "data", "data.csv"),
        os.path.join(os.path.dirname(__file__), "..", "data.csv")
    ]
    for path in candidates:
        if os.path.exists(path):
            return path
    raise FileNotFoundError("Could not find data.csv. Please ensure data/data.csv or data.csv exists.")

def load_data(filepath=None):
    """
    Loads and validates the threat intelligence and scam dataset.
    """
    path = get_data_path(filepath)
    df = pd.read_csv(path)
    
    # Required columns validation
    required_cols = {'message', 'label', 'category', 'channel'}
    missing = required_cols - set(df.columns)
    if missing:
        raise ValueError(f"Dataset is missing required columns: {missing}")
        
    return df

def get_dataset_summary(df):
    """
    Generates summary metrics for dashboards and reports.
    """
    total = len(df)
    safe_count = int((df['label'] == 'SAFE').sum())
    scam_count = int((df['label'] == 'SCAM').sum())
    category_counts = df[df['label'] == 'SCAM']['category'].value_counts().to_dict()
    channel_counts = df['channel'].value_counts().to_dict()
    
    return {
        "total": total,
        "safe_count": safe_count,
        "scam_count": scam_count,
        "categories": category_counts,
        "channels": channel_counts
    }
