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
      return await runDeploy('mainnet');
    case 'ropsten':
      return await runDeploy('ropsten');
    case 'kovan':
      return await runDeploy('kovan');
    case 'rinkeby':
      return await runDeploy('rinkeby');
    case 'goerli':
      return await runDeploy('goerli');

    case 'hardhat':
      return await runDeploy('hardhat');

    default:
      return await runDeploy('hardhat');
  }
}

async function runDeploy(networkName) {
  return new Promise((resolve, reject) => {
    const npx = spawn(
      'npx',
      [
        'hardhat',
        '--network', networkName,
        'run',
        'scripts/deploy-script.js'
      ]
    );

    npx.stdout.on('data', (buf) => {
      console.log(`${buf}`);
    });

    npx.stderr.on('data', (buf) => {
      console.log(`${buf}`);
    });

    npx.on('close', (code) => {
      console.log(`Deploy Script done with code ${code}`);
      if (code !== 0)
        return reject(code);
      return resolve(code);
    });
  });
}
