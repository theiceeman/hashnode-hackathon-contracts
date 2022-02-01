const { ethers } = require("hardhat");

async function impersonateAccount(acctAddress) {
  await hre.network.provider.request({
    method: "hardhat_impersonateAccount",
    params: [acctAddress],
  });
  return await ethers.getSigner(acctAddress);
}
async function mineBlocks(blockNumber) {
  while (blockNumber > 0) {
    blockNumber--;
    await hre.network.provider.request({
      method: "evm_mine",
      params: [],
    });
  }
}

// 1 cToken equals...
async function getCtokenEquiv(
  erc20Abi,
  erc20Address,
  cTokenAbi,
  cTokenAddress,
  tokenAmount
) {
  let cTokenDecimals = 8;
  let underlying = new ethers.Contract(erc20Address, erc20Abi, ethers.provider);
  let cToken = new ethers.Contract(cTokenAddress, cTokenAbi, ethers.provider);
  let underlyingDecimals = await underlying.callStatic.decimals();
  let exchangeRateCurrent = await cToken.callStatic.exchangeRateCurrent();
  let mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
  let oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
  let userAccruedInterest = tokenAmount / oneCTokenInUnderlying;
  return userAccruedInterest;
}
async function snapshot(compoundController, token, cToken) {
  const { exchangeRate, supplyRate } = await compoundController.getInfo(
    cToken.address
  );

  return {
    exchangeRate,
    supplyRate,
    estimateBalance:
      await compoundController.callStatic.estimateBalanceOfUnderlying(
        cToken.address
      ),
    balanceOfUnderlying:
      await compoundController.callStatic.balanceOfUnderlying(cToken.address),
    token: await token.balanceOf(compoundController.address),
    cToken: await cToken.balanceOf(compoundController.address),
  };
}

async function _getCtokenEquiv(
  erc20Abi,
  erc20Address,
  tokenAmount,
  exchangeRateCurrent
) {
  let cTokenDecimals = 8;
  let underlying = new ethers.Contract(erc20Address, erc20Abi, ethers.provider);
  let underlyingDecimals = await underlying.callStatic.decimals();
  let mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
  let oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
  let cTokenEquiv = tokenAmount / oneCTokenInUnderlying;
  return cTokenEquiv;
}
async function _getUnderlyingEquiv(
  erc20Abi,
  erc20Address,
  cTokenAmount,
  exchangeRateCurrent
) {
  let cTokenDecimals = 8;
  let underlying = new ethers.Contract(erc20Address, erc20Abi, ethers.provider);
  let underlyingDecimals = await underlying.callStatic.decimals();
  let mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
  let oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
  let underlyingEquiv = cTokenAmount * oneCTokenInUnderlying;
  return underlyingEquiv;
}

module.exports = {
  impersonateAccount,
  getCtokenEquiv,
  snapshot,
  mineBlocks,
  _getUnderlyingEquiv,
  _getCtokenEquiv,
};
