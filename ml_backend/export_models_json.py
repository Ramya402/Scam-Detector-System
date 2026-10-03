"""
Exports trained scikit-learn models and TF-IDF vocabulary to JSON
for web frontend interoperability.
"""

import json
import pickle
import numpy as np

with open('model.pkl', 'rb') as f:
    model = pickle.load(f)
with open('category_model.pkl', 'rb') as f:
    category_model = pickle.load(f)
with open('vectorizer.pkl', 'rb') as f:
    vectorizer = pickle.load(f)

export_data = {
    "binary_model": {
        "classes": list(model.classes_),
        "coef": model.coef_.tolist(),
        "intercept": model.intercept_.tolist()
    },
    "category_model": {
        "classes": list(category_model.classes_),
        "coef": category_model.coef_.tolist(),
        "intercept": category_model.intercept_.tolist()
    },
    "vectorizer": {
        "vocabulary": {k: int(v) for k, v in vectorizer.vocabulary_.items()},
        "idf": vectorizer.idf_.tolist()
    }
}

with open('models/model_export.json', 'w') as f:
    json.dump(export_data, f, indent=2)

with open('src/model_export.json', 'w') as f:
    json.dump(export_data, f, indent=2)

print("✅ Exported model parameters to JSON successfully!")
