const fs = require('fs');
const { spawn } = require('child_process');



main()
  .then(() => process.exit(0))
  .catch(error => {
    console.error(error);
    process.exit(1);
  });


async function main(networkName) {
  const network = networkName ? networkName : process.argv[2];
  switch (network) {
    case 'all': {
      await main('testnets');
      await main('mainnet');
      return;
    }

    case 'testnets': {
      await main('ropsten');
      await main('kovan');
      await main('rinkeby');
      await main('goerli');
      return;
    }

    case 'mainnet':
      return await runVerify('mainnet');
    case 'ropsten':
      return await runVerify('ropsten');
    case 'kovan':
      return await runVerify('kovan');
    case 'rinkeby':
      return await runVerify('rinkeby');
    case 'goerli':
      return await runVerify('goerli');

    case 'hardhat':
      return await runVerify('hardhat');

    default:
      return await runVerify('hardhat');
  }
}


async function runVerify(networkName) {
  await runVerifyContract('VNTW', networkName);
  await runVerifyContract('Timelock', networkName);
  await runVerifyContract('GovernorAlpha', networkName);
  await runVerifyContract('TreasuryVester', networkName);
  await runVerifyContract('FeeTo', networkName);
  await runVerifyContract('FeeToSetter', networkName);
}


async function runVerifyContract(contractName, networkName) {
  return new Promise((resolve, reject) => {
    const info = getDeployedContractInfo(contractName, networkName);
    const npx = spawn(
      'npx',
      [
        'hardhat',
        '--network', networkName,
        'verify',
        info.address,
        ...info.arguments
      ]
    );

    npx.stdout.on('data', (buf) => {
      console.log(`${buf}`);
    });

    npx.stderr.on('data', (buf) => {
      console.error(`${buf}`);
    });

    npx.on('close', (code) => {
      console.log(`Verify Script done with code ${code}`);
      if (code !== 0)
        return reject(code);
      return resolve(code);
    });
  });
}


function getDeployedContractInfo(contractName, networkName) {
  const fileName = `./cache/deployed/${contractName}.json`;
  const isExists = fs.existsSync(fileName);
  if (!isExists) {
    console.error('File "%s" not found!', fileName);
    return process.exit(1);
  }

  const allInfo = JSON.parse(fs.readFileSync(fileName, { encoding: 'utf8' }));
  const info = allInfo[networkName];
  if (!info) {
    console.error('Contract "%s" not deployed in network "%s"!', contractName, networkName);
    return process.exit(1);
  }

  return info;
}
