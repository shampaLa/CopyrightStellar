# 📜 CopyrightStellar — Decentralized IP & Copyright Registry

![CopyrightStellar Cover](./sub%20assets/ui.png)

CopyrightStellar is a full-stack decentralized intellectual property registry built on **Stellar Soroban**. Creators can register cryptographic proof-of-existence for their works, define fractional co-ownership (split sheets), create license templates, and resolve plagiarism disputes through community-driven **Quadratic Voting**.

---

## 🚀 Live Demo & Video Presentation
- **Live Netlify Demo**: [https://shiny-puppy-c4fb73.netlify.app/](https://shiny-puppy-c4fb73.netlify.app/)
- **Demo Video (1-2 mins)**: [Watch on Google Drive](https://drive.google.com/file/d/1InGqwPrEn3J1PaMBYqgN-ZzLph-UcmaM/view?usp=sharing)

---

## 📋 Submission Checklist Requirements

✅ **Public GitHub repository**: [CopyrightStellar GitHub Repository](https://github.com/shampaLa/CopyrightStellar)
✅ **README with complete documentation**: *You are reading it!*
✅ **Minimum 10+ meaningful commits**: Achieved throughout the development lifecycle (17+ workflow runs).
✅ **Live demo link**: [Deployed on Netlify](https://shiny-puppy-c4fb73.netlify.app/)
✅ **Contract deployment address**: Included below.
✅ **Transaction hash for contract interaction**: Included below.
✅ **Screenshot showing Mobile UI**: Included below.
✅ **Screenshot showing CI/CD pipeline running**: Included below.
✅ **Screenshot showing Test output with 3+ passing tests**: Included below (runs within CI/CD & local terminal).
✅ **Demo video link (1–2 minutes)**: [Linked Here](https://drive.google.com/file/d/1InGqwPrEn3J1PaMBYqgN-ZzLph-UcmaM/view?usp=sharing)

---

## 🛰️ Deployed Contract Addresses & On-Chain Proof

All smart contracts are successfully compiled, optimized, and deployed on the **Stellar Soroban Testnet**.

- **Registry Contract**: `CDK247D6PUHXDKAJHOTQNPG4V3JKLDYKXIERTONDDH3NMCUPE3PGEFCY`
- **Co-Ownership Contract**: `CBM6H2CGIAJDBQ5K5747Z6RQWCP355WVBAF3LH7ECJAX4AOIEUDQLTGX`
- **License DAO Contract**: `CC3466SOHIWRKY62APTMWLMOX552JDYH5ZI3IDHOXAWYB64SN7MUCNJG`
- **Network**: Testnet

### 🔗 Transaction Hash (Contract Interaction)
- **Initialize Registry Contract**: `c5f1419f6a0d06808a595ba36156c1b8df0e79f414f311d3df6e47170af6da0d`
- **Explorer Link**: [View on Stellar Expert](https://stellar.expert/explorer/testnet/tx/c5f1419f6a0d06808a595ba36156c1b8df0e79f414f311d3df6e47170af6da0d)

---

## 🎨 UI/UX & Responsive Design

### Mobile Responsive UI
We ensure a seamless user experience across all devices with our responsive, fluid Tailwind CSS architecture, delivering a premium "charcoal/teal/amber" dark theme aesthetic without breaking usability on smaller screens.

![Mobile Responsive UI](./sub%20assets/mobui.png)

### Desktop UI Overview
![Desktop UI](./sub%20assets/ui.png)

---

## 🌟 Advanced Features (Levels 1, 2, & 3)

### 1️⃣ Advanced Smart Contract Development & Proof-of-Existence
- **Registry Contract**: Safely registers a local client-side SHA-256 hash (the file itself never leaves the creator's machine) onto the Soroban ledger, storing metadata like creator address, title, description, and timestamp.
- **Production-Ready Practices**: State handling uses efficient `DataKey` enums, custom `Error` types, proper bounds checking, and optimized memory management in Rust.

### 2️⃣ Inter-Contract Communication & Co-Ownership
- **Co-Ownership Splits**: The `co-ownership-contract` interacts smoothly across the dApp. Creators register fractional ownership split sheets in basis points (e.g., 60% / 40%), validating they always sum to exactly 10,000 (100%).
- Shares are natively transferable between addresses while retaining strict access controls.

### 3️⃣ Event Streaming & Real-Time Updates
- Custom Soroban events are emitted directly from the contracts (e.g., `topics: ["LicenseCreated", license_id]`).
- The frontend efficiently polls for these events to update the UI asynchronously, reflecting real-time transaction finality.

### 4️⃣ Error Handling & Loading States
- Robust exception handling handles user declines (e.g., rejecting Freighter wallet signature requests), insufficient balance errors, or contract simulation errors.
- **Loading states**: Graceful spinners, disabled buttons during asynchronous requests, and toast notifications (success/error popups) provide premium user feedback.

### 5️⃣ Licensing & Plagiarism Dispute DAO (Quadratic Voting)
- **License Templates**: Define CC, MIT, or custom licenses directly on-chain.
- **Quadratic Voting DAO**: Fair and Sybil-resistant mechanism to resolve plagiarism disputes. It calculates $cost = votes^2$, democratizing the voting weight of the community.

---

## 🧪 Testing (Contracts & Frontend)

![CI/CD Pipeline & Tests](./sub%20assets/cicd.png)

We adopted a test-driven approach with over **10+ tests** enforcing correctness:
- **Contracts (Rust `cargo test`)**: 13 unit tests strictly verify split distributions, registry overwriting prevention, and proper event emission.
- **Frontend (Vitest & Playwright)**: Unit tests for utility helper logic (stroops/XLM conversions) and End-to-End (E2E) UI testing isolating the wallet connection flow via Playwright mocking. 

*(See `test-results` or the CI/CD screenshot for visual proof of 3+ passing tests).*

---

## 🚀 CI/CD Pipeline Setup

Our robust GitHub Actions workflow automates the following on every push/PR to `main`:
1. **Rust Smart Contract Builds**: Checks out the repo, installs the `wasm32` target, caches cargo registries, and runs tests across the 3 smart contracts in a matrix.
2. **Frontend Test Matrix**: Tests components and utilities with Vitest.
3. **E2E Next.js Validation**: Builds the static export bundle of Next.js and runs Playwright testing to ensure zero regression on UI flows.
4. **Smart Contract Deployment Workflow**: Continuous verification prevents regressions from being pushed to production.

---

## 💻 Local Installation & Getting Started

### 📋 Prerequisites
- Node.js 22+
- Cargo + Rust Toolchain (`wasm32-unknown-unknown` target)
- Freighter Wallet extension installed

### 🛠️ Step-by-Step Setup

1. **Clone the repository**:
   ```bash
   git clone https://github.com/shampaLa/CopyrightStellar.git
   cd CopyrightStellar
   ```

2. **Configure Environment Variables**:
   Create a `.env.local` file in the root with the following configuration:
   ```env
   NEXT_PUBLIC_REGISTRY_CONTRACT_ID=CDK247D6PUHXDKAJHOTQNPG4V3JKLDYKXIERTONDDH3NMCUPE3PGEFCY
   NEXT_PUBLIC_COOWNERSHIP_CONTRACT_ID=CBM6H2CGIAJDBQ5K5747Z6RQWCP355WVBAF3LH7ECJAX4AOIEUDQLTGX
   NEXT_PUBLIC_LICENSE_DAO_CONTRACT_ID=CC3466SOHIWRKY62APTMWLMOX552JDYH5ZI3IDHOXAWYB64SN7MUCNJG
   NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
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
   *   **E2E Tests**: `npm run e2e`
   *   **Rust Contract Tests**:
       ```bash
       cd contracts/registry-contract && cargo test
       cd contracts/co-ownership-contract && cargo test
       cd contracts/license-dao-contract && cargo test
       ```

---

## 📄 License
This project is licensed under the MIT License.
