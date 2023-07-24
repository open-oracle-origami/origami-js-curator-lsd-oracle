import { Curator } from '@open-oracle-origami/origami-js-sdk'
import CoinbaseMill from '@open-oracle-origami/origami-js-mill-coinbase'
import CoinGeckoMill from '@open-oracle-origami/origami-js-mill-coingecko'

const cgMillConfig = {
  simplePriceParams: {
    ids: ['coinbase-wrapped-staked-eth'],
    vs_currencies: ['usd'],
  },
}

const cbMillConfig = {
  productIds: ['CBETH-USD'],
}

export const planMills = (curator: Curator) =>
  curator.plan(CoinGeckoMill, cgMillConfig).plan(CoinbaseMill, cbMillConfig)
