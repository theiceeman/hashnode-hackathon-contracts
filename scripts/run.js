const hre = require("hardhat");

async function main() {
  // Deployment configs
  const Vault = await ethers.getContractFactory("Vault");
  const vault = await Vault.deploy();
  console.log("...vault deployed to:", vault.address);

  const CompoundController = await ethers.getContractFactory(
    "CompoundController"
  );
  const compoundController = await CompoundController.deploy();
  console.log("...compoundController deployed to:", compoundController.address);

  const UserWallet = await ethers.getContractFactory("UserWallet");
  const userWallet = await UserWallet.deploy(
    vault.address,
    compoundController.address
  );
  console.log("...userWallet deployed to:", userWallet.address);

  vault.transferOwnership(userWallet.address);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
