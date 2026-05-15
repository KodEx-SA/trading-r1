// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

/**
 * @title TraceRegistry
 * @notice Stores hashes of AI reasoning traces (IPFS CIDs) on Arc.
 *         Each trace is linked to a ticker, timestamp, and agent address.
 *         Immutable — traces cannot be edited or deleted once published.
 */
contract TraceRegistry {
    struct Trace {
        string  ipfsCid;       // Pinata/IPFS CID of the full JSON trace
        string  ticker;        // e.g. "AAPL", "BTC"
        address agent;         // wallet that submitted the trace
        uint256 timestamp;     // block.timestamp at submission
        int8    conviction;    // -100 (strong bear) to +100 (strong bull)
    }

    uint256 public traceCount;
    mapping(uint256 => Trace) public traces;

    event TracePublished(
        uint256 indexed traceId,
        address indexed agent,
        string  ticker,
        string  ipfsCid,
        int8    conviction,
        uint256 timestamp
    );

    /**
     * @notice Publish a new reasoning trace.
     * @param ipfsCid   IPFS CID of the full JSON reasoning trace
     * @param ticker    Asset ticker (e.g. "AAPL")
     * @param conviction Conviction score from -100 to +100
     */
    function publishTrace(
        string calldata ipfsCid,
        string calldata ticker,
        int8 conviction
    ) external returns (uint256 traceId) {
        require(bytes(ipfsCid).length > 0, "CID required");
        require(bytes(ticker).length > 0,  "ticker required");
        require(conviction >= -100 && conviction <= 100, "conviction out of range");

        traceId = traceCount++;
        traces[traceId] = Trace({
            ipfsCid:    ipfsCid,
            ticker:     ticker,
            agent:      msg.sender,
            timestamp:  block.timestamp,
            conviction: conviction
        });

        emit TracePublished(traceId, msg.sender, ticker, ipfsCid, conviction, block.timestamp);
    }

    function getTrace(uint256 traceId) external view returns (Trace memory) {
        require(traceId < traceCount, "trace not found");
        return traces[traceId];
    }
}
