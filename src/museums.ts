import { Curator, Museum, Origami } from '@open-oracle-origami/origami-js-sdk'
import { ThirdwebSDK } from '@thirdweb-dev/sdk'
import { TenetTestnet } from '@thirdweb-dev/chains'

// TODO: this becomes it's own evm library or maybe it's an evm price aggregate library...
// TODO: build threshold and deviation helpers
// TODO: load from toml config
const museumCollectionConfigs = [
  {
    id: 'tenet-testnet', // required
    abi: fetch(
      'https://raw.githubusercontent.com/open-oracle-origami/origami-solidity/main/abi/CollectionImplV1.json'
    ).then(response => response.json()),
    deviation: 0,
    threshold: 0,
    collections: [
      {
        id: 'cbeth-usd',
        address: '0xF89dDeF302dFaD1Dd108D6C15c9Aa29a776bB89a',
      },
      {
        id: 'steth-usd',
        address: '0xE486c070b54B09F38b3D5080765991226498e708',
      },
    ],
  },
]

const sdk = ThirdwebSDK.fromPrivateKey(
  `${process.env.TENET_TESTNET_PRIVATE_KEY}`,
  TenetTestnet
)

// TODO: Implement a call to fetch from blockchain
const fetchLastCertifiedOrigami = async () => {
  return Promise.resolve({} as Origami)
}

// Just return true or false and let the museum decide to continue
export const certify = async (origami: Origami): Promise<boolean> => {
  const currentTimestamp = Date.now()
  const lastOrigami: Origami | null = await fetchLastCertifiedOrigami()

  // If there's no previous origami, it is certified.
  if (!lastOrigami) return true

  // Calculate time difference in hours
  const timeDiff = (currentTimestamp - origami.timestamp) / (1000 * 60 * 60)

  // Certify if origami is 1 hour newer than the last certified one
  if (timeDiff <= 1) return true

  return false
}

const curate = async (origami: Origami) => {
  // Collection is usually something like 'cbeth-usd' and data is the price as an INT
  const { collection, data } = origami

  // TODO: This should be dynamic based on the curate context
  const museumConfig = museumCollectionConfigs.find(
    x => x.id === 'tenet-testnet'
  )

  if (!museumConfig) throw new Error('Museum config not found')

  const museumCollectionConfig = museumConfig.collections.find(
    x => x.id === collection.toLowerCase()
  )

  if (!museumCollectionConfig) throw new Error('Collection config not found')

  const collectionContract = await sdk.getContract(
    museumCollectionConfig.address.toString(),
    (await museumConfig.abi) ?? undefined
  )
  const tx = await collectionContract.curate(data)

  console.log(
    `Origami has been pushed to the blockchain, transaction hash: ${tx.hash}`
  )
}

export const planMuseums = (curator: Curator) => {
  museumCollectionConfigs.forEach(config => {
    // TODO: pass museumCollectionConfig to the Museum instance so we can access it in the certify and curate functions
    curator.plan(Museum, { config, id: config.id, certify, curate })
  })
}
