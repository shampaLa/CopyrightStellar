#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, token, Address, BytesN, Env, String};

/// License template — defines terms for a registered work.
/// License types: 0 = CreativeCommons, 1 = MIT, 2 = Proprietary, 3 = Custom
#[derive(Clone)]
#[contracttype]
pub struct LicenseTemplate {
    pub id: u32,
    pub owner: Address,
    pub work_id: u32,
    pub license_type: u32,
    pub terms_hash: BytesN<32>,
    pub active: bool,
}

/// A plagiarism dispute — resolved by quadratic voting.
/// Status: 0 = Active, 1 = Upheld (plaintiff wins), 2 = Dismissed (defendant wins)
#[derive(Clone)]
#[contracttype]
pub struct Dispute {
    pub id: u32,
    pub plaintiff: Address,
    pub defendant: Address,
    pub work_id: u32,
    pub evidence_hash: BytesN<32>,
    pub yes_votes: i128,
    pub no_votes: i128,
    pub status: u32,
    pub end_time: u64,
}

/// Storage keys.
#[contracttype]
pub enum DataKey {
    // Licensing
    LicenseCount,
    License(u32),
    AccessKey(u32, Address), // (license_id, user) -> bool
    // Dispute DAO
    Token,
    DisputeCount,
    Dispute(u32),
    DisputeVoted(u32, Address), // (dispute_id, voter) -> bool
}

#[contract]
pub struct LicenseDaoContract;

#[contractimpl]
impl LicenseDaoContract {
    /* ─── Licensing ─── */

    /// Create a new license template for a work.
    pub fn create_license(
        env: Env,
        owner: Address,
        work_id: u32,
        license_type: u32,
        terms_hash: BytesN<32>,
    ) -> u32 {
        owner.require_auth();

        if license_type > 3 {
            panic!("Invalid license type. Use 0=CC, 1=MIT, 2=Proprietary, 3=Custom");
        }

        let mut count: u32 = env.storage().instance().get(&DataKey::LicenseCount).unwrap_or(0);
        count += 1;

        let license = LicenseTemplate {
            id: count,
            owner,
            work_id,
            license_type,
            terms_hash,
            active: true,
        };

        env.storage().persistent().set(&DataKey::License(count), &license);
        env.storage().instance().set(&DataKey::LicenseCount, &count);

        env.events().publish(
            (symbol_short!("license"), count),
            symbol_short!("created"),
        );

        count
    }

    /// Grant access to a user under a specific license.
    pub fn grant_access(env: Env, license_id: u32, owner: Address, grantee: Address) {
        owner.require_auth();

        let license: LicenseTemplate = env
            .storage()
            .persistent()
            .get(&DataKey::License(license_id))
            .expect("License not found");

        if license.owner != owner {
            panic!("Only the license owner can grant access");
        }

        env.storage().persistent().set(&DataKey::AccessKey(license_id, grantee.clone()), &true);

        env.events().publish(
            (symbol_short!("access"), license_id),
            (symbol_short!("granted"), grantee),
        );
    }

    /// Revoke a user's access under a specific license.
    pub fn revoke_access(env: Env, license_id: u32, owner: Address, grantee: Address) {
        owner.require_auth();

        let license: LicenseTemplate = env
            .storage()
            .persistent()
            .get(&DataKey::License(license_id))
            .expect("License not found");

        if license.owner != owner {
            panic!("Only the license owner can revoke access");
        }

        env.storage().persistent().remove(&DataKey::AccessKey(license_id, grantee.clone()));

        env.events().publish(
            (symbol_short!("access"), license_id),
            (symbol_short!("revoked"), grantee),
        );
    }

    /// Check if a user has access under a specific license.
    pub fn check_access(env: Env, license_id: u32, user: Address) -> bool {
        env.storage()
            .persistent()
            .get(&DataKey::AccessKey(license_id, user))
            .unwrap_or(false)
    }

    /// Get license details by ID.
    pub fn get_license(env: Env, id: u32) -> LicenseTemplate {
        env.storage()
            .persistent()
            .get(&DataKey::License(id))
            .expect("License not found")
    }

    /* ─── Dispute DAO ─── */

