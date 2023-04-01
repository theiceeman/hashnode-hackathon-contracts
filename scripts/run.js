const { BigNumber } = require("ethers");
const hre = require("hardhat");
const { impersonateAccount } = require("../test/helpers/utils");

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


  // Impersonate account & transfer some DAI to my account
  const DAI = process.env.DAI;
  const DAI_WHALE = process.env.DAI_WHALE;
  
  const Dai = await ethers.getContractAt("IERC20", DAI);
  const signer = await impersonateAccount(DAI_WHALE);

  let amount = BigNumber.from("5000000000000000000000"); //  5000
  await Dai.connect(signer).approve(userWallet.address, amount);
  await Dai.connect(signer).transfer('0xf39Fd6e51aad88F6F4ce6aB8827279cffFb92266', amount);
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });
