module dex::dex {
    use sui::coin::{Self, Coin, TreasuryCap};
    use sui::balance::{Self, Balance};
    use sui::math;
    use dex::token_a::TOKEN_A;
    use dex::token_b::TOKEN_B;
    use dex::lp_token::LP_TOKEN; 

    // Error codes
    const EInsufficientLiquidity: u64 = 1;
    const EInsufficientAmount: u64 = 2;
    const EInvalidAmount: u64 = 3;
    const ESlippageExceeded: u64 = 4;

    // LP Token struct - represents liquidity provider shares
    public struct DEX has drop {}

    public struct LiquidityPool has key {
        id: UID,
        token_a_balance: Balance<TOKEN_A>,
        token_b_balance: Balance<TOKEN_B>,
        lp_token_supply: u64,
        fee_rate: u64, // Fee rate in basis points (100% = 1)
    }

    public struct PoolCap has key, store {
        id: UID,
    }

    public struct LiquidityAdded has copy, drop {
        token_a_amount: u64,
        token_b_amount: u64,
        lp_tokens_minted: u64,
    }

    public struct LiquidityRemoved has copy, drop {
        token_a_amount: u64,
        token_b_amount: u64,
        lp_tokens_burned: u64,
    }

    public struct TokenSwapped has copy, drop {
        token_in_amount: u64,
        token_out_amount: u64,
        is_a_to_b: bool,
    }

    fun init(_witness: DEX, _ctx: &mut TxContext) {
        // DEX module doesn't need to create currency
        // LP_TOKEN currency is created in its own module
    }

    public entry fun create_pool(
        token_a: Coin<TOKEN_A>,
        token_b: Coin<TOKEN_B>,
        ctx: &mut TxContext
    ) {
        let token_a_amount = coin::value(&token_a);
        let token_b_amount = coin::value(&token_b);

        assert!(token_a_amount > 0 && token_b_amount > 0, EInvalidAmount);

        // Calculate initial LP tokens (geometric mean)
        let initial_lp_tokens = math::sqrt(token_a_amount * token_b_amount);
        let pool = LiquidityPool {
            id: object::new(ctx),
            token_a_balance: coin::into_balance(token_a),
            token_b_balance: coin::into_balance(token_b),
            lp_token_supply: initial_lp_tokens,
            fee_rate: 30,
        };

        transfer::share_object(pool);
    }

    // Add liquidity from the pool
    public fun add_liquidity(
        pool: &mut LiquidityPool,
        token_a: Coin<TOKEN_A>,
        token_b: Coin<TOKEN_B>,
        treasury_cap: &mut TreasuryCap<LP_TOKEN>,
        ctx: &mut TxContext
    ): Coin<LP_TOKEN> {
        let token_a_amount = coin::value(&token_a);
        let token_b_amount = coin::value(&token_b);

        assert!(token_a_amount > 0 && token_b_amount > 0, EInvalidAmount);
        
        let pool_a_balance = balance::value(&pool.token_a_balance);
        let pool_b_balance = balance::value(&pool.token_b_balance);

        let lp_tokens_to_mint = if (pool.lp_token_supply == 0) {
            math::sqrt(token_a_amount * token_b_amount)
        } else {
            let lp_from_a = (token_a_amount * pool.lp_token_supply) / pool_a_balance;
            let lp_from_b = (token_b_amount * pool.lp_token_supply) / pool_b_balance;
            math::min(lp_from_a, lp_from_b)
        };

        assert!(lp_tokens_to_mint > 0, EInsufficientLiquidity);

        // Add token to pool
        balance::join(&mut pool.token_a_balance, coin::into_balance(token_a));
        balance::join(&mut pool.token_b_balance, coin::into_balance(token_b));
        pool.lp_token_supply = pool.lp_token_supply + lp_tokens_to_mint;

        // Emit event
        sui::event::emit(LiquidityAdded {
            token_a_amount,
            token_b_amount,
            lp_tokens_minted: lp_tokens_to_mint,
        });

        coin::mint(treasury_cap, lp_tokens_to_mint, ctx)
    }

