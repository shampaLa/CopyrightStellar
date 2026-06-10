#![no_std]
use soroban_sdk::{contract, contractimpl, contracttype, symbol_short, Address, BytesN, Env, String, Vec};

/// A single registered work — stores the creator, file hash, title, description, and timestamp.
#[derive(Clone)]
#[contracttype]
pub struct Registration {
    pub id: u32,
    pub creator: Address,
    pub file_hash: BytesN<32>,
    pub title: String,
    pub description: String,
    pub timestamp: u64,
}

/// Storage keys for the contract.
#[contracttype]
pub enum DataKey {
    Admin,
    RegistryCount,
    Record(u32),
    HashExists(BytesN<32>),
}

#[contract]
pub struct RegistryContract;

#[contractimpl]
impl RegistryContract {
    /// One-time initialization — sets the admin address.
    pub fn initialize(env: Env, admin: Address) {
        if env.storage().instance().has(&DataKey::Admin) {
            panic!("Already initialized");
        }
        env.storage().instance().set(&DataKey::Admin, &admin);
        env.storage().instance().set(&DataKey::RegistryCount, &0u32);
    }

    /// Register a new work.
    /// The creator hashes a file locally (SHA-256) and submits the 32-byte hash here.
    /// Returns the registration ID.
    pub fn register(
        env: Env,
        creator: Address,
        file_hash: BytesN<32>,
        title: String,
        description: String,
    ) -> u32 {
        creator.require_auth();

        // Prevent duplicate registration of the same hash
        if env.storage().persistent().has(&DataKey::HashExists(file_hash.clone())) {
            panic!("This file hash has already been registered");
        }

        let mut count: u32 = env.storage().instance().get(&DataKey::RegistryCount).unwrap_or(0);
        count += 1;

        let registration = Registration {
            id: count,
            creator: creator.clone(),
            file_hash: file_hash.clone(),
            title,
            description,
            timestamp: env.ledger().timestamp(),
        };

        env.storage().persistent().set(&DataKey::Record(count), &registration);
        env.storage().persistent().set(&DataKey::HashExists(file_hash.clone()), &count);
        env.storage().instance().set(&DataKey::RegistryCount, &count);

        env.events().publish(
            (symbol_short!("register"), count),
            (creator, file_hash),
        );

        count
    }

    /// Verify if a file hash exists in the registry.
    /// Returns the Registration if found, or panics with an error.
    pub fn verify(env: Env, file_hash: BytesN<32>) -> Registration {
        let id: u32 = env
            .storage()
            .persistent()
            .get(&DataKey::HashExists(file_hash))
            .expect("File hash not found in registry");

        env.storage()
            .persistent()
            .get(&DataKey::Record(id))
            .expect("Registration record not found")
    }

    /// Get a registration by its ID.
    pub fn get_record(env: Env, id: u32) -> Registration {
        env.storage()
            .persistent()
            .get(&DataKey::Record(id))
            .expect("Registration not found")
    }

    /// Get the total number of registrations.
    pub fn get_count(env: Env) -> u32 {
        env.storage().instance().get(&DataKey::RegistryCount).unwrap_or(0)
    }
}

mod test;
