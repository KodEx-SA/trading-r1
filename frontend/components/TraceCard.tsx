'use client'

import { useReadContract } from 'wagmi'
import { TRACE_REGISTRY } from '@/lib/wagmi'
import { TRACE_REGISTRY_ABI } from '@/lib/abis'

interface Props {
  traceId: bigint
  onClick: () => void
  selected: boolean
}

export default function TraceCard({ traceId, onClick, selected }: Props) {
  const { data: trace, isLoading } = useReadContract({
    address:      TRACE_REGISTRY,
    abi:          TRACE_REGISTRY_ABI,
    functionName: 'getTrace',
    args:         [traceId],
  })

  if (isLoading || !trace) {
    return (
      <div style={cardStyle(false)}>
        <span style={{ color: 'var(--text-muted)', fontSize: '13px' }}>Loading trace #{traceId.toString()}...</span>
      </div>
    )
  }

  const conviction = Number(trace.conviction)
  const isBull     = conviction > 0
  const barWidth   = Math.abs(conviction)
  const date       = new Date(Number(trace.timestamp) * 1000).toLocaleDateString()

  return (
    <div style={cardStyle(selected)} onClick={onClick}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
        <div style={{ fontSize: '18px', fontWeight: 600, color: 'var(--green)' }}>{trace.ticker}</div>
        <span style={{
          fontSize: '11px', padding: '2px 10px', borderRadius: '20px',
          background: isBull ? '#0a2a0a' : '#2a0a0a',
          color: isBull ? 'var(--bull)' : 'var(--bear)',
          border: `1px solid ${isBull ? '#1a4a1a' : '#4a1a1a'}`,
        }}>
          {isBull ? '▲ BULL' : '▼ BEAR'}
        </span>
      </div>

      <div style={{ marginBottom: '12px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '11px', color: 'var(--text-muted)', marginBottom: '4px' }}>
          <span>Conviction</span>
          <span style={{ color: isBull ? 'var(--bull)' : 'var(--bear)' }}>
            {conviction > 0 ? '+' : ''}{conviction}
          </span>
        </div>
        <div style={{ height: '4px', background: '#1a1a1a', borderRadius: '2px' }}>
          <div style={{
            height: '4px', borderRadius: '2px',
            width: `${barWidth}%`,
            background: isBull ? 'var(--bull)' : 'var(--bear)',
          }} />
        </div>
      </div>

      <div style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'flex', justifyContent: 'space-between' }}>
        <span>#{traceId.toString()}</span>
        <span>{date}</span>
      </div>

      <div style={{ marginTop: '10px', fontSize: '11px', color: 'var(--text-muted)' }}>
        <span style={{ color: 'var(--green-muted)' }}>IPFS </span>
        
          href={`${process.env.NEXT_PUBLIC_PINATA_GATEWAY}/${trace.ipfsCid}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--text-muted)', textDecoration: 'underline' }}
          onClick={e => e.stopPropagation()}
        >
          {trace.ipfsCid.slice(0, 20)}…
        </a>
      </div>

      <button style={{
        marginTop: '14px', width: '100%', padding: '8px',
        background: selected ? 'var(--green-muted)' : 'transparent',
        border: '1px solid var(--green-muted)',
        color: selected ? 'var(--bg)' : 'var(--green)',
        borderRadius: '6px', cursor: 'pointer', fontSize: '12px',
        fontFamily: 'inherit',
      }}>
        {selected ? '✓ Selected — place bet below' : 'Select to bet'}
      </button>
    </div>
  )
}

function cardStyle(selected: boolean): React.CSSProperties {
  return {
    background:   'var(--bg-card)',
    border:       `1px solid ${selected ? 'var(--green-muted)' : 'var(--border)'}`,
    borderRadius: '10px',
    padding:      '1rem 1.25rem',
    cursor:       'pointer',
    transition:   'border-color 0.15s',
  }
}
