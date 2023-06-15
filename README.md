![CI](https://github.com/hoodieshq/chainlink-neon/actions/workflows/ci.yml/badge.svg)

# Chainlink Data Feeds on Neon EVM

A smart contract making Chainlink Data Feeds from Solana network available on Neon EVM.

## Usage

Once deployed, the contract implements [`AggregatorV3Interface`](https://docs.chain.link/docs/price-feeds-api-reference/#aggregatorv3interface) according to the best practices of the Chainlink Data Feeds
usage. Follow the official Chainlink documentation to get the [latest](https://docs.chain.link/docs/get-the-latest-price/) or [historical](https://docs.chain.link/docs/historical-price-data/) prices from the data feeds.

## Development

```sh
  # Install external dependencies
  $ npm install

  # Test Utils library
  # To test the functions in the Utils library, use internal hardhat network as -
  $ npx hardhat test

  # Or use the network "neonlabs" as -
  $ npx hardhat test --network neondevnet

  # Deploy to Neon EVM Devnet.
  # Feed address is expected in 32 bytes hex (0x...)
  $ FEED_ADDRESS=<address> npx hardhat run scripts/deploy.js --network neondevnet

  # Fetch data from devnet, including feed meta, latest rounds and arbitrary
  # round.
  # Oracle contract address is expected in 20 bytes hex (0x...)
  # Round identifier as a plain unsigned integer
  $ ORACLE_ADDRESS=<address> ROUND=<round> node playground.js
```

## Deployment

1. Create a `.env` file with NEON_PROXY_URL("https://devnet.neonevm.org") and NEON_ACCOUNTS(Private key of your account).
2. Edit `hardhat.config.js` to set the Neon EVM network you want to deploy to. Neon EVM devnet is already available there as `neonlabs`.
3. Choose [Chainlink Data Feed address](https://docs.chain.link/docs/solana/data-feeds-solana/) on the corresponding Solana network from [devnet](https://docs.chain.link/docs/solana/data-feeds-solana/#Solana%20Devnet) or [mainnet](https://docs.chain.link/docs/solana/data-feeds-solana/#Solana%20Mainnet)
4. Convert the address from Solana format (base58 encoded) to 32 bytes hex. You can use [online CyberChef converter](<https://gchq.github.io/CyberChef/#recipe=From_Base58('123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz',true)To_Hex('None',0)>).
5. Deploy the contract using

```sh
FEED_ADDRESS=<address> npx hardhat run scripts/deploy.js --network <network>
```

## Contributing

Bug reports and pull requests are welcome on GitHub at https://github.com/sukanyaparashar/hardhat-chainlink-neon.

## License

The code is available as open source under the terms of the [MIT License](https://opensource.org/licenses/MIT).
