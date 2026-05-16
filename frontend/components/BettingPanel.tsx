'use client'

import { useState } from 'react'
import { useAccount, useReadContract, useWriteContract, useWaitForTransactionReceipt } from 'wagmi'
import { parseUnits, formatUnits } from 'viem'
import { USDC_ADDRESS, TRACE_BETTING } from '@/lib/wagmi'
import { ERC20_ABI, TRACE_BETTING_ABI } from '@/lib/abis'

interface Props {
  traceId: bigint
  onClose: () => void
}

export default function BettingPanel({ traceId, onClose }: Props) {
  const { address } = useAccount()
  const [side,   setSide]   = useState<0 | 1>(0)
  const [amount, setAmount] = useState('5')
  const [step,   setStep]   = useState<'idle' | 'approving' | 'betting' | 'done'>('idle')

  const amountBN = parseUnits(amount || '0', 6)

  const { data: allowance } = useReadContract({
    address:      USDC_ADDRESS,
    abi:          ERC20_ABI,
    functionName: 'allowance',
    args:         [address!, TRACE_BETTING],
    query:        { enabled: !!address },
  })

  const { data: balance } = useReadContract({
    address:      USDC_ADDRESS,
    abi:          ERC20_ABI,
    functionName: 'balanceOf',
    args:         [address!],
    query:        { enabled: !!address },
  })

  const { writeContract, data: txHash } = useWriteContract()
  const { isLoading: isTxPending } = useWaitForTransactionReceipt({ hash: txHash })

  const needsApproval = !allowance || allowance < amountBN

  function handleApprove() {
    setStep('approving')
    writeContract({
      address:      USDC_ADDRESS,
      abi:          ERC20_ABI,
      functionName: 'approve',
      args:         [TRACE_BETTING, amountBN],
    })
  }

  function handleBet() {
    setStep('betting')
    writeContract({
      address:      TRACE_BETTING,
      abi:          TRACE_BETTING_ABI,
      functionName: 'placeBet',
      args:         [traceId, side, amountBN],
    })
    setStep('done')
  }

  if (!address) {
    return (
      <Panel onClose={onClose}>
        <p style={{ color: 'var(--text-muted)', fontSize: '14px' }}>Connect your wallet to place a bet.</p>
      </Panel>
    )
  }

  return (
    <Panel onClose={onClose}>
      <div style={{ fontSize: '13px', color: 'var(--text-muted)', marginBottom: '16px' }}>
        Betting on trace <span style={{ color: 'var(--green)' }}>#{traceId.toString()}</span>
        {balance !== undefined && (
          <span style={{ float: 'right' }}>
            Balance: <span style={{ color: 'var(--green)' }}>{formatUnits(balance, 6)} USDC</span>
          </span>
        )}
      </div>

      <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
        {(['BULL ▲', 'BEAR ▼'] as const).map((label, i) => (
          <button key={i} onClick={() => setSide(i as 0 | 1)} style={{
            flex: 1, padding: '10px',
            background: side === i ? (i === 0 ? '#0a2a0a' : '#2a0a0a') : 'transparent',
            border: `1px solid ${side === i ? (i === 0 ? 'var(--bull)' : 'var(--bear)') : 'var(--border)'}`,
            color: side === i ? (i === 0 ? 'var(--bull)' : 'var(--bear)') : 'var(--text-muted)',
            borderRadius: '6px', cursor: 'pointer', fontFamily: 'inherit', fontSize: '13px',
          }}>
            {label}
          </button>
        ))}
      </div>

      <div style={{ marginBottom: '16px' }}>
        <label style={{ fontSize: '11px', color: 'var(--text-muted)', display: 'block', marginBottom: '6px' }}>
          USDC AMOUNT (min 1)
        </label>
        <input
          type="number" min="1" step="1"
          value={amount}
          onChange={e => setAmount(e.target.value)}
          style={{
            width: '100%', padding: '10px 12px',
            background: 'var(--bg)', border: '1px solid var(--border)',
            color: 'var(--text)', borderRadius: '6px',
            fontFamily: 'inherit', fontSize: '14px',
          }}
        />
      </div>

      {step === 'done' ? (
        <div style={{ color: 'var(--green)', fontSize: '14px', textAlign: 'center', padding: '12px 0' }}>
          ✓ Bet placed! Check the explorer for confirmation.
        </div>
      ) : needsApproval ? (
        <button onClick={handleApprove} disabled={isTxPending} style={actionBtn}>
          {isTxPending ? 'Approving…' : `Approve ${amount} USDC`}
        </button>
      ) : (
        <button onClick={handleBet} disabled={isTxPending} style={actionBtn}>
          {isTxPending ? 'Placing bet…' : `Stake ${amount} USDC on ${side === 0 ? 'BULL' : 'BEAR'}`}
        </button>
      )}
    </Panel>
  )
}

const actionBtn: React.CSSProperties = {
  width: '100%', padding: '12px',
  background: 'var(--green-muted)', border: 'none',
  color: 'var(--bg)', borderRadius: '6px',
  cursor: 'pointer', fontFamily: 'inherit',
  fontSize: '14px', fontWeight: 600,
}

function Panel({ children, onClose }: { children: React.ReactNode; onClose: () => void }) {
  return (
    <div className="betting-panel" style={{
      position: 'fixed', bottom: '1.5rem', right: '1.5rem',
      width: '360px', background: 'var(--bg-card)',
      border: '1px solid var(--green-muted)', borderRadius: '12px',
      padding: '1.25rem', zIndex: 100,
      boxShadow: '0 0 30px rgba(57,255,20,0.08)',
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '14px' }}>
        <span style={{ color: 'var(--green)', fontSize: '14px', fontWeight: 500 }}>Place Bet</span>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer', fontSize: '16px' }}>✕</button>
      </div>
      {children}
    </div>
  )
}
