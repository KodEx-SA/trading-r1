# Trading-R1 Trace Market

> **Agora Agents Hackathon · May 11–25, 2026**  
> Built by KodEx-SA · Submitted via `arc-canteen`

A reasoning-trace marketplace built on Arc. AI agents generate structured investment theses via the TradingAgents framework, each trace is pinned to IPFS and hashed on-chain, and users stake USDC on which reasoning patterns converge to profit.

**The insight:** the reasoning trace is the product, not the trade.

---

## Architecture

```
trading-r1/
├── agent/          # Python — TradingAgents pipeline (Groq + structured JSON)
├── contracts/      # Solidity — TraceRegistry + TraceBetting (Foundry)
├── frontend/       # Next.js 15 — dashboard, wallet connect, bet UI
└── docs/           # Research references
```

## Arc Testnet

| Field       | Value                                   |
|-------------|-----------------------------------------|
| Chain ID    | `5042002`                               |
| RPC         | `https://rpc.testnet.arc.network`       |
| Explorer    | `https://testnet.arcscan.app`           |
| Faucet      | `https://faucet.circle.com`             |
| USDC        | `0x3600000000000000000000000000000000000000` |

## Quick Start

### 1. Arc Testnet wallet
- Install MetaMask
- Add Arc Testnet: Chain ID `5042002`, RPC `https://rpc.testnet.arc.network`
- Get testnet USDC from `https://faucet.circle.com`

### 2. Agent pipeline
```bash
cd agent
python -m venv venv && source venv/bin/activate
pip install -r requirements.txt
cp .env.example .env   # add GROQ_API_KEY + PINATA_JWT
python run_agent.py --ticker AAPL
```

### 3. Contracts
```bash
cd contracts
# Install Foundry: curl -L https://foundry.paradigm.xyz | bash && foundryup
forge install
cp .env.example .env   # add PRIVATE_KEY + ARC_TESTNET_RPC_URL
forge test
forge script script/Deploy.s.sol --rpc-url $ARC_TESTNET_RPC_URL --broadcast
```

### 4. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # add contract addresses + NEXT_PUBLIC_* vars
npm run dev
```

## How it works

1. Agent generates a structured reasoning trace (Bull/Bear thesis, risk analysis, conviction score)
2. Trace is serialized to JSON and pinned to IPFS via Pinata
3. IPFS CID + ticker + timestamp is hashed and written to `TraceRegistry` contract on Arc
4. Users connect wallet, browse live traces, and stake USDC in `TraceBetting` contract
5. After N days, price is checked (yfinance) — winning bets are paid out from escrow

## Judging alignment

| Criterion (weight)            | How we address it |
|-------------------------------|-------------------|
| Agentic sophistication (30%)  | Multi-role agent: Trader + Research Manager + Portfolio Manager all emit structured JSON |
| Traction (30%)                | Deployed to Vercel, public URL, real testnet transactions |
| Circle tool usage (20%)       | USDC escrow on Arc, Paymaster for gasless UX, App Kit wallet connect |
| Innovation (20%)              | Betting on reasoning quality before trade resolution — new market type |
