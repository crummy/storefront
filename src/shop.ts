import { get as getShopConfig } from "./shopConfig"
import { getShopRows, PRICES, FIELDS, SHIPPING } from "./spreadsheetApi"
import { HttpError } from "./error"

export interface Shop {
  goods: Good[],
  fields: { string: any },
  shippingCosts: ShippingCosts[],
  id: string
}

export interface Good {
  name: string,
  price: number,
  unit: string,
  comment?: string
}

export interface ShippingCosts {
  name: string,
  pricePerBox: number,
  kgPerBox: number
}

export const get = async (shopId: string): Promise<Shop | null> => {
  const config = await getShopConfig(shopId)
  if (!config) {
    throw new HttpError(`No shop found with ID ${shopId}`, 404)
  }

  // thank god for typescript
  const spreadsheet = await getShopRows(config.spreadsheetId)
  const goods = spreadsheet.valueRanges
    .find(valueRange => valueRange.range.startsWith(PRICES))
    ?.values
    ?.filter((_, i) => i != 0) // skip first row - it contains headers
    .map(row => toGood(row)) || []
  const fields = Object.fromEntries(
      spreadsheet.valueRanges
      .find(valueRange => valueRange.range.startsWith(FIELDS))?.values || []
    )
  const shippingCosts = spreadsheet.valueRanges
    .find(range => range.range.startsWith(SHIPPING))
    ?.values
    ?.filter((_, i) => i != 0) // skip first row - it contains headers
    .map(row => toShippingCosts(row)) || []

  return {
    id: shopId,
    goods,
    fields,
    shippingCosts
  }
}

const toGood = (row: Array<string | Number>): Good => {
  return {
    name: String(row[0]),
    price: Number(row[1]),
    unit: String(row[2]),
    comment: row[3] ? String(row[3]) : undefined
  }
}

const toShippingCosts = (row: Array<string | Number>): ShippingCosts => {
  return {
    name: String(row[0]),
    pricePerBox: Number(row[1]),
    kgPerBox: Number(row[2])
  }
}