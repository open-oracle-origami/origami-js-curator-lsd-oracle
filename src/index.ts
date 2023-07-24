import CoinbaseMill from '@open-oracle-origami/origami-js-mill-coinbase'
import CoinGeckoMill from '@open-oracle-origami/origami-js-mill-coingecko'
import { Curator } from '@open-oracle-origami/origami-js-sdk'

const cgMillConfig = {
  simplePriceParams: {
    ids: ['coinbase-wrapped-staked-eth'],
    vs_currencies: ['usd'],
  },
}

const cbMillConfig = {
  productIds: ['CBETH-USD'],
}

// const cgMill = CoinGeckoMill()

const curator = Curator.create({ id: 'lsd-oracle' })
curator.plan(CoinGeckoMill, cgMillConfig).plan(CoinbaseMill, cbMillConfig)
void curator.start()

curator.emitter.subscribe('mill.coingecko', (topic, data) => {
  console.log(data)
})

curator.emitter.subscribe('mill.coinbase', (topic, data) => {
  console.log(data)
})
