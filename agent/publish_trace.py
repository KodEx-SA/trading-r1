import json
import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

RPC_URL     = os.getenv("RPC") or os.getenv("ARC_TESTNET_RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
REGISTRY    = "0xFCecBade44124eE3a8D8Bd2aA38895D342F5780d"

ABI = [{
    "name": "publishTrace",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
        {"name": "ipfsCid",    "type": "string"},
        {"name": "ticker",     "type": "string"},
        {"name": "conviction", "type": "int8"},
    ],
    "outputs": [{"name": "traceId", "type": "uint256"}],
}]

# Load latest trace from output/
import glob
files = sorted(glob.glob("output/trace_*.json"))
if not files:
    print("No trace files found. Run run_agent.py first.")
    exit(1)

import sys
latest = sys.argv[1] if len(sys.argv) > 1 else files[-1]
with open(latest) as f:
    record = json.load(f)

cid        = record["cid"]
ticker     = record["ticker"]
conviction = int(record["conviction_score"])

print(f"Publishing: {ticker} | CID: {cid} | Conviction: {conviction}")

w3      = Web3(Web3.HTTPProvider(RPC_URL))
account = w3.eth.account.from_key(PRIVATE_KEY)
contract = w3.eth.contract(address=Web3.to_checksum_address(REGISTRY), abi=ABI)

tx = contract.functions.publishTrace(cid, ticker, conviction).build_transaction({
    "from":     account.address,
    "nonce":    w3.eth.get_transaction_count(account.address),
    "gas":      300000,
    "gasPrice": w3.eth.gas_price,
})

signed = account.sign_transaction(tx)
tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
print(f"Tx sent: {tx_hash.hex()}")

receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
print(f"✓ Confirmed in block {receipt['blockNumber']}")
print(f"  Explorer: https://testnet.arcscan.app/tx/{tx_hash.hex()}")
