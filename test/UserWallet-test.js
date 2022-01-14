const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("UserWallet Contract", function () {
  beforeEach(async () => {
    [deployer, user1, user2] = await ethers.getSigners();
    UserVault = await ethers.getContractFactory("UserVault");
    userVault = await UserVault.deploy();

    UserWallet = await ethers.getContractFactory("UserWallet");
    userWallet = await UserWallet.deploy(userVault.address);

    // FUND USERS ACCOUNT WITH PAYMENT OPTION TOKEN
    const usdtContract = await ethers.getContractFactory("ERC20Token");
    Usdt = await usdtContract.deploy("USDT tether", "USDT");
    await Usdt.transfer(
      user1.address,
      BigNumber.from("31000000000000000000000000")
    ); //  31000000
  });

  it("should assert userVaultAddress is correct", async function () {
    expect(await userWallet.vaultAddress()).to.equal(userVault.address);
  });
  it("should fail if input amount is less than zero", async () => {
    await expect(userWallet.recieve(Usdt.address, 0)).to.be.revertedWith(
      "wallet: amount cannot be 0!"
    );
  });
  it("should increment the user vault balance", async () => {
    await Usdt.connect(user1).approve(
      userWallet.address,
      BigNumber.from("100000000000000000000")
    );
    await userWallet
      .connect(user1)
      .recieve(Usdt.address, BigNumber.from("100000000000000000000")); //  100
    expect(
      await userVault.getUserTokenBalance(user1.address, Usdt.address)
    ).to.equal(BigNumber.from("100000000000000000000")); //  100
  });
});
