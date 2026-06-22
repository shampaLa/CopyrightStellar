# 📜 CopyrightStellar — Decentralized IP & Copyright Registry

CopyrightStellar is a full-stack decentralized intellectual property registry built on **Stellar Soroban**. Creators can register cryptographic proof-of-existence for their works, define fractional co-ownership (split sheets), create license templates, and resolve plagiarism disputes through community-driven **Quadratic Voting**.

---

## 🚀 Deployed Testnet Specifications

*   **Registry Contract**: `CD7AEOW3GEAWLBLJYIL4JHPKQO2IWS5AVYB2FYGPQGHBK4NJCTG42IDS`
*   **Co-Ownership Contract**: `CBGYW3PZRJJAIX4MJUUTCZSTWTXIEAUMD75N6WOTWWWDPGLGJAREWWOH`
*   **License DAO Contract**: `CD4JQ6LX5TIK2OO563ZQ3VZYBLSISHOXJF7C2DIQOYTLQTT2YVDEGOQM`
*   **Stellar Network**: Testnet
*   **Live Demo**: [https://copyrightstellar.netlify.app](https://shiny-puppy-c4fb73.netlify.app/)

---

## 🌟 Progressive Deliverables (Level 1, 2, and 3)

### 👛 Level 1: Wallet Connection & Proof-of-Existence
- **Wallet Bridging**: Direct integration with Freighter, xBull, and Albedo wallets via the Stellar Wallets Kit.
- **Balance Polling**: Real-time XLM balance fetching to keep UI synchronized with the ledger.
- **Direct XLM Transfer** (`/transfer`): Send native XLM to any Stellar address with transaction tracking.
- **File Registration** (`/register`): Drop any file into the browser → SHA-256 hash is computed locally (file never leaves your machine) → hash is registered on-chain with title, description, and timestamp.
- **Instant Verification** (`/verify`): Re-hash a file or paste a hash to check if it's registered on-chain. Shows creator, title, and timestamp.

### ⛓️ Level 2: Fractional Co-Ownership (Split Sheets)
- **Co-Ownership Contract** (`co-ownership-contract`): Register works with multiple creators and custom ownership splits in basis points (e.g., 60%/40%). Shares can be partially transferred.
- **Split Sheet Creator** (`/split`): Dynamic multi-creator form with percentage bar visualization. Shares must sum to exactly 100%.
- **IP Portfolio** (`/portfolio`): View all works where you hold ownership shares. Transfer shares to other addresses with on-chain settlement.

### 📡 Level 3: Licensing & Plagiarism Dispute DAO
- **License Templates** (`/licenses`): Define Creative Commons, MIT, Proprietary, or Custom license types on-chain. Grant and revoke access keys to specific addresses.
- **Plagiarism Dispute DAO** (`/disputes`): File plagiarism claims with evidence hashes. Community members vote using **Quadratic Voting** ($cost = votes^2$) to fairly resolve disputes.
- **CI/CD Pipeline** (`ci.yml`): Automated GitHub Actions workflow running Rust contract tests (3 contracts × matrix build), Vitest frontend tests, and Next.js production builds.
- **Test Coverage**:
  - **Cargo Contract Tests**: 13 passing tests across 3 contracts (registry, co-ownership, license-dao).
  - **Vitest Frontend Suite**: 12 passing tests verifying utility helpers and UI components.

---

## 🛠️ Technology Stack

- **Frontend**: Next.js 14 (App Router) + TypeScript + Tailwind CSS (Deep indigo/violet dark theme)
- **Contracts**: Rust (Soroban SDK `22.0.1`)
- **Stellar Integration**: `@stellar/stellar-sdk` & `@creit.tech/stellar-wallets-kit`
- **Testing**: Vitest + JSDOM for frontend; Cargo test for Rust contracts
- **CI/CD**: GitHub Actions (matrix build for all 3 contracts)

---

## 📦 Smart Contracts

| Contract | Level | Purpose |
|----------|-------|---------|
| `registry-contract` | L1 | Register file hashes as proof-of-existence with timestamps |
| `co-ownership-contract` | L2 | Multi-creator fractional ownership with transferable shares |
| `license-dao-contract` | L3 | License templates, access keys, and quadratic-voting dispute DAO |

---

## 💻 Local Installation & Getting Started

### 📋 Prerequisites
- Node.js 18+ or 20+
- Cargo + Rust Toolchain (with `wasm32-unknown-unknown` target)
- Freighter Wallet extension installed

### 🛠️ Step-by-Step Setup

1. **Navigate to the CopyrightStellar Directory**:
   ```bash
   cd "level 3/CopyrightStellar"
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root with the following configuration:
   ```env
   NEXT_PUBLIC_REGISTRY_CONTRACT_ID=CD7AEOW3GEAWLBLJYIL4JHPKQO2IWS5AVYB2FYGPQGHBK4NJCTG42IDS
   NEXT_PUBLIC_COOWNERSHIP_CONTRACT_ID=CBGYW3PZRJJAIX4MJUUTCZSTWTXIEAUMD75N6WOTWWWDPGLGJAREWWOH
   NEXT_PUBLIC_LICENSE_DAO_CONTRACT_ID=CD4JQ6LX5TIK2OO563ZQ3VZYBLSISHOXJF7C2DIQOYTLQTT2YVDEGOQM
   NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-rpc.testnet.stellar.org
   ```

3. **Install Dependencies**:
   ```bash
   npm install --ignore-scripts
   ```

4. **Run the Development Server**:
   ```bash
   npm run dev
   ```

5. **Run the Test Suite**:
   *   **Frontend Tests**: `npm run test`
   *   **Rust Contract Tests**:
       ```bash
       cd contracts/registry-contract && cargo test
       cd contracts/co-ownership-contract && cargo test
       cd contracts/license-dao-contract && cargo test
       ```

---

## 📄 License
This project is licensed under the MIT License.
