#![cfg(test)]

use super::*;
use soroban_sdk::{testutils::Address as _, vec, Address, BytesN, Env, String};

#[test]
fn test_register_and_get_shares() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CoOwnershipContract, ());
    let client = CoOwnershipContractClient::new(&env, &contract_id);

    let creator_a = Address::generate(&env);
    let creator_b = Address::generate(&env);

    let creators = vec![&env, creator_a.clone(), creator_b.clone()];
    let shares = vec![&env, 6000u32, 4000u32]; // 60% / 40%
    let file_hash = BytesN::from_array(&env, &[10u8; 32]);
    let title = String::from_str(&env, "Collaborative Album");

    let id = client.register_work(&creators, &shares, &file_hash, &title);
    assert_eq!(id, 1);

    // Verify shares
    assert_eq!(client.get_share(&1, &creator_a), 6000);
    assert_eq!(client.get_share(&1, &creator_b), 4000);

    // Verify work metadata
    let work = client.get_work(&1);
    assert_eq!(work.total_shares, 10000);
    assert_eq!(work.creator_count, 2);
}

#[test]
fn test_transfer_partial_share() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CoOwnershipContract, ());
    let client = CoOwnershipContractClient::new(&env, &contract_id);

    let creator_a = Address::generate(&env);
    let creator_b = Address::generate(&env);
    let new_owner = Address::generate(&env);

    let creators = vec![&env, creator_a.clone(), creator_b.clone()];
    let shares = vec![&env, 7000u32, 3000u32];
    let file_hash = BytesN::from_array(&env, &[20u8; 32]);
    let title = String::from_str(&env, "Joint Paper");

    client.register_work(&creators, &shares, &file_hash, &title);

    // Transfer 2500 bps (25%) from A to new_owner
    client.transfer_share(&1, &creator_a, &new_owner, &2500);

    assert_eq!(client.get_share(&1, &creator_a), 4500);
    assert_eq!(client.get_share(&1, &new_owner), 2500);
    assert_eq!(client.get_share(&1, &creator_b), 3000); // unchanged
}

#[test]
#[should_panic(expected = "Shares must sum to exactly 10000")]
fn test_invalid_shares_sum() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CoOwnershipContract, ());
    let client = CoOwnershipContractClient::new(&env, &contract_id);

    let creator_a = Address::generate(&env);
    let creator_b = Address::generate(&env);

    let creators = vec![&env, creator_a, creator_b];
    let shares = vec![&env, 5000u32, 3000u32]; // Only 80%, not 100%
    let file_hash = BytesN::from_array(&env, &[30u8; 32]);
    let title = String::from_str(&env, "Bad Split");

    client.register_work(&creators, &shares, &file_hash, &title);
}

#[test]
#[should_panic(expected = "Insufficient share balance")]
fn test_transfer_exceeds_balance() {
    let env = Env::default();
    env.mock_all_auths();

    let contract_id = env.register(CoOwnershipContract, ());
    let client = CoOwnershipContractClient::new(&env, &contract_id);

    let creator_a = Address::generate(&env);
    let creator_b = Address::generate(&env);

    let creators = vec![&env, creator_a.clone(), creator_b.clone()];
    let shares = vec![&env, 6000u32, 4000u32];
    let file_hash = BytesN::from_array(&env, &[40u8; 32]);
    let title = String::from_str(&env, "Over Transfer");

    client.register_work(&creators, &shares, &file_hash, &title);

    // Try to transfer more than owned
    client.transfer_share(&1, &creator_a, &creator_b, &9000);
}
