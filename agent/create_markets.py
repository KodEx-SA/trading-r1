import os
from web3 import Web3
from dotenv import load_dotenv

load_dotenv()

RPC_URL     = os.getenv("RPC") or os.getenv("ARC_TESTNET_RPC_URL")
PRIVATE_KEY = os.getenv("PRIVATE_KEY")
BETTING     = "0x787d8F168D00ceD373f306645bB5f9Fae9A4860d"
REGISTRY    = "0xFCecBade44124eE3a8D8Bd2aA38895D342F5780d"

BETTING_ABI = [{
    "name": "createMarket",
    "type": "function",
    "stateMutability": "nonpayable",
    "inputs": [
        {"name": "traceId",         "type": "uint256"},
        {"name": "durationSeconds", "type": "uint256"},
    ],
    "outputs": [{"name": "marketId", "type": "uint256"}],
}, {
    "name": "marketCount",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"type": "uint256"}],
}]

REGISTRY_ABI = [{
    "name": "traceCount",
    "type": "function",
    "stateMutability": "view",
    "inputs": [],
    "outputs": [{"type": "uint256"}],
}]

w3       = Web3(Web3.HTTPProvider(RPC_URL))
account  = w3.eth.account.from_key(PRIVATE_KEY)
betting  = w3.eth.contract(address=Web3.to_checksum_address(BETTING),  abi=BETTING_ABI)
registry = w3.eth.contract(address=Web3.to_checksum_address(REGISTRY), abi=REGISTRY_ABI)

trace_count  = registry.functions.traceCount().call()
market_count = betting.functions.marketCount().call()

print(f"Traces on-chain: {trace_count}")
print(f"Markets already: {market_count}")
print(f"Creating markets for traces {market_count} to {trace_count - 1}...")

# 7 days in seconds
DURATION = 7 * 24 * 60 * 60

for trace_id in range(market_count, trace_count):
    nonce = w3.eth.get_transaction_count(account.address)
    tx = betting.functions.createMarket(trace_id, DURATION).build_transaction({
        "from":     account.address,
        "nonce":    nonce,
        "gas":      200000,
        "gasPrice": w3.eth.gas_price,
    })
    signed  = account.sign_transaction(tx)
    tx_hash = w3.eth.send_raw_transaction(signed.raw_transaction)
    receipt = w3.eth.wait_for_transaction_receipt(tx_hash)
    print(f"✓ Market for trace #{trace_id} created — block {receipt['blockNumber']}")

print(f"\nDone. {trace_count - market_count} markets created.")
