export const generateRandomNumber = (from: number, to: number) => {
  if (from > to) {
    throw new Error(`from cannot be bigger than to! from: ${from}, to: ${to}`)
  }
  return Math.floor(Math.random() * (to + 1)) + from
}
