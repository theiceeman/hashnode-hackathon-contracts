const { expect } = require("chai");
const { BigNumber } = require("ethers");
const { ethers } = require("hardhat");

describe("UserWallet", function () {
  before(async () => {
    [deployer, user1, user2] = await ethers.getSigners();
    Vault = await ethers.getContractFactory("Vault");
    vault = await Vault.deploy();

    UserWallet = await ethers.getContractFactory("UserWallet");
    userWallet = await UserWallet.deploy(vault.address);

    vault.transferOwnership(userWallet.address);

    // FUND USERS ACCOUNT WITH PAYMENT OPTIONs TOKEN
    usdtContract = await ethers.getContractFactory("ERC20Token");
    Usdt = await usdtContract.deploy("USDT tether", "USDT");
    await Usdt.transfer(user1.address, BigNumber.from("100000000000000000000")); //  100

    daiContract = await ethers.getContractFactory("ERC20Token");
    Dai = await daiContract.deploy("Dai Stablecoin", "DAI");
    await Dai.transfer(user1.address, BigNumber.from("200000000000000000000")); //  200
  });

  describe("depositFunction", function () {
    it("should fail if input amount is less than zero", async () => {
      await expect(userWallet.deposit(Usdt.address, 0)).to.be.revertedWith(
        "Wallet: amount cannot be 0!"
      );
    });
    it("should increment the user vault balance", async () => {
      let expectedUsdtBalance = BigNumber.from("100000000000000000000");
      await Usdt.connect(user1).approve(
        userWallet.address,
        BigNumber.from("100000000000000000000")
      );
      await userWallet
        .connect(user1)
        .deposit(Usdt.address, BigNumber.from("100000000000000000000")); //  100
      let userUsdtBalance = await vault.getUserTokenBalance(
        user1.address,
        Usdt.address
      );

      expect(userUsdtBalance).to.equal(expectedUsdtBalance); //  100
    });
    it("should increment usdt balance of vault contract", async () => {
      let expectedUsdtBalance = BigNumber.from("100000000000000000000");
      let vaultUsdtBalance = await Usdt.balanceOf(vault.address);
      expect(vaultUsdtBalance).to.equal(expectedUsdtBalance);
    });
  });

  
  describe("deposit of multiple tokens", function () {
    it("should increment the user new token balance if successfull", async () => {
      let depositAmount = BigNumber.from("200000000000000000000"); //  200
      await Dai.connect(user1).approve(userWallet.address, depositAmount);
      await userWallet.connect(user1).deposit(Dai.address, depositAmount);
      let userBalance = await vault.getUserTokenBalance(
        user1.address,
        Dai.address
      );
      expect(depositAmount).to.equal(userBalance);
    });
    it("should assert the user balances for the different tokens if successfull", async () => {
      let expectedUsdtBalance = BigNumber.from("100000000000000000000");
      let expectedDaiBalance = BigNumber.from("200000000000000000000");
      let userUsdtBalance = await vault.getUserTokenBalance(
        user1.address,
        Usdt.address
      );
      let userDaiBalance = await vault.getUserTokenBalance(
        user1.address,
        Dai.address
      );
      expect(userUsdtBalance).to.equal(expectedUsdtBalance); //  100
      expect(expectedDaiBalance).to.equal(userDaiBalance); //  200

    })
  });

  describe("withdrawFunction", function () {
    it("should fail if account withdrawing is not the vault owner", async () => {
      await expect(
        userWallet
          .connect(user2)
          .withdrawFromVault(
            user1.address,
            Usdt.address,
            BigNumber.from("100000000000000000000")
          )
      ).to.be.revertedWith("Wallet: Only account owner can withdraw!");
    });

    it("should fail if withdrawal amount is equals or less than zero", async () => {
      await expect(
        userWallet
          .connect(user1)
          .withdrawFromVault(user1.address, Usdt.address, 0)
      ).to.be.revertedWith(
        "Wallet: withdrawal amount must be greater than zero!"
      );
    });

    it("should fail if the user token vault balance is less than the withdrawal amount", async () => {
      let withdrawalAmount = BigNumber.from("200000000000000000000"); //  200
      await expect(
        userWallet
          .connect(user1)
          .withdrawFromVault(user1.address, Usdt.address, withdrawalAmount)
      ).to.be.revertedWith("Wallet: Insufficient token funds for user!");
    });

    it("should increment the user token balance if successfull", async () => {
      let withdrawalAmount = BigNumber.from("100000000000000000000"); //  100
      await userWallet
        .connect(user1)
        .withdrawFromVault(user1.address, Usdt.address, withdrawalAmount);

      let userBalance = await Usdt.balanceOf(user1.address);
      expect(withdrawalAmount).to.equal(userBalance);
    });
    it("should reduce the user vault token balance if successfull", async () => {
      let userBalance = await vault.getUserTokenBalance(
        user1.address,
        Usdt.address
      );
      expect(userBalance).to.equal(0);
    });
  });
  
  describe("withdrawal of multiple tokens", function () {
    it("should assert token balances are correct if successfull", async () => {
      let withdrawalAmount = BigNumber.from("100000000000000000000"); //  100
      await userWallet
        .connect(user1)
        .withdrawFromVault(user1.address, Dai.address, withdrawalAmount);

      let userBalance = await Dai.balanceOf(user1.address);
      expect(withdrawalAmount).to.equal(userBalance);
    })

  })

});
