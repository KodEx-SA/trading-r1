export const TRACE_REGISTRY_ABI = [
  {
    name: 'publishTrace',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'ipfsCid',    type: 'string' },
      { name: 'ticker',     type: 'string' },
      { name: 'conviction', type: 'int8'   },
    ],
    outputs: [{ name: 'traceId', type: 'uint256' }],
  },
  {
    name: 'getTrace',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'traceId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'ipfsCid',    type: 'string'  },
          { name: 'ticker',     type: 'string'  },
          { name: 'agent',      type: 'address' },
          { name: 'timestamp',  type: 'uint256' },
          { name: 'conviction', type: 'int8'    },
        ],
      },
    ],
  },
  {
    name: 'traceCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const

export const TRACE_BETTING_ABI = [
  {
    name: 'createMarket',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'traceId',         type: 'uint256' },
      { name: 'durationSeconds', type: 'uint256' },
    ],
    outputs: [{ name: 'marketId', type: 'uint256' }],
  },
  {
    name: 'placeBet',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'marketId', type: 'uint256' },
      { name: 'side',     type: 'uint8'   },
      { name: 'amount',   type: 'uint256' },
    ],
    outputs: [],
  },
  {
    name: 'claimWinnings',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [],
  },
  {
    name: 'markets',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'marketId', type: 'uint256' }],
    outputs: [
      {
        type: 'tuple',
        components: [
          { name: 'traceId',        type: 'uint256' },
          { name: 'resolutionTime', type: 'uint256' },
          { name: 'bullPool',       type: 'uint256' },
          { name: 'bearPool',       type: 'uint256' },
          { name: 'outcome',        type: 'uint8'   },
        ],
      },
    ],
  },
  {
    name: 'marketCount',
    type: 'function',
    stateMutability: 'view',
    inputs: [],
    outputs: [{ type: 'uint256' }],
  },
] as const

export const ERC20_ABI = [
  {
    name: 'approve',
    type: 'function',
    stateMutability: 'nonpayable',
    inputs: [
      { name: 'spender', type: 'address' },
      { name: 'amount',  type: 'uint256' },
    ],
    outputs: [{ type: 'bool' }],
  },
  {
    name: 'allowance',
    type: 'function',
    stateMutability: 'view',
    inputs: [
      { name: 'owner',   type: 'address' },
      { name: 'spender', type: 'address' },
    ],
    outputs: [{ type: 'uint256' }],
  },
  {
    name: 'balanceOf',
    type: 'function',
    stateMutability: 'view',
    inputs: [{ name: 'account', type: 'address' }],
    outputs: [{ type: 'uint256' }],
  },
] as const
