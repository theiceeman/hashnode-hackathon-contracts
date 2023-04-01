const { ethers } = require("hardhat");

async function mineBlocks(blockNumber) {
    while (blockNumber > 0) {
        blockNumber--;
        await hre.network.provider.request({
            method: "evm_mine",
            params: [],
        });
        console.log('...mined block ' + await hre.network.provider.getBlockNumber())
    }
}

async function main() {
    // Mine blocks
    console.log("---  mining starts ---");
    await mineBlocks(5000)
    console.log("--- after mining ends ---");
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
