<div align="center">
  <h1>CopyrightStellar</h1>
  <p><strong>A Decentralized Intellectual Property & Copyright Registry on Stellar Soroban</strong></p>

  <p>
    <a href="https://shiny-puppy-c4fb73.netlify.app/">Live Demo</a> •
    <a href="https://drive.google.com/file/d/1InGqwPrEn3J1PaMBYqgN-ZzLph-UcmaM/view?usp=sharing">Video Presentation</a>
  </p>

  <img src="./sub%20assets/ui.png" alt="CopyrightStellar Interface" width="800"/>
</div>

## Table of Contents
- [Overview](#overview)
- [System Architecture](#system-architecture)
- [Submission Requirements Matrix](#submission-requirements-matrix)
- [Smart Contract Infrastructure](#smart-contract-infrastructure)
- [Continuous Integration & Delivery](#continuous-integration--delivery)
- [Testing & Quality Assurance](#testing--quality-assurance)
- [Local Development Setup](#local-development-setup)
- [License](#license)

## Overview
CopyrightStellar is a comprehensive, full-stack decentralized application (dApp) designed to manage intellectual property rights. Built on the **Stellar Soroban** network, it provides creators with immutable proof-of-existence, fractional co-ownership structuring, decentralized licensing agreements, and a community-governed plagiarism dispute resolution mechanism.

## System Architecture

The application is structured into three primary tiers:

1. **Advanced Smart Contracts (Rust/Soroban):** Securely handles state management, event streaming, and asset control. Employs optimized memory management, custom error boundaries, and efficient `DataKey` enums.
2. **Frontend Client (Next.js/React):** A highly responsive, mobile-optimized interface constructed with Next.js 14, Tailwind CSS, and Framer Motion. It interfaces asynchronously with the Stellar RPC.
3. **Wallet Integration:** Directly integrates with standard Stellar wallets (e.g., Freighter) using the `@creit.tech/stellar-wallets-kit` to sign and authorize transactions securely.

<div align="center">
  <img src="./sub%20assets/mobui.png" alt="Mobile Responsive UI" width="300"/>
</div>

## Submission Requirements Matrix

| Requirement | Fulfillment & Location |
|-------------|------------------------|
| **Public GitHub Repository** | Complete. Maintained on [GitHub](https://github.com/shampaLa/CopyrightStellar). |
| **Comprehensive README** | Complete. This documentation covers all architectural and deployment aspects. |
| **Commit History** | Complete. Contains over 10+ meaningful commits (17+ CI/CD runs). |
| **Live Demo Link** | Complete. Hosted securely at [Netlify](https://shiny-puppy-c4fb73.netlify.app/). |
| **Demo Video** | Complete. [View Presentation (Google Drive)](https://drive.google.com/file/d/1InGqwPrEn3J1PaMBYqgN-ZzLph-UcmaM/view?usp=sharing). |
| **Contract Addresses** | Complete. See [Smart Contract Infrastructure](#smart-contract-infrastructure). |
| **Transaction Hash** | Complete. Hash: `c5f1419f6a0d06808a595ba36156c1b8df0e79f414f311d3df6e47170af6da0d` ([View on Explorer](https://stellar.expert/explorer/testnet/tx/c5f1419f6a0d06808a595ba36156c1b8df0e79f414f311d3df6e47170af6da0d)) |
| **Mobile Responsive UI** | Complete. Demonstrated in the live demo and architectural screenshots. |
| **CI/CD Pipeline** | Complete. See [Continuous Integration & Delivery](#continuous-integration--delivery). |
| **Test Output** | Complete. Over 10+ passing tests across Rust and TypeScript ecosystems. |

## Smart Contract Infrastructure

All smart contracts are currently deployed on the **Stellar Soroban Testnet**. The system utilizes inter-contract communication to enforce rules securely across domains.

| Contract | Address | Functionality |
|----------|---------|---------------|
| **Registry** | `CDK247D6PUHXDKAJHOTQNPG4V3JKLDYKXIERTONDDH3NMCUPE3PGEFCY` | Computes local SHA-256 hashes and permanently registers ownership metadata. |
| **Co-Ownership** | `CBM6H2CGIAJDBQ5K5747Z6RQWCP355WVBAF3LH7ECJAX4AOIEUDQLTGX` | Enables fractional split sheets (basis points) and native ownership transfers. |
| **License DAO** | `CC3466SOHIWRKY62APTMWLMOX552JDYH5ZI3IDHOXAWYB64SN7MUCNJG` | Governs automated licensing agreements and Quadratic Voting for dispute resolution. |

### Event Streaming & Real-Time Updates
The smart contracts are designed to emit custom Soroban events upon state changes. The Next.js frontend polls the Stellar RPC to capture these events, ensuring the user interface remains synchronized with the ledger with minimal latency.

## Continuous Integration & Delivery

<img src="./sub%20assets/cicd.png" alt="CI/CD Pipeline" width="800"/>

We have established a robust deployment workflow utilizing GitHub Actions to ensure zero-regression integration. Upon every push to the `main` branch, the pipeline automatically:

1. **Provisions Environments:** Initializes Node.js and Rust environments.
2. **Contract Compilation & Matrix Testing:** Compiles the `wasm32-unknown-unknown` targets and executes the `cargo test` suites across all three contracts in parallel.
3. **Frontend E2E & Unit Testing:** Validates the UI logic utilizing Vitest and performs End-to-End browser tests via Playwright.
4. **Production Build:** Generates the highly optimized static export bundle for Next.js.

## Testing & Quality Assurance

The application adheres to test-driven development principles, covering both ledger-side logic and client-side interactions. 
- **Rust Contract Tests (`cargo test`):** Strict verification of fractional distributions, registry duplication prevention, and state integrity.
- **Frontend Unit Tests (Vitest):** Mocks boundary conditions for data conversion and rendering logic.
- **End-to-End Tests (Playwright):** Simulates the user journey, including mock wallet authentication flows, to ensure resilient exception handling and loading states.

## Local Development Setup

### Prerequisites
- **Node.js**: v22.x or higher
- **Rust**: Latest stable toolchain with the `wasm32-unknown-unknown` target installed.
- **Wallet Extension**: Freighter (configured to Stellar Testnet)

### Installation Guide

1. **Clone the Repository**
   ```bash
   git clone https://github.com/shampaLa/CopyrightStellar.git
   cd CopyrightStellar
   ```

2. **Environment Configuration**
   Create a `.env.local` file in the root directory:
   ```env
   NEXT_PUBLIC_REGISTRY_CONTRACT_ID=CDK247D6PUHXDKAJHOTQNPG4V3JKLDYKXIERTONDDH3NMCUPE3PGEFCY
   NEXT_PUBLIC_COOWNERSHIP_CONTRACT_ID=CBM6H2CGIAJDBQ5K5747Z6RQWCP355WVBAF3LH7ECJAX4AOIEUDQLTGX
   NEXT_PUBLIC_LICENSE_DAO_CONTRACT_ID=CC3466SOHIWRKY62APTMWLMOX552JDYH5ZI3IDHOXAWYB64SN7MUCNJG
   NEXT_PUBLIC_STELLAR_RPC_URL=https://soroban-testnet.stellar.org
   ```

3. **Install Dependencies**
   ```bash
   npm install --ignore-scripts
   ```

4. **Initialize Local Server**
   ```bash
   npm run dev
   ```

5. **Execute Test Suites**
   - **Frontend:** `npm run test`
   - **E2E:** `npm run e2e`
   - **Contracts:** `cargo test` (run within each respective `/contracts/*` directory)

## License
This software is provided under the [MIT License](./LICENSE).
