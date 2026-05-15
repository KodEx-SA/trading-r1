// SPDX-License-Identifier: MIT
pragma solidity ^0.8.24;

import {Script, console} from "forge-std/Script.sol";
import {TraceRegistry} from "../src/TraceRegistry.sol";
import {TraceBetting}  from "../src/TraceBetting.sol";

contract Deploy is Script {
    // Arc Testnet USDC (6 decimals)
    address constant USDC_ARC = 0x3600000000000000000000000000000000000000;

    function run() external {
        uint256 deployerKey = vm.envUint("PRIVATE_KEY");
        vm.startBroadcast(deployerKey);

        TraceRegistry registry = new TraceRegistry();
        console.log("TraceRegistry deployed:", address(registry));

        TraceBetting betting = new TraceBetting(USDC_ARC, address(registry));
        console.log("TraceBetting deployed: ", address(betting));

        vm.stopBroadcast();

        // Print env var snippet for frontend
        console.log("\n--- Copy to frontend/.env.local ---");
        console.log("NEXT_PUBLIC_TRACE_REGISTRY=", address(registry));
        console.log("NEXT_PUBLIC_TRACE_BETTING=",  address(betting));
        console.log("NEXT_PUBLIC_USDC_ADDRESS=",   USDC_ARC);
    }
}
