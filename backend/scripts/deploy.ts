/* eslint-disable no-undef */
// We require the Hardhat Runtime Environment explicitly here. This is optional
// but useful for running the script in a standalone fashion through `node <script>`.
//
// You can also run a script with `npx hardhat run <script>`. If you do that, Hardhat
// will compile your contracts, add the Hardhat Runtime Environment's members to the
// global scope, and execute the script.
const hre = require("hardhat");

const tokens = (n) => {
  // eslint-disable-next-line no-undef
  return ethers.utils.parseUnits(n.toString(), 'ether')
}


async function main() {
  // Setup accounts
    const [buyer, owner, inspector, lender, dao] = await ethers.getSigners();
  console.log("Deploying contracts with the account:", owner.address);

  const StakeToken = await ethers.getContractFactory("StakeToken");
  const stakeToken = await StakeToken.deploy("1000000000000000000000000");
  await stakeToken.deployed();
  console.log("StakeToken deployed to:", stakeToken.address);

  const NFTDAO = await ethers.getContractFactory("NFTDAO");
  const nftID = 1;
  const minQuorum = 1000;
  const nftDao = await NFTDAO.deploy(stakeToken.address, nftID, minQuorum);
  await nftDao.deployed();
  console.log("NFTDAO deployed to:", nftDao.address);
  

  // Deploy Real Estate
  const Franchise = await ethers.getContractFactory('Franchise');
  const franchise = await Franchise.deploy();
  await franchise.deployed();

  console.log(`Deployed Franchise Contract at: ${franchise.address}`);
  console.log(`Minting 12 properties...\n`);
  

  // Add 12 NFT's using this
  for (let i = 0; i < 12; i++) {
    const transaction = await franchise.connect(owner).mint(
      `https://dulligans.mypinata.cloud/ipfs/QmZBa6eGpSN9STrNUg67fHtW7N9jq86eKvzxk6i7sTotD8/${i + 1}.json`
    );
    await transaction.wait();
  }

  // Deploy Escrow
  const Escrow = await ethers.getContractFactory("Escrow");
  const escrow = await Escrow.deploy(
    franchise.address, // Add the NFT contract address as the first argument
    stakeToken.address,
    owner.address,
    inspector.address,
    lender.address,
    dao.address
  );
  await escrow.deployed();

  console.log(`Deployed Escrow Contract at: ${escrow.address}`);
  console.log(`Listing 12 properties...\n`);

  const deadlineDuration = 60 * 60 * 24 * 7; // 7 days in seconds
  const currentBlock = await hre.ethers.provider.getBlock('latest');
  const currentTimestamp = currentBlock.timestamp;

  let transaction;
  for (let i = 0; i < 12; i++) {
    // Approve properties...
    transaction = await franchise.connect(owner).approve(escrow.address, i + 1);
    await transaction.wait();
  }

  // Listing properties...
  transaction = await escrow.connect(owner).list(1, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 1')

  transaction = await escrow.connect(owner).list(2, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 2')

  transaction = await escrow.connect(owner).list(3, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 3')

  transaction = await escrow.connect(owner).list(4, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 4')

  transaction = await escrow.connect(owner).list(5, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 5')

  transaction = await escrow.connect(owner).list(6, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 6')

  transaction = await escrow.connect(owner).list(7, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 7')

  transaction = await escrow.connect(owner).list(8, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 8')

  transaction = await escrow.connect(owner).list(9, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 9')

  transaction = await escrow.connect(owner).list(10, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 10')

  transaction = await escrow.connect(owner).list(11, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 11')

  transaction = await escrow.connect(owner).list(12, buyer.address, tokens(20), tokens(0), currentTimestamp + deadlineDuration)
  await transaction.wait()
  console.log('mint 12')

  console.log(`Finished.`)
}

// We recommend this pattern to be able to use async/await everywhere
// and properly handle errors.
main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});