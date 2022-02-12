const hre = require("hardhat");

/* 
...vault deployed to: 0xaD1Bd598Bd6A62728E17205337e90d70f667794F
...compoundController deployed to: 0x4b288a2Ef1B912c64921ba31A5554dBc387f1d2f
...userWallet deployed to: 0xfD7C3330fA3B4595A4670469524D2F80DAE13800

 */

/* 
...vault deployed to: 0x68f32d33281B67DFE55B69Cf56EadEA683cC7c42
...compoundController deployed to: 0x71658E7e403A12383612bEa3418d15a2Ea2c08B3 
...userWallet deployed to: 0x842e55Cd62AD823397AD1d990B29AAB38bA1C780

 */

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
