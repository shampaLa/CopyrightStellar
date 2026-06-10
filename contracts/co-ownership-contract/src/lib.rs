#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, String, Vec};

/// A co-owned work — stores metadata and total shares (always 10000 = 100.00%).
#[derive(Clone)]
#[contracttype]
pub struct CoOwnedWork {
    pub id: u32,
    pub title: String,
    pub file_hash: BytesN<32>,
    pub total_shares: u32,
    pub creator_count: u32,
    pub created_at: u64,
}

/// Storage keys.
#[contracttype]
pub enum DataKey {
    WorkCount,
    Work(u32),
    Share(u32, Address), // (work_id, owner) -> basis points
    CreatorList(u32),    // work_id -> number of creators (for iteration)
    CreatorAt(u32, u32), // (work_id, index) -> Address
}

#[contract]
pub struct CoOwnershipContract;

#[contractimpl]
impl CoOwnershipContract {
    /// Register a new co-owned work. All creators must authorize.
    /// Shares are in basis points (0-10000) and must sum to exactly 10000.
    pub fn register_work(
        env: Env,
        creators: Vec<Address>,
        shares: Vec<u32>,
        file_hash: BytesN<32>,
        title: String,
    ) -> u32 {
        let len = creators.len();
        if len == 0 {
            panic!("At least one creator required");
        }
        if len != shares.len() {
            panic!("Creators and shares arrays must have the same length");
        }

        // Verify shares sum to 10000
        let mut total: u32 = 0;
        for i in 0..shares.len() {
            let s = shares.get(i).unwrap();
            if s == 0 {
                panic!("Each share must be greater than 0");
            }
            total += s;
        }
        if total != 10000 {
            panic!("Shares must sum to exactly 10000 (100%)");
        }

        // All creators must authorize
        for i in 0..creators.len() {
            creators.get(i).unwrap().require_auth();
        }

        let mut count: u32 = env.storage().instance().get(&DataKey::WorkCount).unwrap_or(0);
        count += 1;

        let work = CoOwnedWork {
            id: count,
            title,
            file_hash: file_hash.clone(),
            total_shares: 10000,
            creator_count: len,
            created_at: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Work(count), &work);
        env.storage().persistent().set(&DataKey::CreatorList(count), &len);

        // Store each creator's share
        for i in 0..creators.len() {
            let creator = creators.get(i).unwrap();
            let share = shares.get(i).unwrap();
            env.storage().persistent().set(&DataKey::Share(count, creator.clone()), &share);
            env.storage().persistent().set(&DataKey::CreatorAt(count, i), &creator);
        }

        env.storage().instance().set(&DataKey::WorkCount, &count);

        env.events().publish(
            (symbol_short!("cowork"), count),
            symbol_short!("created"),
        );

        count
    }

    /// Transfer a share (partial or full) from one address to another.
    pub fn transfer_share(env: Env, work_id: u32, from: Address, to: Address, amount: u32) {
        from.require_auth();

        if amount == 0 {
            panic!("Transfer amount must be greater than 0");
        }

        let current: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::Share(work_id, from.clone()))
            .expect("Sender has no share in this work");

        if amount > current {
            panic!("Insufficient share balance");
        }

        let new_from = current - amount;
        let existing_to: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::Share(work_id, to.clone()))
            .unwrap_or(0);

        let new_to = existing_to + amount;

        // Update sender
        if new_from == 0 {
            env.storage().persistent().remove(&DataKey::Share(work_id, from.clone()));
        } else {
            env.storage().persistent().set(&DataKey::Share(work_id, from.clone()), &new_from);
        }

        // Update receiver
        env.storage().persistent().set(&DataKey::Share(work_id, to.clone()), &new_to);

        // If receiver is new, increment creator count and add to list
        if existing_to == 0 {
            let mut creator_count: u32 = env
                .storage()
                .persistent()
                .get(&DataKey::CreatorList(work_id))
                .unwrap_or(0);
            env.storage().persistent().set(&DataKey::CreatorAt(work_id, creator_count), &to.clone());
            creator_count += 1;
            env.storage().persistent().set(&DataKey::CreatorList(work_id), &creator_count);
        }

        env.events().publish(
            (symbol_short!("transfer"), work_id),
            (from, to, amount),
        );
    }

    /// Get work metadata by ID.
    pub fn get_work(env: Env, id: u32) -> CoOwnedWork {
        env.storage()
            .persistent()
            .get(&DataKey::Work(id))
            .expect("Work not found")
    }

    /// Get a specific owner's share in a work (returns 0 if not an owner).
    pub fn get_share(env: Env, work_id: u32, owner: Address) -> u32 {
        env.storage()
            .persistent()
            .get(&DataKey::Share(work_id, owner))
            .unwrap_or(0)
    }

    /// Get the total number of co-owned works.
    pub fn get_work_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::WorkCount).unwrap_or(0)
    }
}

mod test;
