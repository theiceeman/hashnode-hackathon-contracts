const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { USDT_ABI, CUSDT_ABI } = require("./helpers/utils");
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
    // Cusdt = await ethers.getContractAt("IERC20", cUSDT);
    cusdt = new ethers.Contract(cUSDT, CUSDT_ABI);
  });
  describe("sendErc20", function () {
    it("should supply tokens to compound", async () => {
      // console.log(cusdt);
      let depositAmount = BigNumber.from("100000000000000000000"); //  100
      await hre.network.provider.request({
        method: "hardhat_impersonateAccount",
        params: [USDT_WHALE],
      });
      const signer = await ethers.getSigner(USDT_WHALE);
      await Usdt.connect(signer).transfer(user1.address, "10000");
      // await Usdt.connect(user1).transfer(compoundController.address, "100");

      /* let tx = await cusdt
        .connect(user1)
        .callStatic.balanceOfUnderlying(compoundController.address); */
        await Usdt
        .connect(user1).approve(cUSDT, "10000");
      //   let tx = await cusdt
      //     .connect(user1).callStatic.mint(10000);
      // console.log("Cusdt_balance", tx);
      /* let tx = await compoundController
        .connect(user1)
        ._supplyErc20ToCompound(USDT, cUSDT, "100"); */
      /* let tx = await compoundController
        .connect(user1)
        .supplyErc20ToCompound(USDT, cUSDT, "100"); */
      console.log(tx);
    });
  });
});
