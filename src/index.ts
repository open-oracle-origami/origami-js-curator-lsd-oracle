import { Curator } from '@open-oracle-origami/origami-js-sdk'

import { planMills } from './mills'
import { planWorkshop } from './workshop'

const curator = Curator.create({ id: 'lsd-oracle' })

curator.emitter.subscribe('mill.coingecko', (topic, data) => {
  console.log(data)
})

curator.emitter.subscribe('mill.coinbase', (topic, data) => {
  console.log(data)
})

curator.emitter.subscribe('workshop.lsd', (topic, data) => {
  console.log(data)
})

planMills(curator)
planWorkshop(curator)

void curator.start()
