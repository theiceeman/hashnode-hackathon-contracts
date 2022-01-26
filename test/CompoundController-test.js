const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { USDT_ABI, CUSDT_ABI, impersonateAccount } = require("./helpers/utils");
const { ethers } = require("hardhat");
const provider = ethers.getDefaultProvider();
const { parseEther } = require("ethers/lib/utils");
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

    CompoundController = await ethers.getContractFactory("CompoundController");
    compoundController = await CompoundController.deploy();

    Usdt = await ethers.getContractAt("IERC20", USDT);
    Dai = await ethers.getContractAt("IERC20", DAI);
    // Cusdt = await ethers.getContractAt("IERC20", cUSDT);
    cusdt = new ethers.Contract(cUSDT, CUSDT_ABI);
  });
  describe("sendErc20", function () {
    it("should supply tokens to compound", async () => {
      let depositAmount = BigNumber.from("100"); //  100
      const signer = await impersonateAccount(DAI_WHALE);
      await Dai.connect(signer).transfer(compoundController.address, "100");

      await Dai.connect(signer).approve(compoundController.address, "100");
      let tx = await compoundController
        .connect(signer).callStatic._supplyErc20ToCompound(DAI, cDAI, "100");
      console.log(tx);
    });
  });
});
