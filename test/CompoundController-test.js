const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");
const {
  impersonateAccount,
  snapshot,
  convertUnderlyingToCtoken,
  convertCtokenToUnderlying
} = require("./helpers/utils");
const { latestTime } = require("./helpers/latest-time");
const { increaseTimeTo } = require("./helpers/increase-time");

// ABIs...
const { cDAI_ABI } = require("./abi/cdai");
const { DAI_ABI } = require("./abi/dai");
const { cAAVE_ABI } = require("./abi/caave");
const { AAVE_ABI } = require("./abi/aave");

// Payment options...
const DAI = process.env.DAI;
const USDT = process.env.USDT;
const AAVE = process.env.AAVE;
//
const cDAI = process.env.CDAI;
const cAAVE = process.env.CAAVE;
const cUSDT = process.env.CUSDT;

const USDT_WHALE = process.env.USDT_WHALE;
const DAI_WHALE = process.env.DAI_WHALE;

describe("CompoundController", function () {
  before(async () => {
    [deployer, user1, user2] = await ethers.getSigners();

    // Deployment configs
    Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy();

    CompoundController = await ethers.getContractFactory("CompoundController");
    compoundController = await CompoundController.deploy();

    UserWallet = await ethers.getContractFactory("UserWallet");
    userWallet = await UserWallet.deploy(
      vault.address,
      compoundController.address
    );

    vault.transferOwnership(userWallet.address);
    // Deployment config ends...

    Usdt = await ethers.getContractAt("IERC20", USDT);
    //
    Dai = await ethers.getContractAt("IERC20", DAI);
    Cdai = new ethers.Contract(cDAI, cDAI_ABI, ethers.provider);
    //
    Aave = await ethers.getContractAt("IERC20", AAVE);
    Caave = new ethers.Contract(cAAVE, cAAVE_ABI, ethers.provider);

    // Impersonate an account with enough DAI
    signer = await impersonateAccount(DAI_WHALE);
  });
  describe("investInCompound", function () {
    it("should fail if user vault balance for token is zero", async () => {
      let investingAmount = BigNumber.from("100000000000000000000"); //  100
      await expect(
        userWallet.connect(signer).investInCompound(DAI, cDAI, investingAmount)
      ).to.be.revertedWith("Wallet: fund your wallet to continue!");
    });
    // Deposit 100 DAI to wallet
    it("should fail if amount being invested is less than one", async () => {
      let depositAmount = BigNumber.from("100000000000000000000"); //  100
      await Dai.connect(signer).approve(userWallet.address, depositAmount);
      await userWallet.connect(signer).deposit(Dai.address, depositAmount);
      await expect(
        userWallet.connect(signer).investInCompound(DAI, cDAI, "0")
      ).to.be.revertedWith("Wallet: Invest amount must be greater than zero!");
    });
    it("should fail if amount being invested is greater than user token balance in vault", async () => {
      await expect(
        userWallet
          .connect(signer)
          .investInCompound(DAI, cDAI, BigNumber.from("200000000000000000000"))
      ).to.be.revertedWith("Wallet: Insufficient token funds for user!"); //  200
    });
    it("should return true if investment in compound is successfully", async () => {
      let investingAmount = BigNumber.from("100000000000000000000"); //  100
      let result = await userWallet
        .connect(signer)
        .callStatic.investInCompound(DAI, cDAI, investingAmount);
      expect(result).to.equal(true);
    });
    // Invested 50 DAI to compound from wallet
    it("should assert user invested balance is correct if successfull", async () => {
      let depositAmount = BigNumber.from("50000000000000000000"); //  50
      await userWallet
        .connect(signer)
        .investInCompound(DAI, cDAI, depositAmount);
      let result = await compoundController
        .connect(signer)
        .UserInvestments(signer.address, DAI);
      expect(result.tokenAmount).to.equal(depositAmount);
    });
    it("should assert user remaining token balance in vault(wallet) is correct", async () => {
      let investedAmount = BigNumber.from("50000000000000000000"); //  50
      let userBalance = await vault.getUserTokenBalance(signer.address, DAI);
      expect(userBalance).to.equal(investedAmount);
    });
    it("should assert no of cDAI tokens owned by compoundController is successfull", async () => {
      // 8 Decimals...
      let totalCdaiBalance = await Cdai.balanceOf(compoundController.address);
      expect(totalCdaiBalance).to.be.above(0); // Not recommended
    });
    it("should accrue interest after mining blocks", async () => {
      let userInvestment = await compoundController
        .connect(signer)
        .UserInvestments(signer.address, DAI);
      let { balanceOfUnderlying } = await snapshot(
        compoundController,
        Dai,
        Cdai
      );
      console.log("--- before mining starts ---");
      console.log({ balanceOfUnderlying });
      await increaseTimeTo((await latestTime()) + 31536000); //  1 yr+
      let { balanceOfUnderlying: _balanceOfUnderlying } = await snapshot(
        compoundController,
        Dai,
        Cdai
      );
      let equivDaiInvestedInCdai  = await convertUnderlyingToCtoken(cDAI, userInvestment.tokenAmount, cDAI_ABI);
      console.log("--- after mining some blocks ---");
      console.log({daiInvested: userInvestment.tokenAmount });
      console.log({equivDaiInvestedInCdai});
      console.log({equivNewCdaiInDai: await convertCtokenToUnderlying(cDAI, equivDaiInvestedInCdai, cDAI_ABI) });
      /* 
        dai invested
        current equivalent of dai invested in cdai
        current equivalent of new cdai in dai
       */
    });
  });
});
