module dex::lp_token {
    use sui::coin::{Self, TreasuryCap};

    /// One-time witness for LP token
    public struct LP_TOKEN has drop {}

    /// Initialize LP token currency
    fun init(witness: LP_TOKEN, ctx: &mut TxContext) {
        let (treasury_cap, metadata) = coin::create_currency<LP_TOKEN>(
            witness,
            9,
            b"LP",
            b"Liquidity Provider Token",
            b"LP token for DEX",
            option::none(),
            ctx
        );
        
        transfer::public_freeze_object(metadata);
        transfer::public_transfer(treasury_cap, tx_context::sender(ctx));
    }
}