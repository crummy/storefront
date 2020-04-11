import { get as getShopConfig } from "./shopConfig"
import { getRows } from "./spreadsheetApi"

const PRICES = "Prices"
const FIELDS = "Customization"

export interface Shop {
  goods: Array<Good>,
  fields: Record<string, any>
}

export interface Good {
  name: string,
  price: number,
  unit: string,
  comment: string
}

export const get = async (shopId: string): Promise<Shop|null> => {
  const config = await getShopConfig(shopId)
  if (!config) {
    throw Error(`No shop found with ID ${shopId}`)
  }

  const goodsPromise = getRows(config.spreadsheetId, PRICES)
  const fieldsPromise = getRows(config.spreadsheetId, FIELDS)
  const goods = (await goodsPromise)
    .filter((_, i) => i != 0) // skip first row - it contains headers
    .map(row => toGood(row))
  const fields = (await fieldsPromise)
    .map(row => [row[0], row[1] as [string, any]])

  return {
    goods,
    fields
  }
}

const toGood = (row: Array<any>): Good =>  {
  return {
    name: row[0],
    price: Number(row[1]),
    unit: row[2],
    comment: row[3]
  }
}