import Curator from '../src/Curator'

describe('curator', () => {
  it('Basic test', () => {
    const result = new Curator({ id: 'test' })

    expect(result).toBeInstanceOf(Curator)
  })
})
