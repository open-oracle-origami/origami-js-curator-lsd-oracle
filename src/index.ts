import { Curator } from '@open-oracle-origami/origami-js-sdk'

import { planMills } from './mills'
import { planWorkshop } from './workshop'
import { planMuseums } from './museums'

const curator = Curator.create({ id: 'lsd-oracle' })

// curator.emitter.subscribe('mill.coingecko', (topic, data) => {
//   console.log(data)
// })

// curator.emitter.subscribe('mill.coinbase', (topic, data) => {
// console.log(data)
// })

// curator.emitter.subscribe('workshop.lsd', (topic, data) => {
//   console.log(data)
// })

planMills(curator)
planWorkshop(curator)
planMuseums(curator)

void curator.start()
