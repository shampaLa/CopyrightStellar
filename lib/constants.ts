export const STELLAR_RPC_URL =
  process.env.NEXT_PUBLIC_STELLAR_RPC_URL || 'https://soroban-rpc.testnet.stellar.org';

export const HORIZON_URL = 'https://horizon-testnet.stellar.org';

export const NETWORK_PASSPHRASE = 'Test SDF Network ; September 2015';

export const EXPLORER_BASE_URL = 'https://stellar.expert/explorer/testnet';

/* ── Contract IDs ── */

export const REGISTRY_CONTRACT_ID =
  process.env.NEXT_PUBLIC_REGISTRY_CONTRACT_ID || '';

export const COOWNERSHIP_CONTRACT_ID =
  process.env.NEXT_PUBLIC_COOWNERSHIP_CONTRACT_ID || '';

export const LICENSE_DAO_CONTRACT_ID =
  process.env.NEXT_PUBLIC_LICENSE_DAO_CONTRACT_ID || '';
