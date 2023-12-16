const { ethers } = require('ethers');

async function main() {
    const provider = new ethers.providers.JsonRpcProvider(
        process.env.API_URL
    );
    const wallet = new ethers.Wallet(process.env.PRIVATE_KEY, provider);
    const signer = wallet.connect(provider);

    const TransparentUpgradeableProxyAddress = "0xCe017C647A01f8d1BE076145B05b14AC1085f19b";
    const TransparentUpgradeableProxyConstructor = ["0x65B087CDd160F5F97A452b123E21B95c0E96Ba05", "0x5b678eDDA7CB6a0C8286194AC4D6Df827E7efC2e", "0x"];
   
    await run('verify:verify', {
        address: TransparentUpgradeableProxyAddress,
        constructorArguments: TransparentUpgradeableProxyConstructor
    });

}

main()
    .then(() => process.exit(0))
    .catch((error) => {
        console.error(error);
        process.exit(1);
    });