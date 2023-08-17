import {
  Curator,
  Museum,
  Origami,
  IResource,
} from '@open-oracle-origami/origami-js-sdk'
import { SmartContract, ThirdwebSDK } from '@thirdweb-dev/sdk'
import { TenetTestnet } from '@thirdweb-dev/chains'
import { BigNumber } from 'ethers'

interface ISdkContract {
  address: string
  contract: SmartContract
}

type CurateConfig = {
  id: string
}

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
        processing: false,
      },
      {
        id: 'steth-usd',
        address: '0xE486c070b54B09F38b3D5080765991226498e708',
        processing: false,
      },
    ],
  },
]

const sdk = ThirdwebSDK.fromPrivateKey(
  `${process.env.TENET_TESTNET_PRIVATE_KEY}`.trim(),
  TenetTestnet,
  {
    secretKey: `${process.env.THIRDWEB_SECRET_KEY}`,
  }
)

const sdkContracts: ISdkContract[] = []

// TODO: Implement a call to fetch from blockchain
const fetchLastCertifiedOrigami = async (collectionContract: ISdkContract) => {
  return collectionContract.contract.call('latestRoundData')
}

const getMuseumConfig = (config: CurateConfig) => {
  const museumConfig = museumCollectionConfigs.find(x => x.id === config.id)
  if (!museumConfig) throw new Error('Museum config not found')

  return museumConfig
}

const getMuseumCollectionConfig = (
  museumConfig: {
    id?: string
    abi?: Promise<any>
    deviation?: number
    threshold?: number
    collections: any
  },
  collection: string
) => {
  if (!museumConfig.collections) {
    throw new Error('No collections found in the museum configuration')
  }

  const museumCollectionConfig = museumConfig.collections.find(
    (x: { id: string }) => x.id === collection.toLowerCase()
  )

  if (!museumCollectionConfig) {
    throw new Error(`Collection config for collection: ${collection} not found`)
  }

  // eslint-disable-next-line @typescript-eslint/no-unsafe-return
  return museumCollectionConfig
}

const getSdkContract = async ({
  contractAddress,
  abi,
}: {
  contractAddress: string
  abi: any
}) => {
  let collectionContract = sdkContracts.find(c => c.address === contractAddress)

  if (collectionContract) return collectionContract

  const abiDefinition = (await abi).abi

  collectionContract = {
    address: contractAddress,
    contract: await sdk.getContract(contractAddress, abiDefinition),
  }

  sdkContracts.push(collectionContract)

  return collectionContract
}

const isProcessing = museumCollectionConfig =>
  !!museumCollectionConfig.processing
const setProcessingFalse = museumCollectionConfig =>
  (museumCollectionConfig.processing = false)
const setProcessingTrue = museumCollectionConfig =>
  (museumCollectionConfig.processing = true)

// Just return true or false and let the museum decide to continue
export const certify = async (
  origami: Origami,
  resource: IResource
): Promise<boolean> => {
  const currentTimestamp = new Date()
  const { collection } = origami

  const balance = await sdk.wallet.balance()

  if (parseFloat(balance.displayValue) <= 0.01) {
    console.log(`Insufficient balance ${balance.displayValue}`)
    return false
  }

  const config = resource.config as CurateConfig

  const museumConfig = getMuseumConfig(config)

  const museumCollectionConfig = getMuseumCollectionConfig(
    museumConfig,
    collection
  )

  const collectionContract = await getSdkContract({
    abi: museumConfig?.abi,
    contractAddress: museumCollectionConfig.address.toString(),
  })

  // We prevent situations where blockchain interaction take time
  // We do not want a race condition
  if (isProcessing) return false

  setProcessingTrue(museumCollectionConfig)

  const lastOrigami = await fetchLastCertifiedOrigami(collectionContract)

  const lastOrigamiTimestamp = lastOrigami?.updatedAt
    ? new Date(Number(`${lastOrigami?.updatedAt}`) * 1000)
    : null

  // If there's no previous origami, it is certified.
  if (!lastOrigamiTimestamp) return true

  // Calculate time difference in hours
  const timeDiff =
    (currentTimestamp.getTime() - lastOrigamiTimestamp.getTime()) /
    (1000 * 60 * 60)

  // Certify if the last origami is more than 1 hour old
  if (timeDiff >= 1) return true

  console.log(
    `Did not certify origami... ${(1 - timeDiff).toFixed(4)} hours remaining`
  )

  setProcessingFalse(museumCollectionConfig)
  return false
}

const curate = async (origami: Origami, resource: IResource): Promise<void> => {
  // Collection is usually something like 'cbeth-usd' and data is the price as an INT
  const { collection, data } = origami

  const config = resource.config as CurateConfig

  const museumConfig = getMuseumConfig(config)

  const museumCollectionConfig = getMuseumCollectionConfig(
    museumConfig,
    collection
  )

  const collectionContract = await getSdkContract({
    abi: museumConfig?.abi,
    contractAddress: museumCollectionConfig.address.toString(),
  })

  // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
  const tx = await collectionContract.contract.call('curate', [
    BigNumber.from(data),
  ])

  console.log({ tx })

  console.log(
    `Origami has been pushed to the blockchain, transaction hash: ${tx?.receipt?.transactionHash}`
  )

  setProcessingFalse(museumCollectionConfig)
}

export const planMuseums = (curator: Curator) => {
  museumCollectionConfigs.forEach(config => {
    curator.plan(Museum, { config, id: config.id, certify, curate })
  })
}
