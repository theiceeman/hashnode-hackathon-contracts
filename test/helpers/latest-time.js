// Returns the time of the last mined block in seconds
exports.latestTime = async function () {
  let block = await hre.ethers.provider.getBlock("latest");
  return block.timestamp;
};
