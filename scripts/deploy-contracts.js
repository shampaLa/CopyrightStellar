// scripts/deploy-contracts.js
// Script to deploy Stellar Soroban contracts for the CopyrightStellar project.
// Uses the Soroban CLI (`soroban`) which should be installed globally or via npm.
// Ensure you have the STARLARK testnet credentials and the compiled WASM files
// located in the `contracts/` directory.

const { execSync } = require('child_process');
const path = require('path');

// Helper to run a command and log output
function runCommand(command) {
  console.log(`Executing: ${command}`);
  try {
    const output = execSync(command, { stdio: 'inherit' });
    return output;
  } catch (err) {
    console.error(`Error executing command: ${command}`);
    process.exit(1);
  }
}

// Paths to compiled contract WASM files (adjust if different)
const contracts = {
  registry: path.resolve(__dirname, '..', 'contracts', 'registry-contract.wasm'),
  coownership: path.resolve(__dirname, '..', 'contracts', 'co-ownership-contract.wasm'),
  licenseDao: path.resolve(__dirname, '..', 'contracts', 'license-dao-contract.wasm'),
};

// Deploy each contract sequentially
Object.entries(contracts).forEach(([name, wasmPath]) => {
  console.log(`\nDeploying ${name} contract from ${wasmPath}`);
  // soroban contract deploy <wasm> --network testnet --source <keypair>
  // Adjust flags as needed for your environment.
  const cmd = `soroban contract deploy ${wasmPath} --network testnet`;
  runCommand(cmd);
});

console.log('\nAll contracts deployed successfully.');
