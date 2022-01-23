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

    // FUND USERS ACCOUNT WITH PAYMENT OPTIONs TOKEN
    Usdt = await ethers.getContractAt("IERC20", USDT);
    // await Usdt.transfer(user1.address, BigNumber.from("100000000000000000000")); //  100
    // console.log(await Usdt);

    Dai = await ethers.getContractAt("IERC20", DAI);
    // await Dai.transfer(user1.address, BigNumber.from("200000000000000000000")); //  200
  });
  describe("sendErc20", function () {
    it("should supply tokens to compound", async () => {
      let depositAmount = BigNumber.from("100000000000000000000"); //  100
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [USDT_WHALE],
      });
      const signer = await ethers.getSigner(USDT_WHALE);
      const WHALE_BALANCE = await Usdt.balanceOf(user1.address);
      signer.sendTransaction({
        to: user1.address,
        value: WHALE_BALANCE,
      });

      await Usdt.connect(signer).transfer(
        user1.address,
        depositAmount
      );
      // signer.approve(compoundController.address, depositAmount);
      let tx = await compoundController
        .connect(signer)
        .supplyErc20ToCompound(USDT, cUSDT, depositAmount);
      console.log(tx);

      // await Usdt.connect(signer).approve(
      //   compoundController.address,
      //   depositAmount
      // );
      // console.log({ USDT, cUSDT, depositAmount });

      // let tx = await compoundController.supplyErc20ToCompound(
      //   USDT,
      //   cUSDT,
      //   depositAmount
      // );

      // let tx = await compoundController._supplyErc20ToCompound();
      // console.log(tx);
    });
  });
});
