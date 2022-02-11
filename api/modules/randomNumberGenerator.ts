import { ApiError } from '../utils/ApiError'

export const generateRandomNumber = (min: number, max: number) => {
  if (min > max) {
    throw new ApiError(`from cannot be bigger than to! from: ${min}, to: ${max}`, 400)
  }
  return Math.floor(Math.random() * (max - min + 1)) + min
}
