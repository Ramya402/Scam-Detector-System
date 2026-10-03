# 🛰️ Enterprise Threat Intelligence Platform & Scam Detection System

A complete, beginner-friendly Machine Learning and Cyber Threat Intelligence project converted from Jupyter Notebook into a production-ready, modular architecture.

---

## 📁 1. Project Structure

```text
├── data/
│   └── data.csv                        # Labeled training dataset (message, label, category, channel)
├── models/
│   ├── model.pkl                       # Trained binary classifier (SAFE vs SCAM)
│   ├── category_model.pkl              # Trained multi-class attack category classifier
│   └── vectorizer.pkl                  # Fitted TF-IDF feature vectorizer
├── notebooks/
│   └── scam_detection_exploration.ipynb # Original interactive exploration notebook
├── src/
│   ├── __init__.py                     # Package indicator
│   ├── data_loader.py                  # Dataset loading and validation logic
│   ├── preprocessing.py               # Text cleaning and TF-IDF feature extraction
│   ├── train.py                        # Automated model training and evaluation script
│   ├── predict.py                      # Single & batch prediction inference pipeline
│   └── heuristics.py                   # Regex heuristics, Teenglish/Hinglish flags, XAI highlighting
├── app.py                              # Interactive Streamlit Enterprise Platform application
├── data.csv                            # Root dataset symlink/copy for legacy compatibility
├── requirements.txt                    # Minimal required Python dependencies
└── README.md                           # Documentation and beginner's guide
```

---

## 🔍 2. Purpose of Each File

| File / Folder | Purpose |
| :--- | :--- |
| `data/data.csv` | Contains 39 sample communication messages labeled as `SAFE` or `SCAM`, their fraud category (`Phishing`, `Reward Scam`, `Financial Fraud`, etc.), and communication channel. |
| `src/data_loader.py` | Safely locates and reads `data.csv`, validates columns, and generates summary metrics. |
| `src/preprocessing.py` | Contains helper functions for text normalization and TF-IDF vectorizer configuration. |
| `src/train.py` | Trains the Logistic Regression models on TF-IDF features and saves artifacts to `models/`. |
| `src/predict.py` | Loads the saved models and provides `predict_single()` and `predict_batch()` functions. |
| `src/heuristics.py` | Implements rule-based heuristics: high-risk URL/TLD detection, financial ledger triggers, regional dialect scans (Teenglish & Hinglish), email header spoof checking (SPF, DKIM, DMARC), and Explainable AI (XAI) badge highlighting. |
| `app.py` | Main interactive web interface featuring role-based access control (`admin` / `analyst`), SQLite permanent audit logging, Slack/Discord automated webhooks, batch scanning, and operational Plotly analytics dashboards. |
| `requirements.txt` | Lists only the required Python packages (`pandas`, `scikit-learn`, `numpy`, `streamlit`, `plotly`, `requests`). |

---

## ⚙️ 3. How the Code Works

1. **TF-IDF Feature Extraction**: Converts raw message text into numerical vectors based on word importance.
2. **Binary Classification**: A Logistic Regression model predicts whether a message is `SAFE` or `SCAM` and computes confidence probability.
3. **Attack Subtype Categorization**: If classified as `SCAM`, a secondary Logistic Regression model identifies the attack category (`Phishing`, `Reward Scam`, `Financial Fraud`, `Job Scam`, `Investment Scam`, etc.).
4. **Heuristic & Regional Tracing**: Checks for Romanized Telugu (`meeku`, `gelicharu`, `dabbu`) and Hindi (`paisa`, `khata band`) urgent manipulation phrases.
5. **Permanent Logging & Alerts**: Saves all processed payloads to SQLite database (`threat_intelligence.db`) and fires webhook notifications to Slack or Discord if configured.

---

## 📦 4. How to Install Dependencies

Make sure you have Python 3.10+ installed. In your terminal, run:

```bash
pip install -r requirements.txt
```

