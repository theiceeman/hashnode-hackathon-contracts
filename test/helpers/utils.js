const { ethers } = require("hardhat");

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
  // all cTokens have 8 decimal places
  let cTokenDecimals = 8; 
  // console.log({ erc20Abi, erc20Address });
  let underlying = new ethers.Contract(erc20Address, erc20Abi, ethers.provider);
  let cToken = new ethers.Contract(cTokenAddress, cTokenAbi, ethers.provider);
  let underlyingDecimals = await underlying.callStatic.decimals();
  let exchangeRateCurrent = await cToken.callStatic.exchangeRateCurrent();
  let mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
  let oneCTokenInUnderlying = exchangeRateCurrent / Math.pow(10, mantissa);
  return oneCTokenInUnderlying;
}
async function snapshot(testCompound, token, cToken) {
  const { exchangeRate, supplyRate } = await testCompound.getInfo(cToken.address);

  return {
    exchangeRate,
    supplyRate,
    estimateBalance: await testCompound.callStatic.estimateBalanceOfUnderlying(cToken.address),
    balanceOfUnderlying: await testCompound.callStatic.balanceOfUnderlying(cToken.address),
    token: await token.balanceOf(testCompound.address),
    cToken: await cToken.balanceOf(testCompound.address),
  };
}

module.exports = {
  impersonateAccount,
  cTokenUnderlyingExchangeRate,
  snapshot,
};


  /* describe("invest with multiple erc20 tokens", function () {
    it("should allow investment with AAVE", async () => {
      let AAVE_WHALE = await impersonateAccount(
        '0xbe0eb53f46cd790cd13851d5eff43d12404d33e8'
      );
      let amount = BigNumber.from("100000000000000000000"); //  100
      await Aave.connect(AAVE_WHALE).approve(userWallet.address, amount);
      await userWallet.connect(AAVE_WHALE).deposit(Aave.address, amount);
      let result = await userWallet
        .connect(AAVE_WHALE)
        .callStatic.investInCompound(AAVE, cAAVE, amount);
      expect(result).to.equal(true);
    });
  }); */