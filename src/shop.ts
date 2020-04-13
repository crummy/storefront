import { get as getShopConfig } from "./shopConfig"
import { getRows, PRICES, FIELDS } from "./spreadsheetApi"
import { HttpError } from "./error"

export interface Shop {
  goods: Good[],
  fields: { string: any }
}

export interface Good {
  name: string,
  price: number,
  unit: string,
  comment: string
}

export const get = async (shopId: string): Promise<Shop | null> => {
  const config = await getShopConfig(shopId)
  if (!config) {
    throw new HttpError(`No shop found with ID ${shopId}`, 404)
  }

  const goodsPromise = getRows(config.spreadsheetId, PRICES)
  const fieldsPromise = getRows(config.spreadsheetId, FIELDS)
  const goods = (await goodsPromise)
    .filter((_, i) => i != 0) // skip first row - it contains headers
    .map(row => toGood(row))
  const fields = Object.fromEntries(await fieldsPromise)

  return {
    goods,
    fields
  }
}

const toGood = (row: Array<string | Number>): Good => {
  return {
    name: String(row[0]),
    price: Number(row[1]),
    unit: String(row[2]),
    comment: String(row[3])
  }
}