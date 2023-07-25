import {
  Curator,
  Museum,
  Origami,
  utils,
} from '@open-oracle-origami/origami-js-sdk'

// TODO: this becomes it's own evm library or maybe it's an evm price aggregate library...
// TODO: build threshold and deviation helpers
// TODO: load from toml config
const museumCollectionConfig = [
  {
    id: 'tenet-testnet', // required
    abi: [], // this can default to origami-solidity if not passed
    seedPhrase: 'hello world', // required unless privateKey
    privateKey: '0x0000000', // required unless seedPhrase
    deviation: 0,
    threshold: 0,
    collections: [
      {
        id: 'CBETH-USD',
        address: 0x0000000000,
      },
      {
        id: 'STETH-USD',
        address: 0x0000000000,
      },
      // ...etc
    ],
  },
]

// TODO: we can figure out what the lastCuration was per collection by loading this from blockchain
const lastCuration = 0

// Just return true or false and let the museum decide to continue
const certify = () => utils.now() - lastCuration >= 60

const curate = (origami: Origami) => {
  const { collection, data } = origami
  // TODO: post this/monitor to the blockchain
}

export const planMuseums = (curator: Curator) => {
  museumCollectionConfig.forEach(config => {
    curator.plan(Museum, { id: config.id, certify, curate })
  })
}
