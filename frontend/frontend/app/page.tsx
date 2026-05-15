'use client'

import { useState } from 'react'
import { ConnectButton } from '@rainbow-me/rainbowkit'
import { useReadContract } from 'wagmi'
import { TRACE_REGISTRY, TRACE_BETTING } from '@/lib/wagmi'
import { TRACE_REGISTRY_ABI, TRACE_BETTING_ABI } from '@/lib/abis'
import TraceCard from '@/components/TraceCard'
import BettingPanel from '@/components/BettingPanel'

export default function Home() {
  const [selectedTrace, setSelectedTrace] = useState<bigint | null>(null)

  const { data: traceCount } = useReadContract({
    address: TRACE_REGISTRY,
    abi: TRACE_REGISTRY_ABI,
    functionName: 'traceCount',
  })

  const { data: marketCount } = useReadContract({
    address: TRACE_BETTING,
    abi: TRACE_BETTING_ABI,
    functionName: 'marketCount',
  })

  const count = traceCount ? Number(traceCount) : 0

  return (
    <main style={{ minHeight: '100vh', padding: '1.5rem', maxWidth: '1100px', margin: '0 auto' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem', borderBottom: '1px solid var(--border)', paddingBottom: '1rem' }}>
        <div>
          <div style={{ color: 'var(--text-muted)', fontSize: '11px', letterSpacing: '0.15em', marginBottom: '4px' }}>
            AGORA AGENTS HACKATHON · ARC TESTNET
          </div>
          <h1 style={{ fontSize: '22px', color: 'var(--green)', margin: 0, fontWeight: 500 }}>
            Trading-R1 Trace Market
          </h1>
          <div style={{ color: 'var(--text-muted)', fontSize: '13px', marginTop: '4px' }}>
            Bet on AI reasoning quality — before the trade resolves
          </div>
        </div>
        <ConnectButton />
      </div>

      <div style={{ display: 'flex', gap: '1.5rem', marginBottom: '2rem' }}>
        {[
          { label: 'Traces on-chain', value: count.toString() },
          { label: 'Active markets', value: marketCount ? Number(marketCount).toString() : '0' },
          { label: 'Settlement token', value: 'USDC' },
          { label: 'Chain', value: 'Arc Testnet' },
        ].map(s => (
          <div key={s.label} style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: '8px', padding: '0.75rem 1.25rem' }}>
            <div style={{ fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>{s.label}</div>
            <div style={{ fontSize: '18px', color: 'var(--green)', fontWeight: 500 }}>{s.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '1rem' }}>
        {count === 0 && (
          <div style={{ color: 'var(--text-muted)', fontSize: '14px', gridColumn: '1/-1', padding: '2rem 0' }}>
            No traces yet. Run the agent pipeline to publish the first one.
          </div>
        )}
        {Array.from({ length: count }).map((_, i) => (
          <TraceCard
            key={i}
            traceId={BigInt(i)}
            onClick={() => setSelectedTrace(BigInt(i))}
            selected={selectedTrace === BigInt(i)}
          />
        ))}
      </div>

      {selectedTrace !== null && (
        <BettingPanel traceId={selectedTrace} onClose={() => setSelectedTrace(null)} />
      )}
    </main>
  )
}
