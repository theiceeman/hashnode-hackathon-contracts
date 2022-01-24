const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { transferEth } = require("./helpers/utils");
const { ethers } = require("hardhat");
const DAI = process.env.DAI;
const USDT = process.env.USDT;
//
const cDAI = process.env.DAI;
const cUSDT = process.env.CUSDT;

const USDT_WHALE = process.env.USDT_WHALE;

describe("CompoundController", function () {
  before(async () => {
    [deployer, user1, user2] = await ethers.getSigners();
    // await transferEth(accountPvKey, deployer.address);

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
    
    Usdt = await ethers.getContractAt("IERC20", USDT);
    Dai = await ethers.getContractAt("IERC20", DAI);
  });
  describe("sendErc20", function () {
    it("should supply tokens to compound", async () => {
      let depositAmount = BigNumber.from("100000000000000000000"); //  100
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [USDT_WHALE],
      });
      const signer = await ethers.getSigner(USDT_WHALE);
      await Usdt.connect(signer).transfer(user1.address, "100");

      await Usdt.connect(user1).transfer(compoundController.address, "100");
      console.log("compoundController_balance",await Usdt.balanceOf( compoundController.address));
      console.log({USDT, cUSDT})
      let tx = await compoundController
        .connect(user1)
        ._supplyErc20ToCompound(USDT, cUSDT, "100");
      /* let tx = await compoundController
        .connect(user1)
        .supplyErc20ToCompound(USDT, cUSDT, "100"); */
      console.log(tx);
    });
  });
});