    // Remove liquidity from the pool
    public fun remove_liquidity(
        pool: &mut LiquidityPool,
        lp_tokens: Coin<LP_TOKEN>,
        treasury_cap: &mut TreasuryCap<LP_TOKEN>,
        ctx: &mut TxContext,
    ): (Coin<TOKEN_A>, Coin<TOKEN_B>) {
        let lp_amount = coin::value(&lp_tokens);
        assert!(lp_amount > 0,  EInvalidAmount);
        assert!(pool.lp_token_supply >= lp_amount, EInsufficientLiquidity);

        let pool_a_balance = balance::value(&pool.token_a_balance);
        let pool_b_balance = balance::value(&pool.token_b_balance);

        // Calculate tokens to return
        let token_a_amount = (lp_amount * pool_a_balance) / pool.lp_token_supply;
        let token_b_amount = (lp_amount * pool_b_balance) / pool.lp_token_supply;
        // Update pool
        pool.lp_token_supply = pool.lp_token_supply - lp_amount;
        // Burn LP tokens
        coin::burn(treasury_cap, lp_tokens);

        sui::event::emit(LiquidityRemoved {
            token_a_amount,
            token_b_amount,
            lp_tokens_burned: lp_amount,
        });

        // Return tokens
        let token_a_coin = coin::take(&mut pool.token_a_balance, token_a_amount, ctx);
        let token_b_coin = coin::take(&mut pool.token_b_balance, token_b_amount, ctx);

        (token_a_coin, token_b_coin)
    }

    // Swap Token A for token B
    public fun swap_a_to_b (
        pool: &mut LiquidityPool,
        token_a: Coin<TOKEN_A>,
        min_token_b_out: u64,
        ctx: &mut TxContext,
    ): Coin<TOKEN_B> {
        let token_a_amount = coin::value(&token_a);
        assert!(token_a_amount > 0, EInvalidAmount);

        let pool_a_balance = balance::value(&pool.token_a_balance);
        let pool_b_balance = balance::value(&pool.token_b_balance);
        // Calculate output using constant product formula with fee
        let token_a_amount_with_fee = token_a_amount * (10000 - pool.fee_rate);
        let numerator = token_a_amount_with_fee * pool_b_balance;
        let denominator = pool_a_balance * 10000 + token_a_amount_with_fee;
        let token_b_amount = numerator / denominator;

        assert!(token_b_amount >= min_token_b_out, ESlippageExceeded);
        assert!(token_b_amount < pool_b_balance, EInsufficientLiquidity);

        // Update pool balance
        balance::join(&mut pool.token_a_balance, coin::into_balance(token_a));
        // Emit event
        sui::event::emit(TokenSwapped {
            token_in_amount: token_a_amount,
            token_out_amount: token_b_amount,
            is_a_to_b: true
        });

        coin::take(&mut pool.token_b_balance, token_b_amount, ctx)
    }

    public fun swap_b_to_a(
        pool: &mut LiquidityPool,
        token_b: Coin<TOKEN_B>,
        min_token_a_out: u64,
        ctx: &mut TxContext
    ): Coin<TOKEN_A> {
        let token_b_amount = coin::value(&token_b);
        assert!(token_b_amount > 0, EInvalidAmount);

        let pool_a_balance = balance::value(&pool.token_a_balance);
        let pool_b_balance = balance::value(&pool.token_b_balance);

        // Calculate output using constant product formula with fee
        let token_b_amount_with_fee = token_b_amount * (10000 - pool.fee_rate);
        let numerator = token_b_amount_with_fee * pool_a_balance;
        let denominator = pool_b_balance * 10000 + token_b_amount_with_fee;
        let token_a_amount = numerator / denominator;

        assert!(token_a_amount >= min_token_a_out, ESlippageExceeded);
        assert!(token_a_amount < pool_a_balance, EInsufficientLiquidity);

        // Update pool balances
        balance::join(&mut pool.token_b_balance, coin::into_balance(token_b));
        
        // Emit event
        sui::event::emit(TokenSwapped {
            token_in_amount: token_b_amount,
            token_out_amount: token_a_amount,
            is_a_to_b: false,
        });

        // Return Token A
        coin::take(&mut pool.token_a_balance, token_a_amount, ctx)
    }

    public fun get_reserves(pool: &LiquidityPool): (u64, u64) {
        (balance::value(&pool.token_a_balance), balance::value(&pool.token_b_balance))
    }

    public fun get_lp_supply(pool: &LiquidityPool): u64 {
        pool.lp_token_supply
    }

    // Calculate swap output amount
    public fun calculate_swap_output(
        pool: &LiquidityPool,
        input_amount: u64,
        is_a_to_b: bool
    ): u64 {
        let (pool_a_balance, pool_b_balance) = get_reserves(pool);

        if (is_a_to_b) {
            let input_amount_with_fee = input_amount * (10000 - pool.fee_rate);
            let numerator = input_amount_with_fee * pool_b_balance;
            let denominator = pool_a_balance * 10000 + input_amount_with_fee;
            numerator / denominator
        } else {
            let input_amount_with_fee = input_amount * (10000 - pool.fee_rate);
            let numerator = input_amount_with_fee * pool_a_balance;
            let denominator = pool_b_balance * 1000 + input_amount_with_fee;
            numerator / denominator
        }
    }
}