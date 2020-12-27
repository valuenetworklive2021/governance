const fs = require('fs');
const hre = require('hardhat');



async function main() {
  checkDir();
  const accounts = await ethers.getSigners();
  const owner = accounts[0].address;
  const feeRecipient = owner;

  const mintingAllowedAfter = parseInt(new Date("2020-12-22T00:00:00.000Z").getTime()/1000);
  const infoVNTW = await deployVNTW(owner, owner, mintingAllowedAfter);

  const infoTimelock = await deployTimelock(owner);
  await infoVNTW.instance.setMinter(infoTimelock.instance.address);

  const infoGovernorAlpha = await deployGovernorAlpha(
    infoTimelock.instance.address,
    infoVNTW.instance.address
  );
  await infoTimelock.instance.setAdmin(infoGovernorAlpha.instance.address);

  //MerkleDistributor
  //StakingRewardsFactory

  const vestingAmount = '1000000000000000000000'; // 1000 VNTW
  const recipient = owner;
  const vestingBegin = parseInt(new Date("2020-12-12T00:00:00.000Z").getTime()/1000);
  const vestingCliff = parseInt(new Date("2020-12-23T01:00:00.000Z").getTime()/1000);
  const vestingEnd = parseInt(new Date("2020-12-27T02:00:00.000Z").getTime()/1000);
  const infoTreasuryVester = await deployTreasuryVester(
    infoVNTW.instance.address, recipient, vestingAmount, vestingBegin, vestingCliff, vestingEnd
  );
  await infoVNTW.instance.transfer(infoTreasuryVester.instance.address, vestingAmount); // ?!?

  const infoFeeTo = await deployFeeTo(owner, feeRecipient);
  const ValueswapV2Factory = '0x7C745e4362BBb4f51593B76Edd66324cDc53deea'; // ?!? FACTORY_ADDRESS
  const feeTo = infoFeeTo.instance.address;
  const infoFeeToSetter = await deployFeeToSetter(ValueswapV2Factory, vestingEnd, owner, feeTo);
}

main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


function checkDir() {
  const isExists = fs.existsSync('./cache/deployed');
  if (!isExists)
    fs.mkdirSync('./cache/deployed', { recursive: true });
}


async function deployVNTW(account, minter, mintingAllowedAfter) {
  const name = 'VNTW';
  const arguments = [account, minter, mintingAllowedAfter];
  console.log('Deploying contract "%s"!', name);

  const factory = await hre.ethers.getContractFactory(name);
  const instance = await factory.deploy(...arguments);
  await instance.deployed();

  updateDeployedContractInfo(name, instance, arguments);

  return { name, arguments, instance, factory };
}


async function deployTimelock(admin) { // admin == GovernorAlpha
  const name = 'Timelock';
  const delay = 172800; // 2 days
  const arguments = [admin , delay];
  console.log('Deploying contract "%s"!', name);

  const factory = await hre.ethers.getContractFactory(name);
  const instance = await factory.deploy(...arguments);
  await instance.deployed();

  updateDeployedContractInfo(name, instance, arguments);

  return { name, arguments, instance, factory };
}


async function deployGovernorAlpha(timelock, vntw) {
  const name = 'GovernorAlpha';
  const arguments = [timelock, vntw];
  console.log('Deploying contract "%s"!', name);

  const factory = await hre.ethers.getContractFactory(name);
  const instance = await factory.deploy(...arguments);
  await instance.deployed();

  updateDeployedContractInfo(name, instance, arguments);

  return { name, arguments, instance, factory };
}

/*
MerkleDistributor
StakingRewardsFactory
*/

async function deployTreasuryVester(vntw, recipient, vestingAmount, vestingBegin, vestingCliff, vestingEnd) {
  const name = 'TreasuryVester';
  const arguments = [vntw, recipient, vestingAmount, vestingBegin, vestingCliff, vestingEnd];
  console.log('Deploying contract "%s"!', name);

  const factory = await hre.ethers.getContractFactory(name);
  const instance = await factory.deploy(...arguments);
  await instance.deployed();

  updateDeployedContractInfo(name, instance, arguments);

  return { name, arguments, instance, factory };
}


async function deployFeeTo(owner, feeRecipient) {
  const name = 'FeeTo';
  const arguments = [owner];
  console.log('Deploying contract "%s"!', name);

  const factory = await hre.ethers.getContractFactory(name);
  const instance = await factory.deploy(...arguments);
  await instance.deployed();

  updateDeployedContractInfo(name, instance, arguments);

  await instance.setFeeRecipient(feeRecipient);

  return { name, arguments, instance, factory };
}


async function deployFeeToSetter(ValueswapV2Factory, vestingEnd, owner, feeTo) {
  const name = 'FeeToSetter';
  const arguments = [ValueswapV2Factory, vestingEnd, owner, feeTo];
  console.log('Deploying contract "%s"!', name);

  const factory = await hre.ethers.getContractFactory(name);
  const instance = await factory.deploy(...arguments);
  await instance.deployed();

  updateDeployedContractInfo(name, instance, arguments);

  return { name, arguments, instance, factory };
}


function updateDeployedContractInfo(name, instance, arguments = []) {
  const newInfo = {
    [instance.provider.network.name]: {
      name: name,
      address: instance.address,
      signer: instance.signer.address,
      arguments: arguments,
    }
  };
  console.log(newInfo);

  const fileName = `./cache/deployed/${name}.json`;
  const isExists = fs.existsSync(fileName);
  if (!isExists) {
    fs.writeFileSync(fileName, JSON.stringify({}, null, 2));
  }

  const oldInfo = JSON.parse(fs.readFileSync(fileName, { encoding: 'utf8' }));
  const info = Object.assign({}, oldInfo, newInfo);
  fs.writeFileSync(fileName, JSON.stringify(info, null, 2));
}
