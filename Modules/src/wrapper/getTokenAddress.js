const tokenAddressMapping = {
  'BAT': '0x0d8775f648430679a709e98d2b0cb6250d2887ef',
  'DGX': '0x4f3afec4e5a3f2a6a1a411def7d7dfe50ee057bf',
  'REP': '0x1985365e9f78359a9B6AD760e32412f4a445E862',
  'ZRX': '0xE41d2489571d322189246DaFA5ebDe1F4699F498',
  'WETH': '0xC02aaA39b223FE8D0A0e5C4F27eAD9083C756Cc2',
  'MLN': '0xec67005c4E498Ec7f55E092bd1d35cbC47C91892',
  'MKR': '0x9f8F72aA9304c8B593d555F12eF6589cC3A579A2',
  'DAI': '0x6b175474e89094c44da98b954eedeac495271d0f',
  'KNC': '0xdd974d5c2e2928dea5f71b9825b8b646686bd200',
}

const getTokenAddress = (symbol) => tokenAddressMapping[symbol]

module.exports = getTokenAddress;
