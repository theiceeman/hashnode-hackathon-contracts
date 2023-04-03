const { BigNumber } = require("ethers");
const hre = require("hardhat");
const { impersonateAccount } = require("../test/helpers/utils");


/* 
MATIC
...vault deployed to: 0x91a5966fA90D1D17b02581E139c77409a2f0CFC1
...compoundController deployed to:  0xd79da6859E67C25d180332E89D5F80C369Cc40fb
...userWallet deployed to:  0x83318D0C6972516C636A2A573D19Db2949534934
 */

/* 
GOERLI
...vault deployed to: 0x5B418575aBE8Ec7E729781189902049eEf997D77
...compoundController deployed to:  0xAC1e1BD4E2e70E3075A76F80fEcfEce829Ac2cc0
...userWallet deployed to:  0xD040a24C52D278bd63F925BD0e739635Db57dDe6
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
