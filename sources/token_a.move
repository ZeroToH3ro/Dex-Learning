module dex::token_a {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::url::{Self, Url};
    use std::address;

    // The type identifier of coin. The coin will have a type
    // tag of kind: `Coin<package_object::mycoin::MYCOIN>`
    public struct TOKEN_A has drop {}

    fun init(witness: TOKEN_A, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<TOKEN_A>(
            witness,
            9,
            b"TOKENA", 
            b"Token A",
            b"A sample token for DEX",
            option::some<Url>(url::new_unsafe_from_bytes(b"https://example.com/token-a.png")),
            ctx
        );

        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    // Manager can mint new coins
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<TOKEN_A>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }


    //  Manager can urn coins
    public entry fun burn(treasury_cap: &mut TreasuryCap<TOKEN_A>, coin: Coin<TOKEN_A>) {
        coin::burn(treasury_cap, coin);
    }

    public fun mint_for_testing(
        treasury_cap: &mut TreasuryCap<TOKEN_A>,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<TOKEN_A> {
        coin::mint(treasury_cap, amount, ctx)
    }
}
