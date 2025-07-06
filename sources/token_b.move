module dex::token_b {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::url::{Self, Url};
    use std::address;

    // The type identifier of coin. The coin will have a type
    // tag of kind: `Coin<package_object::mycoin::MYCOIN>`
    public struct TOKEN_B has drop {}

    fun init(witness: TOKEN_B, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<TOKEN_B>(
            witness,
            9,
            b"TOKENB", 
            b"Token B",
            b"A sample token for DEX",
            option::some<Url>(url::new_unsafe_from_bytes(b"https://example.com/token-b.png")),
            ctx
        );

        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }

    // Manager can mint new coins
    public entry fun mint(
        treasury_cap: &mut TreasuryCap<TOKEN_B>,
        amount: u64,
        recipient: address,
        ctx: &mut TxContext
    ) {
        coin::mint_and_transfer(treasury_cap, amount, recipient, ctx);
    }


    //  Manager can urn coins
    public entry fun burn(treasury_cap: &mut TreasuryCap<TOKEN_B>, coin: Coin<TOKEN_B>) {
        coin::burn(treasury_cap, coin);
    }

    public fun mint_for_testing(
        treasury_cap: &mut TreasuryCap<TOKEN_B>,
        amount: u64,
        ctx: &mut TxContext
    ): Coin<TOKEN_B> {
        coin::mint(treasury_cap, amount, ctx)
    }
}
