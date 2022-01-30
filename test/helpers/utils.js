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

/* 
  Function will return token equiv. of cToken passed to it.
 */
async function convertCtokenToUnderlying(cTokenAddress, cTokenAmount, cTokenAbi) {
  let cTokenDecimals = 8;
  let underlyingDecimals = 18;
  let cToken = new ethers.Contract(cTokenAddress, cTokenAbi, ethers.provider);
  let currentExchangeRate = await cToken.callStatic.exchangeRateCurrent();
  let mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
  let oneCTokenInUnderlying = currentExchangeRate / Math.pow(10, mantissa);
  return cTokenAmount * oneCTokenInUnderlying;
}

async function convertUnderlyingToCtoken(cTokenAddress, underlyingAmount, cTokenAbi){
  let cTokenDecimals = 8;
  let underlyingDecimals = 18;
  let cToken = new ethers.Contract(cTokenAddress, cTokenAbi, ethers.provider);
  let currentExchangeRate = await cToken.callStatic.exchangeRateCurrent();
  let mantissa = 18 + parseInt(underlyingDecimals) - cTokenDecimals;
  let oneUnderlyingInCtoken = currentExchangeRate / Math.pow(10, mantissa);
  return underlyingAmount / oneUnderlyingInCtoken;
}

/* 
  This will return a users tokenAmount interest in a pool
 */
/* async function calcUserInterest(userInvestment, totalUnderlyingInvestedInitial, currentUnderlyingInterest) {
  let userPercentageOfTotal = (userInvestment * 100) / totalUnderlyingInvestedInitial;
  let userInterest = (currentUnderlyingInterest / 100 ) * userPercentageOfTotal;
  return userInterest;
} */

async function calcUserInterest(currentBalanceOfUnderlying, initialBalanceOfUnderlying){
  let availableReward;
  if(currentBalanceOfUnderlying > initialBalanceOfUnderlying){
    availableReward = currentBalanceOfUnderlying - initialBalanceOfUnderlying;

  }else{

  }

}

/*
convert users DAI to cDAI
convert cDAI to DAI
*/

module.exports = {
  impersonateAccount,
  cTokenUnderlyingExchangeRate,
  snapshot,
  // getErc20EquivOfCtoken,
  // calcUserInterest,
  convertCtokenToUnderlying,
  convertUnderlyingToCtoken
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
