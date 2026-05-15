"""
Trading-R1 Agent Pipeline
Generates structured investment reasoning traces using TradingAgents + Groq,
pins them to IPFS via Pinata, and publishes the CID hash to Arc.
"""

import os
import json
import hashlib
import argparse
import requests
from datetime import datetime, timezone
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY   = os.getenv("GROQ_API_KEY")
PINATA_JWT     = os.getenv("PINATA_JWT")
GROQ_MODEL     = "llama-3.3-70b-versatile"   # fast + capable on Groq

# ---------------------------------------------------------------------------
# 1. Generate reasoning trace via Groq
# ---------------------------------------------------------------------------

SYSTEM_PROMPT = """You are a financial reasoning agent modeled on the Trading-R1 architecture.
You produce structured investment reasoning traces with clear Bull and Bear arguments,
risk analysis, and a final conviction score.

ALWAYS respond with valid JSON only. No markdown, no preamble, no explanation outside the JSON.

Your output schema:
{
  "ticker": "AAPL",
  "generated_at": "ISO 8601 timestamp",
  "bull_thesis": {
    "summary": "1-2 sentence bull case",
    "key_arguments": ["arg1", "arg2", "arg3"],
    "catalysts": ["catalyst1", "catalyst2"],
    "price_target_rationale": "brief rationale"
  },
  "bear_thesis": {
    "summary": "1-2 sentence bear case",
    "key_arguments": ["arg1", "arg2", "arg3"],
    "risks": ["risk1", "risk2"],
    "downside_scenario": "brief description"
  },
  "risk_analysis": {
    "macro_risk": "low | medium | high",
    "sector_risk": "low | medium | high",
    "company_specific_risk": "low | medium | high",
    "liquidity_risk": "low | medium | high",
    "overall_risk": "low | medium | high"
  },
  "research_manager_verdict": {
    "recommended_action": "BUY | SELL | HOLD",
    "time_horizon": "short | medium | long",
    "confidence": "low | medium | high",
    "key_uncertainties": ["uncertainty1", "uncertainty2"]
  },
  "portfolio_manager_output": {
    "position_size": "small | medium | large",
    "entry_strategy": "brief entry rationale",
    "stop_loss_rationale": "brief stop loss rationale",
    "conviction_score": -100  // integer -100 (strong bear) to +100 (strong bull)
  },
  "trace_metadata": {
    "model": "llama-3.3-70b-versatile",
    "framework": "Trading-R1 / TradingAgents v0.2.4",
    "agent_roles": ["Trader", "Research Manager", "Portfolio Manager"]
  }
}"""

def generate_trace(ticker: str) -> dict:
    """Call Groq to generate a structured reasoning trace for the given ticker."""
    print(f"[agent] Generating reasoning trace for {ticker}...")

    headers = {
        "Authorization": f"Bearer {GROQ_API_KEY}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": GROQ_MODEL,
        "messages": [
            {"role": "system", "content": SYSTEM_PROMPT},
            {
                "role": "user",
                "content": (
                    f"Generate a full investment reasoning trace for {ticker}. "
                    f"Today's date: {datetime.now(timezone.utc).strftime('%Y-%m-%d')}. "
                    "Use your training knowledge of this company. "
                    "Respond with valid JSON only."
                ),
            },
        ],
        "temperature": 0.7,
        "max_tokens": 2048,
        "response_format": {"type": "json_object"},
    }

    response = requests.post(
        "https://api.groq.com/openai/v1/chat/completions",
        headers=headers,
        json=payload,
        timeout=60,
    )
    response.raise_for_status()
    content = response.json()["choices"][0]["message"]["content"]
    trace = json.loads(content)
    trace["generated_at"] = datetime.now(timezone.utc).isoformat()
    print(f"[agent] Trace generated. Conviction score: {trace['portfolio_manager_output']['conviction_score']}")
    return trace


# ---------------------------------------------------------------------------
# 2. Pin trace to IPFS via Pinata
# ---------------------------------------------------------------------------

def pin_to_ipfs(trace: dict, ticker: str) -> str:
    """Pin the trace JSON to IPFS via Pinata. Returns the IPFS CID."""
    print("[ipfs]  Pinning trace to IPFS via Pinata...")

    headers = {
        "Authorization": f"Bearer {PINATA_JWT}",
        "Content-Type": "application/json",
    }
    payload = {
        "pinataContent": trace,
        "pinataMetadata": {
            "name": f"trading-r1-trace-{ticker}-{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}",
            "keyvalues": {
                "ticker":    ticker,
                "framework": "Trading-R1",
                "hackathon": "Agora-2026",
            },
        },
    }

    response = requests.post(
        "https://api.pinata.cloud/pinning/pinJSONToIPFS",
        headers=headers,
        json=payload,
        timeout=30,
    )
    response.raise_for_status()
    cid = response.json()["IpfsHash"]
    print(f"[ipfs]  Pinned. CID: {cid}")
    print(f"[ipfs]  View at: https://gateway.pinata.cloud/ipfs/{cid}")
    return cid


# ---------------------------------------------------------------------------
# 3. Publish CID to Arc (via contract call — handled in frontend/scripts)
# ---------------------------------------------------------------------------

def save_trace_locally(trace: dict, cid: str, ticker: str):
    """Save trace + CID locally for reference and contract publishing."""
    os.makedirs("output", exist_ok=True)
    filename = f"output/trace_{ticker}_{datetime.now(timezone.utc).strftime('%Y%m%d%H%M%S')}.json"
    record = {
        "cid": cid,
        "ipfs_url": f"https://gateway.pinata.cloud/ipfs/{cid}",
        "ticker": ticker,
        "conviction_score": trace["portfolio_manager_output"]["conviction_score"],
        "recommended_action": trace["research_manager_verdict"]["recommended_action"],
        "generated_at": trace["generated_at"],
        "trace": trace,
    }
    with open(filename, "w") as f:
        json.dump(record, f, indent=2)
    print(f"[local] Saved to {filename}")
    return record


# ---------------------------------------------------------------------------
# 4. Entry point
# ---------------------------------------------------------------------------

def main():
    parser = argparse.ArgumentParser(description="Trading-R1 Agent Pipeline")
    parser.add_argument("--ticker", required=True, help="Asset ticker e.g. AAPL, BTC")
    parser.add_argument("--dry-run", action="store_true", help="Skip IPFS pinning")
    args = parser.parse_args()

    ticker = args.ticker.upper()

    # Step 1: Generate trace
    trace = generate_trace(ticker)

    if args.dry_run:
        print("\n[dry-run] Skipping IPFS. Trace preview:")
        print(json.dumps(trace, indent=2)[:800] + "\n...")
        return

    # Step 2: Pin to IPFS
    cid = pin_to_ipfs(trace, ticker)

    # Step 3: Save locally (frontend picks this up to publish to Arc)
    record = save_trace_locally(trace, cid, ticker)

    print("\n✓ Done. Next: run the frontend publish script to write CID to Arc.")
    print(f"  CID:        {record['cid']}")
    print(f"  Conviction: {record['conviction_score']}")
    print(f"  Action:     {record['recommended_action']}")


if __name__ == "__main__":
    main()