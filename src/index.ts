import CoinGeckoMill from '@open-oracle-origami/origami-js-mill-coingecko'

const mill = CoinGeckoMill({
    simplePriceParams: {
        ids: ['bitcoin'],
        vs_currencies: ['usd'],
    },
})

mill.start((id: string, data: any) => {
    console.log(data)
})