---

## 🚀 5. How to Run the Project

### Step A: Train the Machine Learning Models
To train the models and generate `model.pkl`, `category_model.pkl`, and `vectorizer.pkl`:

```bash
python3 -m src.train
```

*Expected output:*
```text
📊 Loaded 44 samples from dataset.
✅ Models trained and saved successfully!
  • Label Model Accuracy: 97.73%
  • Category Model Accuracy: 79.17%
```

### Step B: Launch the Interactive Web Platform
Run Streamlit:

```bash
streamlit run app.py
```

Open your browser at the displayed local URL (typically `http://localhost:8501`).

---

## 🔑 6. How to Provide Input & Authenticate

1. **Login Credentials & Voice Greeting**:
   - **Admin Profile**: Username: `admin` | Password: `admin123`
     - Upon login, the Voice Assistant greets: *"Hi Admin! Welcome to the Enterprise Threat Intelligence Platform. Access granted."*
   - **Analyst Profile**: Username: `analyst` | Password: `analyst123`
     - Upon login, the Voice Assistant greets: *"Hi Analyst! Welcome to the Enterprise Threat Intelligence Platform. Access granted."*
   - **1-Click Quick Profile Buttons**: Accessible on the login screen for instant authenticated access.

2. **Providing Input & Voice Assistant**:
   - In the sidebar, select **🔎 Intelligence Engine**.
   - **🎙️ Voice Input (Speech-to-Text)**:
     - Click the **🎙️ Dictate with Voice (AI Agent)** button above the payload text box.
     - Speak your payload (e.g., *"Claim your reward now and get free money"* or *"Meeting tomorrow at 5pm"*).
     - The AI Agent will listen, automatically transcribe the words into the text field, and immediately execute the threat matrix scan!
   - **🔊 Voice Agent Feedback (Text-to-Speech)**:
     - The AI Agent verbally announces the validation verdict:
       - E.g. *"Security Alert! Fraudulent payload intercepted with 75% confidence. Threat category identified as Reward Scam."*
       - Or *"System validation clean. Message is safe with 60% confidence."*
     - Click **🔊 Listen to Verdict** anytime inside the verdict card to replay the voice announcement.
     - Toggle voice readout ON/MUTE via the sidebar switch or the button next to the payload box.
   - **Manual Typing**:
     - Paste a message payload directly into the text area.
     - Click **⚡ Execute High-Priority Matrix Scanning Trace**.
   - Under **📁 Batch Pipeline Automation**:
     - Upload a custom `.csv` or click **Load Pre-installed Dataset for Batch Evaluation**.

---

## 📊 7. Where the Output Appears

1. **Live Verdict Box**: Displays `✅ SYSTEM VALIDATION VERDICT: STRUCTURALLY CLEAN (SAFE)` or `⚠️ MITRE THREAT ALERT ADVISORY: FRAUDULENT STRATEGY BLOCKED (SCAM)` with confidence percentage and detected attack subtype.
2. **Explainable AI (XAI) Weights Trace**: Highlights recognized trigger words with red alert badges.
3. **Heuristic Warnings**: Flags suspicious hyperlinks, unverified email headers, and dialect traces.
4. **Permanent SQL Incident Registry**: Displayed in a table at the bottom of the page; logs Operator ID, Channel, Payload, Decision, and Confidence.
5. **Operational Dashboard**: Click **📊 Operational Dashboard** in the sidebar to view Plotly pie charts and bar charts analyzing message distributions.

---

## 🛠️ 8. How to Modify the Project Later

- **Add More Training Data**: Open `data/data.csv` and add new rows with `message,label,category,channel`. Then run `python3 -m src.train` to re-train.
- **Add New Keywords or Heuristics**: Edit `src/heuristics.py` to add new regex patterns or dialect phrases.
- **Tune Classification Parameters**: Open `src/train.py` to adjust `max_features`, solver parameters, or model types.