    /// Initialize the DAO with a governance token for quadratic voting costs.
    pub fn init_dao(env: Env, token: Address) {
        if env.storage().instance().has(&DataKey::Token) {
            panic!("DAO already initialized");
        }
        env.storage().instance().set(&DataKey::Token, &token);
        env.storage().instance().set(&DataKey::DisputeCount, &0u32);
    }

    /// File a new plagiarism dispute.
    pub fn file_dispute(
        env: Env,
        plaintiff: Address,
        defendant: Address,
        work_id: u32,
        evidence_hash: BytesN<32>,
    ) -> u32 {
        plaintiff.require_auth();

        let mut count: u32 = env.storage().instance().get(&DataKey::DisputeCount).unwrap_or(0);
        count += 1;

        let dispute = Dispute {
            id: count,
            plaintiff: plaintiff.clone(),
            defendant,
            work_id,
            evidence_hash,
            yes_votes: 0,
            no_votes: 0,
            status: 0, // Active
            end_time: env.ledger().timestamp() + 300, // 5-minute voting period for testnet demo
        };

        env.storage().persistent().set(&DataKey::Dispute(count), &dispute);
        env.storage().instance().set(&DataKey::DisputeCount, &count);

        env.events().publish(
            (symbol_short!("dispute"), count),
            (symbol_short!("filed"), plaintiff),
        );

        count
    }

    /// Cast a quadratic vote on a dispute.
    /// Cost = votes² tokens, transferred to the contract.
    pub fn vote_dispute(env: Env, voter: Address, dispute_id: u32, votes: i128, support_plaintiff: bool) {
        voter.require_auth();

        let mut dispute: Dispute = env
            .storage()
            .persistent()
            .get(&DataKey::Dispute(dispute_id))
            .expect("Dispute not found");

        if dispute.status != 0 {
            panic!("Dispute is not active");
        }

        if env.ledger().timestamp() >= dispute.end_time {
            panic!("Voting period has ended");
        }

        // Check double voting
        let voted_key = DataKey::DisputeVoted(dispute_id, voter.clone());
        if env.storage().persistent().has(&voted_key) {
            panic!("Voter has already voted on this dispute");
        }

        // Quadratic cost
        let cost = votes.checked_mul(votes).expect("Cost overflow");
        if cost <= 0 {
            panic!("Must vote with at least 1 vote");
        }

        // Transfer voting token cost (if DAO has a token)
        if env.storage().instance().has(&DataKey::Token) {
            let token_addr: Address = env.storage().instance().get(&DataKey::Token).unwrap();
            let token_client = token::Client::new(&env, &token_addr);
            token_client.transfer(&voter, &env.current_contract_address(), &cost);
        }

        if support_plaintiff {
            dispute.yes_votes += votes;
        } else {
            dispute.no_votes += votes;
        }

        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);
        env.storage().persistent().set(&voted_key, &true);

        env.events().publish(
            (symbol_short!("vote"), dispute_id),
            (voter, votes, support_plaintiff),
        );
    }

    /// Resolve a dispute after the voting period ends.
    pub fn resolve_dispute(env: Env, dispute_id: u32) {
        let mut dispute: Dispute = env
            .storage()
            .persistent()
            .get(&DataKey::Dispute(dispute_id))
            .expect("Dispute not found");

        if dispute.status != 0 {
            panic!("Dispute already resolved");
        }

        if env.ledger().timestamp() < dispute.end_time {
            panic!("Voting period is still active");
        }

        if dispute.yes_votes > dispute.no_votes {
            dispute.status = 1; // Upheld
        } else {
            dispute.status = 2; // Dismissed
        }

        env.storage().persistent().set(&DataKey::Dispute(dispute_id), &dispute);

        env.events().publish(
            (symbol_short!("dispute"), dispute_id),
            dispute.status,
        );
    }

    /// Get dispute details by ID.
    pub fn get_dispute(env: Env, id: u32) -> Dispute {
        env.storage()
            .persistent()
            .get(&DataKey::Dispute(id))
            .expect("Dispute not found")
    }

    /// Get total dispute count.
    pub fn get_dispute_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::DisputeCount).unwrap_or(0)
    }
}

mod test;
