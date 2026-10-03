"""
Heuristic Engine & Explainable AI (XAI) Module
Contains:
1. Regex pattern heuristics
2. Multilingual / Dialect flags (Telugu/Teenglish, Hindi/Hinglish)
3. Transmission security headers (SPF, DKIM, DMARC)
4. Explainable AI (XAI) threat keyword highlighter
"""

import re

def process_multilingual_lexicon_flags(text: str) -> list:
    """
    Detects regional Romanized dialect scam keywords (Teenglish and Hinglish).
    """
    lowered = text.lower()
    flags_caught = []
    
    # Romanized Telugu (Teenglish) scam lexicon
    if re.search(r'\b(meeku|gelicharu|dabbu|guddiga|dabulu|gelusko|vachindi|freega|lottary)\b', lowered):
        flags_caught.append("⚠️ Structural Trace Identified: Romanized Telugu (Teenglish) Scam Lexicon Pattern")
        
    # Romanized Hindi (Hinglish) urgent threat lexicon
    if re.search(r'\b(paisa|milega|jeet|jeeta|inam|khata|band|jaldi|kijiye|gpay)\b', lowered):
        flags_caught.append("⚠️ Structural Trace Identified: Romanized Hindi (Hinglish) Urgent Threat Lexicon Pattern")
        
    return flags_caught

def execute_xai_word_highlighter(text: str) -> str:
    """
    Highlights suspicious scam indicator keywords with HTML badges for Explainable AI (XAI).
    """
    weights_dictionary = [
        r"\bwin\b", r"\bwinner\b", r"\blottery\b", r"\burgent\b", r"\bexpire\b", r"\bclick\b", 
        r"\bfree\b", r"\bsuspended\b", r"\bmeeku\b", r"\bpaisa\b", r"\blogin\b", r"\bverify\b",
        r"\bpassword\b", r"\bcard\b", r"\bwa\.me\b", r"\bkyc\b", r"\bupdate\b", r"\binherited\b",
        r"\bprize\b", r"\binvestment\b", r"\breward\b"
    ]
    # Only highlight 'congratulations' if accompanied by scam/fraud indicators
    if re.search(r'\b(win|winner|prize|lottery|reward|claim|selected|money|free|urgent|deposit|inherited)\b', text, re.IGNORECASE):
        weights_dictionary.append(r"\bcongratulations\b")

    parsed_sequence = text
    for token in weights_dictionary:
        parsed_sequence = re.sub(
            token, 
            lambda match: f"<b style='color:#ffffff; background-color:#ef553b; padding:2px 6px; border-radius:3px;'>{match.group(0)}</b>", 
            parsed_sequence, 
            flags=re.IGNORECASE
        )
    return parsed_sequence

def evaluate_transmission_headers(header_block: str):
    """
    Analyzes SPF, DKIM, and DMARC transmission headers to detect email spoofing.
    """
    if not header_block or not header_block.strip():
        return None, "🟢 No transmission security headers provided for inspector tracing analysis."
        
    checks_matrix = {
        "SPF Status": "❌ ABSENT/UNVERIFIED",
        "DKIM Trace": "❌ ABSENT/UNVERIFIED",
        "DMARC Alignment": "❌ ABSENT/UNVERIFIED"
    }
    vulnerability_points = 0
    raw_lower = header_block.lower()
    
    if "spf=pass" in raw_lower:
        checks_matrix["SPF Status"] = "🟢 PASS"
    elif "spf=fail" in raw_lower:
        checks_matrix["SPF Status"] = "🔴 MALICIOUS FORGERY DETECTED (FAIL)"
        vulnerability_points += 40
        
    if "dkim=pass" in raw_lower:
        checks_matrix["DKIM Trace"] = "🟢 PASS"
    elif "dkim=fail" in raw_lower:
        checks_matrix["DKIM Trace"] = "🔴 FAIL (INVALID CRYPTOGRAPHIC SIGNATURE)"
        vulnerability_points += 30
        
    if "dmarc=pass" in raw_lower:
        checks_matrix["DMARC Alignment"] = "🟢 PASS"
    elif "dmarc=fail" in raw_lower:
        checks_matrix["DMARC Alignment"] = "🔴 ALIGNMENT BREAKDOWN (FAIL)"
        vulnerability_points += 30
    
    if vulnerability_points >= 40:
        security_status = "🔴 CRITICAL: Domain Spoofing Confirmed."
    elif vulnerability_points > 0:
        security_status = "🟡 WARNING: Ambiguous tracking configurations."
    else:
        security_status = "🟢 SECURE: Verification indicators check clean."
        
    return checks_matrix, security_status

def execute_regex_heuristic_engine(text: str) -> list:
    """
    Scans text payloads for suspicious links, financial triggers, urgency patterns, and card formats.
    """
    matched_flags = []
    
    # URL and suspicious TLD detection
    if re.search(r'https?://[^\s]+', text, re.IGNORECASE):
        if re.search(r'\.(xyz|top|click|info|biz|cc|bit|shorturl|tk|ml)\b', text, re.IGNORECASE):
            matched_flags.append("🔴 Malicious/Untrusted High-Risk TLD target link detected")
        else:
            matched_flags.append("🚨 External hyperlink formatting matched inside sequence")
            
    # Crypto / Financial Ledger extraction
    if re.search(r'\b(crypto|bitcoin|btc|eth|wallet|seed phrase|private key|deposit)\b', text, re.IGNORECASE):
        matched_flags.append("🟠 Financial Cryptographic Ledger targeted extraction parameters trigger")
        
    # Urgency & Emotional Manipulation patterns
    if re.search(r'\b(urgent|immediate|act now|suspended|unauthorized|blocked|expires? soon)\b', text, re.IGNORECASE):
        matched_flags.append("⏰ Emotional Manipulation/Urgency pressure pattern")
        
    # Credit/Debit Card pattern (16 digits in groups of 4)
    if re.search(r'\b(\d{4}[-\s]?){3}\d{4}\b', text):
        matched_flags.append("🔴 Structural sequence: Primary Credit/Debit Card String footprint")
        
    return matched_flags
