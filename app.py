"""
Enterprise Threat Intelligence Platform & Scam Detection System
Recreated runnable application preserving original architecture and workflows.
"""

import os
import io
import re
import json
import sqlite3
import pickle
import requests
from datetime import datetime

import pandas as pd
import numpy as np
import plotly.express as px
import streamlit as st

# Import internal modular helpers
from src.heuristics import (
    process_multilingual_lexicon_flags,
    execute_xai_word_highlighter,
    evaluate_transmission_headers,
    execute_regex_heuristic_engine,
)
from src.predict import load_models, predict_single, predict_batch
from src.train import train_models
from src.data_loader import load_data, get_dataset_summary

# 1. System Platform Page Configuration
st.set_page_config(
    page_title="Enterprise Threat Intelligence Platform",
    page_icon="🔍",
    layout="wide",
    initial_sidebar_state="expanded"
)

# --- SQLite PERMANENT DATA REGISTRY PIPELINE ENGINE ---
DB_FILE = 'threat_intelligence.db'

def init_threat_db():
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            CREATE TABLE IF NOT EXISTS threat_logs (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                timestamp TEXT,
                operator_id TEXT,
                operator_role TEXT,
                channel_node TEXT,
                payload_message TEXT,
                system_decision TEXT,
                confidence_score TEXT,
                risk_grade TEXT
            )
        ''')
        conn.commit()
        conn.close()
    except Exception as e:
        st.error(f"Database Initialization Error: {e}")

def save_telemetry_to_db(timestamp, op_id, op_role, channel, message, decision, confidence, grade):
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO threat_logs (timestamp, operator_id, operator_role, channel_node, payload_message, system_decision, confidence_score, risk_grade)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (timestamp, op_id, op_role, channel, message, decision, confidence, grade))
        conn.commit()
        conn.close()
    except Exception as e:
        st.sidebar.error(f"DB Write Failed: {e}")

def fetch_telemetry_history():
    try:
        conn = sqlite3.connect(DB_FILE)
        df = pd.read_sql_query(
            "SELECT timestamp as 'Timestamp', operator_id as 'Operator ID', operator_role as 'Role', "
            "channel_node as 'Channel', payload_message as 'Payload Message', system_decision as 'Decision', "
            "confidence_score as 'Confidence', risk_grade as 'Risk Grade' FROM threat_logs ORDER BY id DESC", 
            conn
        )
        conn.close()
        return df
    except Exception:
        return pd.DataFrame()

def purge_all_db_telemetry():
    try:
        conn = sqlite3.connect(DB_FILE)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM threat_logs")
        conn.commit()
        conn.close()
    except Exception as e:
        st.error(f"DB Purge Failed: {e}")

# --- AUTOMATED INCIDENT RESPONSE WEBHOOK PIPELINES ---
def dispatch_slack_alert(url, log_meta):
    if not url or not url.strip():
        return
    headers = {"Content-Type": "application/json"}
    slack_payload = {
        "text": "🚨 *CRITICAL INCIDENT ALERT DISPATCHED FROM PLATFORM NODE* 🚨",
        "attachments": [{
            "color": "#ef553b",
            "blocks": [
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": "*Incident Classification:* `HIGH-RISK MALICIOUS ENGINEERING VECTORS INTERCEPTED`"}
                },
                {
                    "type": "section",
                    "fields": [
                        {"type": "mrkdwn", "text": f"*Operator ID:*\n`{log_meta.get('op_id', 'Unknown')}`"},
                        {"type": "mrkdwn", "text": f"*Channel Target Node:*\n`{log_meta.get('channel', 'Unknown')}`"},
                        {"type": "mrkdwn", "text": f"*Confidence Weight:*\n`{log_meta.get('confidence', 'N/A')}`"},
                        {"type": "mrkdwn", "text": f"*Variant Subtype:*\n`{log_meta.get('category', 'N/A')}`"}
                    ]
                },
                {
                    "type": "section",
                    "text": {"type": "mrkdwn", "text": f"*Intercepted Sample Data Payload:*\n_{log_meta.get('message', '')[:250]}_"}
                }
            ]
        }]
    }
    try:
        requests.post(url, data=json.dumps(slack_payload), headers=headers, timeout=5)
    except Exception as e:
        st.sidebar.error(f"Slack transmission failing: {e}")

def dispatch_discord_alert(url, log_meta):
    if not url or not url.strip():
        return
    headers = {"Content-Type": "application/json"}
    discord_payload = {
        "username": "Threat Intelligence SIEM Gateway",
        "embeds": [{
            "title": "🚨 CRITICAL EXPLOIT VECTOR ISOLATED",
            "description": "Anomalous malicious payload intercepted and quarantined inside operational runtime matrices.",
            "color": 15684923,
            "fields": [
                {"name": "Active Node Operator", "value": f"`{log_meta.get('op_id', 'Unknown')}`", "inline": True},
                {"name": "Channel Vector", "value": f"`{log_meta.get('channel', 'Unknown')}`", "inline": True},
                {"name": "Neural Confidence Matrix", "value": f"`{log_meta.get('confidence', 'N/A')}`", "inline": True},
                {"name": "Identified Attack Variant", "value": f"`{log_meta.get('category', 'N/A')}`", "inline": True},
                {"name": "Malicious Text Frame Snip", "value": f"```{log_meta.get('message', '')[:300]}```", "inline": False}
            ],
            "footer": {"text": "Threat Matrix Automated Core Module Engine Dispatcher"}
        }]
    }
    try:
        requests.post(url, data=json.dumps(discord_payload), headers=headers, timeout=5)
    except Exception as e:
        st.sidebar.error(f"Discord transmission failing: {e}")

# Fire infrastructure database init initialization sequence
init_threat_db()

# Initialize configuration variables in state if missing
if 'slack_url' not in st.session_state: st.session_state['slack_url'] = ""
if 'discord_url' not in st.session_state: st.session_state['discord_url'] = ""
if 'voice_enabled' not in st.session_state: st.session_state['voice_enabled'] = True

# 2. Authentication & Session Registry Initialization Loops
if 'logged_in' not in st.session_state: st.session_state['logged_in'] = False
if 'user_role' not in st.session_state: st.session_state['user_role'] = None
if 'username' not in st.session_state: st.session_state['username'] = None

USER_CREDENTIALS = {
    "admin": {"password": "admin123", "role": "Admin"},
    "analyst": {"password": "analyst123", "role": "Analyst"}
}

def render_login_portal():
    st.markdown("<div style='text-align: center; padding-top: 40px;'>", unsafe_allow_html=True)
    st.title("🛰️ Enterprise Threat Intelligence Node")
    st.subheader("Secure Access Gateway Portal")
    st.markdown("</div>", unsafe_allow_html=True)
    
    col1, col2, col3 = st.columns([1, 1.5, 1])
    with col2:
        st.write("---")
        with st.form("security_login_form"):
            user_input = st.text_input("👤 Operator Security Username:", placeholder="Enter ID...")
            pass_input = st.text_input("🔑 Cryptographic Access Token/Password:", type="password", placeholder="••••••••")
            submit_auth = st.form_submit_button("⚡ Establish Secure Connection Loop", use_container_width=True)
            
            if submit_auth:
                if user_input in USER_CREDENTIALS and USER_CREDENTIALS[user_input]["password"] == pass_input:
                    st.session_state['logged_in'] = True
                    st.session_state['user_role'] = USER_CREDENTIALS[user_input]["role"]
                    st.session_state['username'] = user_input
                    st.session_state['just_logged_in'] = True
                    st.success(f"🔓 Access Granted. Routing to {st.session_state['user_role']} Infrastructure Matrix...")
                    st.rerun()
                else:
                    st.error("❌ Authentication Failed: Invalid operator credentials signature.")
        st.info("💡 **Dev Profiles:**\n- Admin Layer: `admin` / `admin123`\n- Analyst Layer: `analyst` / `analyst123`")

if not st.session_state['logged_in']:
    render_login_portal()
    st.stop()

# Trigger Voice Greeting on Login
if st.session_state.get('just_logged_in', False):
    greeting_name = st.session_state['username'].capitalize()
    st.components.v1.html(f"""
    <script>
      if ('speechSynthesis' in window) {{
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance("Hi {greeting_name}! Welcome to the Enterprise Threat Intelligence Platform. Access granted.");
        utterance.rate = 1.05;
        window.speechSynthesis.speak(utterance);
      }}
    </script>
    """, height=0)
    st.session_state['just_logged_in'] = False

# --- MAIN SECURE APPLICATION EXECUTION REGION ---

# 3. Dynamic Machine Learning Model Processing Environment
@st.cache_resource
def load_base_models_cached():
    m, cat, vec = load_models()
    if m is None or cat is None or vec is None:
        # Automatically train if models are not generated yet
        try:
            print("Auto-training models pipeline...")
            res = train_models()
            return res['label_model'], res['category_model'], res['vectorizer']
        except Exception as e:
            print(f"Failed auto-training: {e}")
            return None, None, None
    return m, cat, vec

default_model, default_cat_model, default_vec = load_base_models_cached()

# 4. Sidebar Traffic Configurations & RBAC Controls
with st.sidebar:
    st.title("🛰️ Command Terminal")
    
    st.markdown(
        f"""
        <div style='background-color:#1e293b; padding:12px; border-radius:6px; border:1px solid #334155; margin-bottom:15px;'>
            <span style='color:#94a3b8; font-size:12px; font-weight:bold;'>AUTHENTICATED NODE:</span><br>
            <span style='color:#f8fafc; font-size:16px; font-weight:bold;'>👤 {st.session_state['username'].upper()}</span><br>
            <span style='background-color:#38bdf8; color:#0f172a; font-size:10px; font-weight:bold; padding:2px 6px; border-radius:4px; display:inline-block; margin-top:5px;'>ROLE: {st.session_state['user_role']}</span>
        </div>
        """, 
        unsafe_allow_html=True
    )
    
    page = st.radio("Select Infrastructure Layer", ["🏠 Home Base", "🔎 Intelligence Engine", "📊 Operational Dashboard", "📚 Knowledge Vector"])
    st.markdown("---")
    
    # AI Voice Agent Readout Control
    st.session_state['voice_enabled'] = st.checkbox("🔊 AI Voice Agent Readout", value=st.session_state.get('voice_enabled', True))
    st.markdown("---")
    
    # Combined RBAC configurations panel
    if st.session_state['user_role'] == "Admin":
        with st.expander("⚙️ Core Kernel Controls (ADMIN ONLY)", expanded=False):
            st.subheader("Automated IR Configurations")
            st.session_state['slack_url'] = st.text_input("Slack Incoming Webhook URL Token:", value=st.session_state['slack_url'], type="password")
            st.session_state['discord_url'] = st.text_input("Discord Webhook Hook URL Token:", value=st.session_state['discord_url'], type="password")
            
            st.markdown("---")
            st.caption("Custom Model Upload Registers")
            up_model = st.file_uploader("Override Model Core Binary (.pkl)", type="pkl", key="adm_m")
            up_cat = st.file_uploader("Override Profile Classifier (.pkl)", type="pkl", key="adm_c")
            up_vec = st.file_uploader("Override Context Vectorizer (.pkl)", type="pkl", key="adm_v")
            
            if up_model and up_cat and up_vec:
                st.session_state['custom_model'] = pickle.load(up_model)
                st.session_state['custom_cat_model'] = pickle.load(up_cat)
                st.session_state['custom_vec'] = pickle.load(up_vec)
                st.success("⚡ Runtime Core Pipeline Swapped to Custom Variables!")
    else:
        st.caption("🔒 *Incident Response Webhook variables and Binary Hotloaders require higher admin status token attributes.*")
        
    st.markdown("---")
    if st.button("🚪 Terminate Session & Logout", use_container_width=True, type="secondary"):
        st.session_state['logged_in'] = False
        st.session_state['user_role'] = None
        st.session_state['username'] = None
        st.rerun()

if 'custom_model' in st.session_state:
    model = st.session_state['custom_model']
    category_model = st.session_state['custom_cat_model']
    vectorizer = st.session_state['custom_vec']
else:
    model, category_model, vectorizer = default_model, default_cat_model, default_vec

def models_operational():
    return model is not None and category_model is not None and vectorizer is not None

# --- 🏠 HOME BASE INTERFACE ---
if page == "🏠 Home Base":
    st.title("🛰️ Threat Intelligence Control Base")
    st.write("---")
    
    col1, col2 = st.columns(2)
    with col1:
        st.markdown(f"""
        ### Welcome back, {st.session_state['username'].capitalize()}! 👋
        🔒 **Security Access Profile:** `{st.session_state['user_role']}` Model Deployment Profile.
        
        - ✅ **ML Core Engine Status:** `{'ACTIVE & OPERATIONAL' if models_operational() else 'HALTED'}`
        - ✅ **SQL Permanent Logging Status:** `CONNECTED (threat_intelligence.db)`  
        - ✅ **Slack Automated IR Link:** `{'CONFIGURED' if st.session_state['slack_url'] else 'READY'}`  
        - ✅ **Discord Automated IR Link:** `{'CONFIGURED' if st.session_state['discord_url'] else 'READY'}`  
        """)
    with col2:
        try: 
            history_df = fetch_telemetry_history()
            db_count = len(history_df) if not history_df.empty else 0
        except Exception: 
            db_count = 0
        st.metric("Total DB Logged Scans (Permanent Stack)", f"{db_count} Saved")
        st.info("💡 Real-time Slack/Discord webhooks will fire when threats pass the confidence threshold boundary.")

# --- 🔎 INTELLIGENCE ENGINE INTERFACE ---
elif page == "🔎 Intelligence Engine":
    st.title("🔎 Multi-Layer Threat Detection Engine")
    st.write("---")
    
    if not models_operational():
        st.error("⛔ Engine Halt Exception: Models not loaded. Click below to initialize and train models.")
        if st.button("⚡ Initialize & Train Models Pipeline"):
            with st.spinner("Training models on dataset..."):
                train_models()
                st.cache_resource.clear()
                st.success("Models trained! Reloading...")
                st.rerun()
    else:
        tab1, tab2, tab3 = st.tabs(["📝 Single Payload Deep Trace", "📁 Batch Pipeline Automation", "📊 Training Metrics Profile"])
        
        # --- TAB 1: SINGLE PAYLOAD DEEP TRACE ---
        with tab1:
            st.subheader("Diagnostic Workspace Terminals")
            col1, col2 = st.columns(2)
            with col1:
                channel = st.selectbox("📱 Input Vector Source Node:", ["Email", "SMS", "WhatsApp", "Telegram", "Instagram", "Facebook", "Website Popup", "App Notification"])
            with col2:
                decision_threshold = st.slider("🎛️ Boundary Decision Boundary Threshold:", min_value=0.50, max_value=0.99, value=0.50, step=0.05)
            
            message = st.text_area("Target Content Payload String Data Matrix:", height=110, placeholder="Paste data payloads here (e.g. 'Claim your reward now', 'Meeting tomorrow at 5pm')...")
            
            with st.expander("📬 Optional: Connect Transmission Meta-Headers (Spoof Check)", expanded=False):
                input_headers = st.text_area("Raw Metadata Tracing Block Data:", height=100, placeholder="Received-SPF: pass / fail, dkim=pass / fail, dmarc=pass / fail...")
            
            check_btn = st.button("⚡ Execute High-Priority Matrix Scanning Trace", use_container_width=True)
            
            if check_btn and message:
                # 1. Inference via predict module (handles any random unseen message)
                res = predict_single(message, model, category_model, vectorizer, decision_threshold)
                prediction = res['prediction']
                confidence = res['confidence']
                category_label = res['category']
                safety_score = res.get('safety_score', 88.0 if prediction == "SAFE" else 12.0)
                threat_score = res.get('threat_score', 12.0 if prediction == "SAFE" else 88.0)
                safety_rationale = res.get('safety_rationale', '')
                
                # 2. Heuristics & XAI Highlights
                regex_heuristics = execute_regex_heuristic_engine(message)
                dialect_signals = process_multilingual_lexicon_flags(message)
                xai_highlighted_output = execute_xai_word_highlighter(message)
                header_metrics, header_judgment = evaluate_transmission_headers(input_headers)
                
                # 3. SQL Persistent Layer Registration Write
                time_now = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
                risk_string = "🔴 Critical" if prediction == "SCAM" else "🟢 Compliant"
                save_telemetry_to_db(time_now, st.session_state['username'], st.session_state['user_role'], channel, message, prediction, f"{confidence:.1%}", risk_string)
                
                # 4. Automated Incident Response Dispatch Trigger
                if prediction == "SCAM":
                    meta_payload = {
                        "op_id": st.session_state['username'],
                        "channel": channel,
                        "confidence": f"{confidence:.1%}",
                        "category": category_label,
                        "message": message
                    }
                    if st.session_state['slack_url']:
                        dispatch_slack_alert(st.session_state['slack_url'], meta_payload)
                    if st.session_state['discord_url']:
                        dispatch_discord_alert(st.session_state['discord_url'], meta_payload)
                
                st.write("---")
                rc1, rc2 = st.columns(2)
                with rc1:
                    if prediction == "SAFE": 
                        st.success("✅ SYSTEM VALIDATION VERDICT: STRUCTURALLY CLEAN (SAFE)")
                    else: 
                        st.error(f"⚠️ MITRE THREAT ALERT ADVISORY: FRAUDULENT STRATEGY BLOCKED (SCAM)\n\n**Attack Subtype:** `{category_label}`")
                    st.write(f"**Source Vector:** {channel} | **Pipeline Confidence Metric:** {confidence:.1%}")

                with rc2:
                    st.metric("🛡️ Safety Rating", f"{safety_score}% Safe", f"{threat_score}% Threat Exposure")
                    st.progress(safety_score / 100.0)
                    if safety_rationale:
                        st.caption(f"**Safety Rationale:** {safety_rationale}")

                # AI Voice Agent Audio Speech Trigger
                if st.session_state.get('voice_enabled', True):
                    safe_or_scam = (
                        f"Security Alert! This message is rated only {safety_score}% safe, with an intercepted threat probability of {threat_score}%. Attack category: {category_label}."
                        if prediction == "SCAM" else
                        f"Analysis complete. This message is rated {safety_score}% safe. System validation verified clean."
                    )
                    st.components.v1.html(f"""
                    <script>
                      if ('speechSynthesis' in window) {{
                        window.speechSynthesis.cancel();
                        const utterance = new SpeechSynthesisUtterance("{safe_or_scam}");
                        utterance.rate = 1.05;
                        window.speechSynthesis.speak(utterance);
                      }}
                    </script>
                    """, height=0)
                with rc2:
                    if prediction == "SCAM" and (st.session_state['slack_url'] or st.session_state['discord_url']):
                        st.info("📡 **Incident Response Broadcast:** Dynamic telemetry dispatch streams deployed to configured secure channel links.")
                    elif prediction == "SCAM":
                        st.caption("ℹ️ Configure Slack or Discord webhooks in sidebar (Admin) to automate incident dispatches.")
                
                # Explainable AI section
                st.subheader("💡 Explainable AI (XAI) Weights Trace")
                st.markdown(f"<div style='background-color:#1e293b; padding:15px; border-radius:6px; color:#f8fafc; font-family:monospace;'>{xai_highlighted_output}</div>", unsafe_allow_html=True)
                
                # Flags section
                if regex_heuristics or dialect_signals or header_metrics:
                    st.subheader("🔍 Heuristic Traces & Indicator Signals")
                    if regex_heuristics:
                        for flag in regex_heuristics:
                            st.warning(flag)
                    if dialect_signals:
                        for d_flag in dialect_signals:
                            st.warning(d_flag)
                    if header_metrics:
                        st.write(f"**Email Headers Analysis:** {header_judgment}")
                        st.json(header_metrics)
                
            # Render Running Logs
            st.write("---")
            st.subheader("⏳ Permanent SQL Incident Registry Tracking Log Array")
            history_df = fetch_telemetry_history()
            if not history_df.empty:
                st.dataframe(history_df, use_container_width=True)
                if st.session_state['user_role'] == "Admin":
                    if st.button("🗑️ Purge Central Database Storage Log Arrays", type="primary"):
                        purge_all_db_telemetry()
                        st.success("Logs purged.")
                        st.rerun()
            else:
                st.info("📂 SQLite records currently clean.")

        # --- TAB 2: BATCH PIPELINE AUTOMATION ---
        with tab2:
            st.subheader("📁 Automated Batch Analysis")
            st.write("Upload a CSV file containing message payloads or run batch inspection on the loaded dataset.")
            
            uploaded_batch = st.file_uploader("Upload CSV for Batch Threat Scanning", type=["csv"])
            
            if uploaded_batch is not None:
                try:
                    batch_df = pd.read_csv(uploaded_batch)
                except Exception as e:
                    st.error(f"Error reading CSV: {e}")
                    batch_df = None
            else:
                if st.button("Load Pre-installed Dataset for Batch Evaluation"):
                    batch_df = load_data()
                else:
                    batch_df = None
                    
            if batch_df is not None:
                if 'message' not in batch_df.columns:
                    st.error("Uploaded CSV must contain a 'message' column.")
                else:
                    st.write(f"Loaded {len(batch_df)} rows for batch scanning.")
                    if st.button("⚡ Run Batch Threat Classification"):
                        with st.spinner("Processing batch payload matrices..."):
                            predictions = []
                            categories = []
                            confidences = []
                            
                            for text in batch_df['message']:
                                p = predict_single(str(text), model, category_model, vectorizer)
                                predictions.append(p['prediction'])
                                categories.append(p['category'])
                                confidences.append(f"{p['confidence']:.1%}")
                                
                            batch_df['Predicted Label'] = predictions
                            batch_df['Predicted Category'] = categories
                            batch_df['Confidence'] = confidences
                            
                            st.success("Batch classification complete!")
                            st.dataframe(batch_df, use_container_width=True)
                            
                            # Export CSV button
                            csv_buffer = io.StringIO()
                            batch_df.to_csv(csv_buffer, index=False)
                            st.download_button(
                                label="📥 Download Processed Telemetry CSV",
                                data=csv_buffer.getvalue(),
                                file_name=f"threat_batch_results_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
                                mime="text/csv"
                            )

        # --- TAB 3: TRAINING METRICS PROFILE ---
        with tab3:
            st.subheader("📊 Core Model Metrics & Evaluation Profile")
            st.write("Machine learning model architecture and baseline scores on current operational dataset:")
            
            try:
                df = load_data()
                summary = get_dataset_summary(df)
                
                m1, m2, m3 = st.columns(3)
                m1.metric("Training Dataset Size", f"{summary['total']} rows")
                m2.metric("Safe Corpus Samples", f"{summary['safe_count']}")
                m3.metric("Scam Corpus Samples", f"{summary['scam_count']}")
                
                st.write("---")
                st.write("### Model Specifications")
                st.markdown("""
                - **Binary Classifier:** Logistic Regression (`L-BFGS`, `C=1.0`, `max_iter=200`)
                - **Feature Extractor:** `TfidfVectorizer` (English stop-words, sublinear TF, 100 features)
                - **Subtype Category Classifier:** Multi-class Logistic Regression on verified malicious payloads
                """)
                
                if st.button("🔄 Trigger Real-time Model Retraining Loop", use_container_width=True):
                    with st.spinner("Retraining model artifacts..."):
                        metrics = train_models()
                        st.cache_resource.clear()
                        st.success(f"✅ Models retrained! Label Accuracy: {metrics['label_accuracy']:.2%} | Category Accuracy: {metrics['category_accuracy']:.2%}")
                        st.rerun()
            except Exception as e:
                st.error(f"Unable to read training specifications: {e}")

# --- 📊 OPERATIONAL DASHBOARD LAYER ---
elif page == "📊 Operational Dashboard":
    st.title("📊 Enterprise Analytics Dashboard Matrix")
    st.write("---")
    
    try:
        df = load_data()
        total = len(df)
        safe_count = int((df['label'] == 'SAFE').sum())
        scam_count = int((df['label'] == 'SCAM').sum())
        exposure_rate = (scam_count / total * 100) if total > 0 else 0
        
        # 1. Executive KPI Metrics Row
        col1, col2, col3, col4, col5 = st.columns(5)
        col1.metric("Total Payloads", f"{total}")
        col2.metric("Threat Exposure", f"{exposure_rate:.1f}%")
        col3.metric("Safe Traffic", f"{safe_count}")
        col4.metric("Scam Intercepts", f"{scam_count}")
        top_chan = df[df['label'] == 'SCAM']['channel'].value_counts().index[0] if scam_count > 0 else "N/A"
        col5.metric("Top Threat Node", f"{top_chan}")

        st.write("---")
        
        # 2. Charts Row
        col1, col2 = st.columns(2)

        # Pie Chart: Safe vs Scam Distribution
        with col1:
            fig_pie = px.pie(
                values=[safe_count, scam_count],
                names=['SAFE', 'SCAM'],
                title='Message Classification Ratio',
                color_discrete_map={'SAFE': '#22c55e', 'SCAM': '#ef4444'}
            )
            fig_pie.update_layout(template="plotly_dark")
            st.plotly_chart(fig_pie, use_container_width=True)

        # Bar Chart: Scam Categories
        with col2:
            scam_categories = df[df['label'] == 'SCAM']['category'].value_counts()
            fig_bar = px.bar(
                x=scam_categories.index,
                y=scam_categories.values,
                title='Attack Variant Frequency Distribution',
                labels={'x': 'Threat Category', 'y': 'Frequency'},
                color=scam_categories.values,
                color_continuous_scale='Reds'
            )
            fig_bar.update_layout(template="plotly_dark")
            st.plotly_chart(fig_bar, use_container_width=True)

        # 3. Channel Risk Analysis Table
        st.write("---")
        st.subheader("📡 Transmission Channel Vulnerability Matrix")
        
        channel_risk_df = df.groupby('channel').agg(
            Total=('label', 'count'),
            Safe=('label', lambda x: (x == 'SAFE').sum()),
            Scam=('label', lambda x: (x == 'SCAM').sum())
        ).reset_index()
        channel_risk_df['Malicious Ratio'] = (channel_risk_df['Scam'] / channel_risk_df['Total'] * 100).round(1).astype(str) + '%'
        channel_risk_df = channel_risk_df.sort_values(by='Scam', ascending=False)
        st.dataframe(channel_risk_df, use_container_width=True)

        # 4. Interactive Data Warehouse Explorer with Filters
        st.write("---")
        st.subheader("📋 Data Warehouse Explorer")
        
        fc1, fc2, fc3, fc4 = st.columns([1, 1, 1, 1.5])
        with fc1:
            label_filter = st.selectbox("Filter Label:", ["ALL", "SAFE", "SCAM"])
        with fc2:
            channels_list = ["ALL"] + sorted(list(df['channel'].unique()))
            channel_filter = st.selectbox("Filter Channel:", channels_list)
        with fc3:
            categories_list = ["ALL"] + sorted([c for c in df['category'].unique() if pd.notna(c)])
            cat_filter = st.selectbox("Filter Category:", categories_list)
        with fc4:
            search_query = st.text_input("🔍 Search Payload Message:", placeholder="Type keywords...")

        # Apply filters
        filtered_df = df.copy()
        if label_filter != "ALL":
            filtered_df = filtered_df[filtered_df['label'] == label_filter]
        if channel_filter != "ALL":
            filtered_df = filtered_df[filtered_df['channel'] == channel_filter]
        if cat_filter != "ALL":
            filtered_df = filtered_df[filtered_df['category'] == cat_filter]
        if search_query:
            filtered_df = filtered_df[filtered_df['message'].str.contains(search_query, case=False, na=False)]

        st.caption(f"Showing {len(filtered_df)} of {total} records")
        st.dataframe(filtered_df, use_container_width=True)
        
        # Download filtered data
        csv_buffer = io.StringIO()
        filtered_df.to_csv(csv_buffer, index=False)
        st.download_button(
            label="📥 Export Filtered Warehouse CSV",
            data=csv_buffer.getvalue(),
            file_name=f"threat_warehouse_filtered_{datetime.now().strftime('%Y%m%d_%H%M%S')}.csv",
            mime="text/csv"
        )
        
    except Exception as e:
        st.error(f"Error loading dashboard data: {e}")

# --- 📚 KNOWLEDGE CENTER MATRIX VECTOR ---
elif page == "📚 Knowledge Vector":
    st.title("📚 Security Awareness & Threat Matrix Vector")
    st.write("---")
    
    st.markdown("""
    ### Threat Taxonomy Catalog
    
    1. **Phishing Attacks**
       - *Definition:* Attempts to obtain sensitive credentials (passwords, OTPs, session keys) by impersonating trusted entities.
       - *Indicators:* Urgency keywords (`act now`, `suspended`), spoofed login domains, mismatched headers.
    
    2. **Reward & Lottery Scams**
       - *Definition:* Fraudulent offers claiming the target has won money or prizes to trick them into paying "processing fees".
       - *Indicators:* `Claim reward`, `You won a prize`, `Lucky winner`.
    
    3. **Financial & Investment Scams**
       - *Definition:* Promises of unrealistic returns (e.g. 100% daily returns, crypto doubling schemes).
       - *Indicators:* `Guaranteed return`, `crypto wallet`, `deposit private key`.
    
    4. **Regional Dialect Fraud Vectors (Teenglish & Hinglish)**
       - *Definition:* Social engineering campaigns crafted in Romanized regional dialects to bypass standard English NLP filters.
       - *Keywords Checked:* `meeku`, `gelicharu`, `dabbu`, `paisa`, `khata band`, `jaldi kijiye`.
    
    5. **Identity & KYC Fraud**
       - *Definition:* Coercing targets into sharing identity documents or banking details under the guise of mandatory compliance.
       - *Indicators:* `Update KYC`, `verify bank details`, `account closure notice`.
    """)
    
    st.success("✅ Knowledge matrix vectors verified and up-to-date.")
