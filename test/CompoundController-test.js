const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { USDT_ABI, CUSDT_ABI, impersonateAccount } = require("./helpers/utils");
const { ethers } = require("hardhat");
const provider = ethers.getDefaultProvider();

// Payment options...
const DAI = process.env.DAI;
const USDT = process.env.USDT;
//
const cDAI = process.env.CDAI;
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
    compoundController = await CompoundController.deploy(vault.address);

    UserWallet = await ethers.getContractFactory("UserWallet");
    userWallet = await UserWallet.deploy(
      vault.address,
      compoundController.address
    );

    vault.transferOwnership(userWallet.address);
    // Deployment config ends...

    Usdt = await ethers.getContractAt("IERC20", USDT);
    Dai = await ethers.getContractAt("IERC20", DAI);
    Cusdt = new ethers.Contract(cUSDT, CUSDT_ABI);

    // Impersonate an account with enough DAI
    signer = await impersonateAccount(DAI_WHALE);
  });
  describe("investInCompound", function () {
    it("should fail if user vault balance for token is zero", async () => {
      let investingAmount = BigNumber.from("100"); //  100
      await expect(
        userWallet.connect(signer).investInCompound(DAI, cDAI, investingAmount)
      ).to.be.revertedWith("Wallet: fund your wallet to continue!");
    });
    // Deposit 100 DAI to wallet
    it("should fail if amount being invested is less than one", async () => {
      let depositAmount = BigNumber.from("100"); //  100
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
          .investInCompound(DAI, cDAI, BigNumber.from("200"))
      ).to.be.revertedWith("Wallet: Insufficient token funds for user!");
    });
    it("should return true if investment in compound is successfully", async () => {
      let investingAmount = BigNumber.from("100"); //  100
      let result = await userWallet
        .connect(signer)
        .callStatic.investInCompound(DAI, cDAI, investingAmount);
      expect(result).to.equal(true);
    });
    // Invested 100 DAI to compound from wallet
    it("should assert user invested balance is correct if successfull", async () => {
      await userWallet
        .connect(signer)
        .investInCompound(DAI, cDAI, BigNumber.from("50"));
      let result = await compoundController
        .connect(signer)
        .UserInvestments(signer.address, DAI);
      expect(result.tokenAmount).to.equal(50);
    });
    it("should assert user remaining token balance in vault(wallet) is correct", async () => {
      let userBalance = await vault.getUserTokenBalance(signer.address, DAI);
      expect(userBalance).to.equal(50);
    });
  });
});
