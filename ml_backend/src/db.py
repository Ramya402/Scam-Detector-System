"""
SQLite Database Module
Manages permanent threat logs table and CRUD operations.
"""

import sqlite3
import pandas as pd

DB_FILE = 'threat_intelligence.db'

def init_threat_db(db_path=DB_FILE):
    """
    Initializes the SQLite database schema if not present.
    """
    try:
        conn = sqlite3.connect(db_path)
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
        return True
    except Exception as e:
        print(f"Database Initialization Error: {e}")
        return False

def save_telemetry_to_db(timestamp, op_id, op_role, channel, message, decision, confidence, grade, db_path=DB_FILE):
    """
    Inserts a record into the threat_logs table.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute('''
            INSERT INTO threat_logs (timestamp, operator_id, operator_role, channel_node, payload_message, system_decision, confidence_score, risk_grade)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (timestamp, op_id, op_role, channel, message, decision, confidence, grade))
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"DB Write Failed: {e}")
        return False

def fetch_telemetry_history(db_path=DB_FILE):
    """
    Retrieves all threat logs sorted by newest first.
    """
    try:
        conn = sqlite3.connect(db_path)
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

def purge_all_db_telemetry(db_path=DB_FILE):
    """
    Deletes all threat log records.
    """
    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        cursor.execute("DELETE FROM threat_logs")
        conn.commit()
        conn.close()
        return True
    except Exception as e:
        print(f"DB Purge Failed: {e}")
        return False
