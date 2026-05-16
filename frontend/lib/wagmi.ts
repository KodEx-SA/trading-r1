import { createConfig, http } from 'wagmi'
import { defineChain } from 'viem'
import { getDefaultConfig } from '@rainbow-me/rainbowkit'

export const arcTestnet = defineChain({
  id: 5042002,
  name: 'Arc Testnet',
  nativeCurrency: { name: 'USDC', symbol: 'USDC', decimals: 18 },
  rpcUrls: {
    default: { http: ['https://rpc.testnet.arc.network'] },
  },
  blockExplorers: {
    default: { name: 'ArcScan', url: 'https://testnet.arcscan.app' },
  },
  testnet: true,
})

export const wagmiConfig = getDefaultConfig({
  appName: 'Trading-R1 Trace Market',
  projectId: process.env.NEXT_PUBLIC_WALLETCONNECT_ID || 'trading-r1-agora-2026',
  chains: [arcTestnet],
  transports: {
    [arcTestnet.id]: http(process.env.NEXT_PUBLIC_RPC_URL || 'https://rpc.testnet.arc.network'),
  },
  ssr: true,
})

export const USDC_ADDRESS = process.env.NEXT_PUBLIC_USDC_ADDRESS as `0x${string}`
export const TRACE_REGISTRY = process.env.NEXT_PUBLIC_TRACE_REGISTRY as `0x${string}`
export const TRACE_BETTING  = process.env.NEXT_PUBLIC_TRACE_BETTING  as `0x${string}`
