import {
  Curator,
  Workshop,
  IWorkshop,
  Paper,
} from '@open-oracle-origami/origami-js-sdk'

const crease = (paper: Paper): Paper => {
  const nextPaper: Paper = { ...paper }

  if (paper.mill === 'mill.coingecko') {
    if (paper.sku === 'coinbase-wrapped-staked-eth') {
      nextPaper.sku = 'CBETH-USD'
    }

    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    nextPaper.data = { usd: nextPaper.data.usd * 10 ** 8 }
  } else if (paper.mill === 'mill.coinbase') {
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    nextPaper.data = { usd: nextPaper.data.price * 10 ** 8 }
  }

  return nextPaper
}

const assemble = (paper: Paper, w: IWorkshop): void => {
  const stack = w.stack.filter(p => p.sku === paper.sku) // Find all papers with the same SKU
  const cgPaper = stack.find(p => p.mill === 'mill.coingecko') // Find the CoinGecko paper from stack
  const cbPaper = stack.find(p => p.mill === 'mill.coinbase') // Find the Coinbase paper from stack
  const assembly = [cgPaper, cbPaper].filter(p => p !== undefined) as Paper[] // Filter out undefined papers from assembly
  // eslint-disable-next-line @typescript-eslint/no-unsafe-return,@typescript-eslint/no-unsafe-member-access
  const sum = assembly.reduce((acc, p) => acc + p.data.usd, 0) // Sum the USD values of the assembly
  const data = sum / assembly.length // Average the USD values of the assembly

  w.fold(paper.sku, assembly, data) // Fold the assembly into Origami
}

const workshopConfig = {
  id: 'lsd',
  crease,
  assemble,
}

export const planWorkshop = (curator: Curator) =>
  curator.plan(Workshop, workshopConfig)
