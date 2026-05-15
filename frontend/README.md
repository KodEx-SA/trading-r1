<<<<<<< HEAD
This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
=======
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
>>>>>>> 25d49ad1df9b076c8592076cdfdc9c70b3067ad4
