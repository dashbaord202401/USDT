const Web3 = require('web3');
const readline = require('readline');
const mysql = require('mysql');
const contractAbi = require('../backend/ABI/abi.json');

// Initialize Web3 with your Ethereum node endpoint
const web3 = new Web3(process.env.API_URL);

// Replace with the address of your TransparentUpgradeableProxy contract
const contractAddress = '0xCe017C647A01f8d1BE076145B05b14AC1085f19b';

// Replace with the private key of the sender account
const privateKey = [process.env.PRIVATE_KEY];

// Create a Web3 account using the private key
const account = web3.eth.accounts.privateKeyToAccount(privateKey);
web3.eth.accounts.wallet.add(account);

// Create a contract instance
const TransparentUpgradeableProxyContract = new web3.eth.Contract(contractAbi, contractAddress);

// Create readline interface
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

// Connect to your MySQL database
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'transaction_db',
});

// Connect to the MySQL database
connection.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    process.exit(1);
  }

  console.log('Connected to MySQL database');

  // Create the transactions table if it doesn't exist
  const createTableQuery = `
    CREATE TABLE IF NOT EXISTS transactions (
      id INT AUTO_INCREMENT PRIMARY KEY,
      function_name VARCHAR(255) NOT NULL,
      transaction_hash VARCHAR(66) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `;

  connection.query(createTableQuery, (err) => {
    if (err) {
      console.error('Error creating table:', err);
      closeResources();
    } else {
      // Call the main function to handle user input
      main();
    }
  });
});

// Function to execute a query and log errors
function executeQuery(query) {
  return new Promise((resolve, reject) => {
    connection.query(query, (err, result) => {
      if (err) {
        console.error('Error executing query:', err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
}

// Function to get user input
async function getUserInput(question) {
  return new Promise((resolve) => {
    rl.question(question, (answer) => {
      resolve(answer);
    });
  });
}

// Function to handle user input and execute corresponding functions
async function main() {
  while (true) {
    console.log('1. Get current admin');
    console.log('2. Get current implementation');
    console.log('3. Change admin');
    console.log('4. Upgrade implementation');
    console.log('5. Upgrade implementation and call');
    console.log('6. Exit');

    const choice = await getUserInput('Enter your choice: ');

    switch (choice) {
      case '1':
        await handleTransaction('getCurrentAdmin', getCurrentAdmin);
        break;
      case '2':
        await handleTransaction('getCurrentImplementation', getCurrentImplementation);
        break;
      case '3':
        await handleTransaction('changeAdmin', changeAdmin);
        break;
      case '4':
        await handleTransaction('upgradeImplementation', upgradeImplementation);
        break;
      case '5':
        await handleTransaction('upgradeImplementationAndCall', upgradeImplementationAndCall);
        break;
      case '6':
        closeResources();
        break;
      default:
        console.log('Invalid choice. Please try again.');
    }
  }
}

// Function to handle a transaction, log it, and store it in the database
async function handleTransaction(functionName, func) {
  try {
    const result = await func();
    console.log(`${functionName} result:`, result);

    // Store the transaction details in the database
    const insertQuery = `
      INSERT INTO transactions (function_name, transaction_hash)
      VALUES ('${functionName}', '${result.transactionHash}');
    `;
    await executeQuery(insertQuery);

    console.log('Transaction details stored in the database.');
  } catch (error) {
    console.error('Error processing transaction:', error);
  }
}

// Function to get the current admin
async function getCurrentAdmin() {
  return TransparentUpgradeableProxyContract.methods.admin().call();
}

// Function to get the current implementation
async function getCurrentImplementation() {
  return TransparentUpgradeableProxyContract.methods.implementation().call();
}

// Function to change the admin
async function changeAdmin() {
  const newAdmin = await getUserInput('Enter the new admin address: ');
  return TransparentUpgradeableProxyContract.methods.changeAdmin(newAdmin).send({ from: account.address, gas: 3000000 });
}

// Function to upgrade the implementation
async function upgradeImplementation() {
  const newImplementation = await getUserInput('Enter the new implementation address: ');
  return TransparentUpgradeableProxyContract.methods.upgradeTo(newImplementation).send({ from: account.address, gas: 3000000 });
}

// Function to upgrade the implementation and call a function
async function upgradeImplementationAndCall() {
  const newImplementation = await getUserInput('Enter the new implementation address: ');
  const data = await getUserInput('Enter the encoded function call data (if any): ');
  return TransparentUpgradeableProxyContract.methods.upgradeToAndCall(newImplementation, data).send({ from: account.address, gas: 3000000 });
}

// Function to close the readline interface and database connection
function closeResources() {
  rl.close();
  connection.end();
  process.exit();
}
