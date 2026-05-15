// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {IERC20} from "forge-std/interfaces/IERC20.sol";
import {TraceRegistry} from "./TraceRegistry.sol";

/**
 * @title TraceBetting
 * @notice USDC escrow contract for betting on whether a reasoning trace
 *         converges to profit. Users stake USDC on BULL or BEAR for a given
 *         trace. After the resolution window, an admin resolves the outcome
 *         and winners claim proportionally.
 *
 * Arc USDC: 0x3600000000000000000000000000000000000000 (6 decimals)
 */
contract TraceBetting {
    // Arc Testnet USDC — 6 decimals
    IERC20 public immutable usdc;
    TraceRegistry public immutable registry;
    address public admin;

    enum Side     { BULL, BEAR }
    enum Outcome  { PENDING, BULL_WINS, BEAR_WINS, CANCELLED }

    struct Market {
        uint256 traceId;
        uint256 resolutionTime;   // earliest time admin can resolve
        uint256 bullPool;         // total USDC staked BULL (6 dec)
        uint256 bearPool;         // total USDC staked BEAR (6 dec)
        Outcome outcome;
    }

    struct Position {
        uint256 amount;   // USDC staked (6 dec)
        Side    side;
        bool    claimed;
    }

    uint256 public marketCount;
    mapping(uint256 => Market)   public markets;
    // marketId => user => Position
    mapping(uint256 => mapping(address => Position)) public positions;

    uint256 public constant MIN_BET  = 1e6;   // 1 USDC
    uint256 public constant FEE_BPS  = 100;    // 1% protocol fee
    uint256 public constant BPS_BASE = 10_000;

    event MarketCreated(uint256 indexed marketId, uint256 traceId, uint256 resolutionTime);
    event BetPlaced(uint256 indexed marketId, address indexed user, Side side, uint256 amount);
    event MarketResolved(uint256 indexed marketId, Outcome outcome);
    event WinningsClaimed(uint256 indexed marketId, address indexed user, uint256 payout);

    constructor(address _usdc, address _registry) {
        usdc     = IERC20(_usdc);
        registry = TraceRegistry(_registry);
        admin    = msg.sender;
    }

    modifier onlyAdmin() {
        require(msg.sender == admin, "not admin");
        _;
    }

    /**
     * @notice Create a betting market for a published trace.
     * @param traceId         ID from TraceRegistry
     * @param durationSeconds How long bets are open / resolution delay
     */
    function createMarket(uint256 traceId, uint256 durationSeconds)
        external onlyAdmin returns (uint256 marketId)
    {
        // Verify trace exists
        registry.getTrace(traceId);

        marketId = marketCount++;
        markets[marketId] = Market({
            traceId:        traceId,
            resolutionTime: block.timestamp + durationSeconds,
            bullPool:       0,
            bearPool:       0,
            outcome:        Outcome.PENDING
        });

        emit MarketCreated(marketId, traceId, block.timestamp + durationSeconds);
    }

    /**
     * @notice Stake USDC on a side. Approves must happen client-side first.
     */
    function placeBet(uint256 marketId, Side side, uint256 amount) external {
        Market storage m = markets[marketId];
        require(m.outcome == Outcome.PENDING,           "market closed");
        require(block.timestamp < m.resolutionTime,     "betting closed");
        require(amount >= MIN_BET,                      "below min bet");
        require(positions[marketId][msg.sender].amount == 0, "already bet");

        usdc.transferFrom(msg.sender, address(this), amount);

        positions[marketId][msg.sender] = Position({amount: amount, side: side, claimed: false});

        if (side == Side.BULL) m.bullPool += amount;
        else                   m.bearPool += amount;

        emit BetPlaced(marketId, msg.sender, side, amount);
    }

    /**
     * @notice Admin resolves outcome after resolutionTime.
     */
    function resolveMarket(uint256 marketId, Outcome outcome) external onlyAdmin {
        Market storage m = markets[marketId];
        require(m.outcome == Outcome.PENDING,         "already resolved");
        require(block.timestamp >= m.resolutionTime,  "too early");
        require(outcome != Outcome.PENDING,            "invalid outcome");

        m.outcome = outcome;
        emit MarketResolved(marketId, outcome);
    }

    /**
     * @notice Winners (or all bettors on CANCELLED) claim their payout.
     */
    function claimWinnings(uint256 marketId) external {
        Market storage m  = markets[marketId];
        Position storage p = positions[marketId][msg.sender];

        require(m.outcome != Outcome.PENDING, "not resolved");
        require(p.amount > 0,                 "no position");
        require(!p.claimed,                   "already claimed");

        p.claimed = true;
        uint256 payout;

        if (m.outcome == Outcome.CANCELLED) {
            payout = p.amount; // full refund
        } else {
            bool won = (m.outcome == Outcome.BULL_WINS && p.side == Side.BULL)
                    || (m.outcome == Outcome.BEAR_WINS && p.side == Side.BEAR);
            require(won, "not a winner");

            uint256 winningPool = m.outcome == Outcome.BULL_WINS ? m.bullPool : m.bearPool;
            uint256 losingPool  = m.outcome == Outcome.BULL_WINS ? m.bearPool : m.bullPool;
            uint256 totalPrize  = losingPool * (BPS_BASE - FEE_BPS) / BPS_BASE;
            payout = p.amount + (totalPrize * p.amount / winningPool);
        }

        usdc.transfer(msg.sender, payout);
        emit WinningsClaimed(marketId, msg.sender, payout);
    }

    function transferAdmin(address newAdmin) external onlyAdmin {
        admin = newAdmin;
    }
}
