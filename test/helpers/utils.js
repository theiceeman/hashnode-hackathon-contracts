const { ethers } = require("hardhat");
// const provider = ethers.getDefaultProvider();

async function impersonateAccount(acctAddress) {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [acctAddress],
  });
  return await ethers.getSigner(acctAddress);
}

// 1 cToken equals...
async function cTokenUnderlyingExchangeRate(
  erc20Abi,
  erc20Address,
  cTokenAbi,
  cTokenAddress
) {
  let cTokenDecimals = 8; // all cTokens have 8 decimal places
  // console.log({ erc20Abi, erc20Address });
  let underlying = new ethers.Contract(erc20Address, erc20Abi, ethers.provider);
  let cToken = new ethers.Contract(cTokenAddress, cTokenAbi, ethers.provider);
  let underlyingDecimals = await underlying.callStatic.decimals();
  let exchangeRateCurrent = await cToken.callStatic.exchangeRateCurrent();
  let mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
  let oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
  return oneCTokenInUnderlying;
}

module.exports = {
  impersonateAccount,
  cTokenUnderlyingExchangeRate,
};
