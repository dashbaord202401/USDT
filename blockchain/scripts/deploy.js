const { ethers } = require('ethers');
const fs = require('fs');
require('dotenv').config();

const TransparentUpgradeableProxy = JSON.parse(fs.readFileSync("./artifacts/contracts/TransparentUpgradeableProxy.sol/TransparentUpgradeableProxy.json", "utf8"));
const TransparentUpgradeableProxyABI = TransparentUpgradeableProxy.abi;
const TransparentUpgradeableProxyBytecode = TransparentUpgradeableProxy.bytecode;

const logicContractAddress = '0x65B087CDd160F5F97A452b123E21B95c0E96Ba05';
const adminAddress = '0x5b678eDDA7CB6a0C8286194AC4D6Df827E7efC2e';
async function main() {
    const provider = new ethers.providers.JsonRpcProvider("https://rpc-mumbai.maticvigil.com");
    const wallet = new ethers.Wallet('0xeb548cd9aabc79392d5b01ff8b6d74168cfe99a8e370c03eb0aa466f87bb77cb' , provider);
    const signer = wallet.connect(provider);
    console.log(`Deploying contracts with the account: ${signer.address}`);

     // Deploy TransparentUpgradeableProxy contract
     const TransparentUpgradeableProxyFactory = new ethers.ContractFactory(
        TransparentUpgradeableProxyABI,
        TransparentUpgradeableProxyBytecode,
        signer
    );

    // Deploy TransparentUpgradeableProxy with TransparentUpgradeableProxy as the logic contract
    const TransparentUpgradeableProxyContract = await TransparentUpgradeableProxyFactory.deploy(
        logicContractAddress,
        adminAddress,
        '0x' // Initialization data if needed
    );

    await TransparentUpgradeableProxyContract.deployed();
    console.log('TransparentUpgradeableProxy deployed to:', TransparentUpgradeableProxyContract.address);
}

// Run the deployment
main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });
