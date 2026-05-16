# Trading-R1 Trace Market

> **Agora Agents Hackathon · May 11–25, 2026**
> Built by KodEx-SA · Submitted via `arc-canteen`

A reasoning-trace marketplace built on Arc. AI agents generate structured investment theses via the TradingAgents framework, each trace is pinned to IPFS and hashed on-chain, and users stake USDC on which reasoning patterns converge to profit.

**The insight: the reasoning trace is the product, not the trade.**

---

## Architecture

```
trading-r1/
├── agent/          # Python — TradingAgents pipeline (Groq + structured JSON)
├── contracts/      # Solidity — TraceRegistry + TraceBetting (Foundry)
├── frontend/       # Next.js 15 — dashboard, wallet connect, bet UI
└── docs/           # Research references
```

---

## Deployed Contracts (Arc Testnet)

| Contract | Address |
|---|---|
| TraceRegistry | `0xFCecBade44124eE3a8D8Bd2aA38895D342F5780d` |
| TraceBetting | `0x787d8F168D00ceD373f306645bB5f9Fae9A4860d` |

---

## Arc Testnet

| Field | Value |
|---|---|
| Chain ID | `5042002` |
| RPC | `https://rpc.testnet.arc.network` |
| Explorer | `https://testnet.arcscan.app` |
| Faucet | `https://faucet.circle.com` |
| USDC | `0x3600000000000000000000000000000000000000` |

---

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
python publish_trace.py  # pins to IPFS + writes CID to Arc
```

### 3. Contracts
```bash
cd contracts
# Install Foundry: curl -L https://foundry.paradigm.xyz | bash && foundryup
forge install foundry-rs/forge-std
cp .env.example .env   # add PRIVATE_KEY + RPC
source .env && forge script script/Deploy.s.sol --rpc-url $RPC --broadcast
```

### 4. Frontend
```bash
cd frontend
npm install
cp .env.example .env.local   # add contract addresses + NEXT_PUBLIC_* vars
npm run dev
```

---

## How it works

1. Agent generates a structured reasoning trace (Bull/Bear thesis, risk analysis, conviction score)
2. Trace is serialized to JSON and pinned to IPFS via Pinata
3. IPFS CID + ticker + timestamp is written to `TraceRegistry` contract on Arc
4. Users connect wallet, browse live traces, and stake USDC in `TraceBetting` contract
5. After N days, price is checked — winning bets are paid out from escrow proportionally

---

## Research basis

- [Trading-R1 — Tauric Research (2025)](https://arxiv.org/abs/2509.11420)
- [TradingAgents — Wang et al. (2024)](https://arxiv.org/abs/2412.20138)

---

## Judging alignment

| Criterion (weight) | How we address it |
|---|---|
| Agentic sophistication (30%) | Multi-role agent: Trader + Research Manager + Portfolio Manager all emit structured JSON reasoning blocks |
| Traction (30%) | Deployed to Vercel, public URL, real testnet USDC transactions on Arc |
| Circle tool usage (20%) | USDC escrow on Arc, native USDC gas, App Kit wallet connect via RainbowKit |
| Innovation (20%) | Betting on reasoning quality before trade resolution — a new market type that didn't exist before |

---

## Built with

- [Next.js 15](https://nextjs.org) + TypeScript + Tailwind
- [wagmi](https://wagmi.sh) + [RainbowKit](https://rainbowkit.com) — wallet connect
- [Groq](https://groq.com) — LLM inference (llama-3.3-70b)
- [Pinata](https://pinata.cloud) — IPFS pinning
- [Foundry](https://getfoundry.sh) — Solidity contracts
- [Arc Testnet](https://arc.network) — USDC-native L1
