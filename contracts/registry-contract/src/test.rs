#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, Address, BytesN, Env, String};

#[test]
fn test_register_and_verify() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RegistryContract, ());
    let client = RegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let creator = Address::generate(&env);
    let file_hash = BytesN::from_array(&env, &[1u8; 32]);
    let title = String::from_str(&env, "My Original Song");
    let description = String::from_str(&env, "A song I composed");

    // Register a work
    let id = client.register(&creator, &file_hash, &title, &description);
    assert_eq!(id, 1);

    // Verify the hash exists
    let record = client.verify(&file_hash);
    assert_eq!(record.id, 1);
    assert_eq!(record.creator, creator);
    assert_eq!(record.title, title);

    // Count should be 1
    assert_eq!(client.get_count(), 1);
}

#[test]
fn test_get_record_by_id() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RegistryContract, ());
    let client = RegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let creator = Address::generate(&env);
    let file_hash = BytesN::from_array(&env, &[2u8; 32]);
    let title = String::from_str(&env, "Code Module v1");
    let description = String::from_str(&env, "Rust utility library");

    let id = client.register(&creator, &file_hash, &title, &description);
    let record = client.get_record(&id);

    assert_eq!(record.title, title);
    assert_eq!(record.description, description);
}

#[test]
#[should_panic(expected = "This file hash has already been registered")]
fn test_duplicate_hash_rejected() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RegistryContract, ());
    let client = RegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let creator = Address::generate(&env);
    let file_hash = BytesN::from_array(&env, &[3u8; 32]);
    let title = String::from_str(&env, "Duplicate Test");
    let description = String::from_str(&env, "Testing duplicates");

    client.register(&creator, &file_hash, &title, &description);
    // Second registration with same hash should panic
    client.register(&creator, &file_hash, &title, &description);
}

#[test]
#[should_panic(expected = "File hash not found in registry")]
fn test_verify_unregistered_hash() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(RegistryContract, ());
    let client = RegistryContractClient::new(&env, &contract_id);

    let admin = Address::generate(&env);
    client.initialize(&admin);

    let unknown_hash = BytesN::from_array(&env, &[99u8; 32]);
    // Should panic because hash doesn't exist
    client.verify(&unknown_hash);
}
