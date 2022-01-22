const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { transferEth } = require("./helpers/utils");
const { ethers } = require("hardhat");
const DAI = process.env.DAI;
const USDT = process.env.USDT;
//
const cDAI = process.env.DAI;
const cUSDT = process.env.USDT;

const accountPvKey = process.env.DEV_ACCT_PRV_KEY;

describe("CompoundController", function () {
  before(async () => {
    [deployer, user1, user2] = await ethers.getSigners();
    await transferEth(accountPvKey, deployer.address);
    
    // IERC20 = ethers.getContractAt("IERC20");
    // CErc20 = ethers.getContractAt("CErc20");
    /* 
    // deploy vault contract
    Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy();

    // deploy wallet contract
    UserWallet = await ethers.getContractFactory("UserWallet");
    userWallet = await UserWallet.deploy(vault.address);

    // give only `wallet contract` ability to call contract on the vault
    vault.transferOwnership(userWallet.address);
     */

    CompoundController = await ethers.getContractFactory("CompoundController");
    compoundController = await CompoundController.deploy();

    // FUND USERS ACCOUNT WITH PAYMENT OPTIONs TOKEN
    Usdt = await ethers.getContractAt("IERC20", USDT);
    await Usdt.transfer(user1.address, BigNumber.from("100000000000000000000")); //  100

    Dai = await ethers.getContractAt("IERC20", DAI);
    await Dai.transfer(user1.address, BigNumber.from("200000000000000000000")); //  200
  });
  it("should supply tokens to compound", async () => {
    let depositAmount = BigNumber.from("100000000000000000000"); //  100
    await Dai.connect(user1).approve(compoundController.address, depositAmount);
    console.log("DAMN!");

    let tx = await compoundController
      .connect(user1)
      .supplyErc20ToCompound(DAI, cDAI, depositAmount);
    console.log(tx);
  });
});
