import fetch from 'node-fetch'
import { Response } from 'node-fetch'
import { PlacedOrder, Address } from './order'
import { OrderedGood } from './checkout'
import { HttpError } from './error'

const baseUrl = "https://sheets.googleapis.com/v4/spreadsheets"
const maxRows = 1024
const apiKey = process.env.GOOGLE_API_KEY

export interface Spreadsheet {
  spreadsheetId: string,
  valueRanges: ValueRange[]
}

interface ValueRange {
  range: string,
  majorDimension: string,
  values: Array<Array<string | Number>>
}

export const getShopRows = (id: string): Promise<Spreadsheet> => {
  const url = `${baseUrl}/${id}/values:batchGet?ranges=${PRICES}!A1:Z${maxRows}&ranges=${FIELDS}!A1:Z${maxRows}&ranges=${SHIPPING}!A1:Z${maxRows}&valueRenderOption=UNFORMATTED_VALUE&key=${apiKey}`
  return fetch(url)
    .then(checkStatus)
    .then(response => response.json())
}

export const addOrderRow = (id: string, order: PlacedOrder): Promise<any> => {
  const body: ValueRange = {
    range: `${ORDERS}!A1:E1`,
    majorDimension: "ROWS",
    values: [
      [
        order.id,
        order.created.toISOString(),
        order.email,
        order.name,
        addressToString(order.address),
        goodsToString(order.goods),
        order.state
      ]
    ]
  }
  const url = `${baseUrl}/${id}/values/${body.range}:append?valueInputOption=USER_ENTERED&key=${apiKey}`
  return fetch(url,
    {
      method: 'POST',
      body: JSON.stringify(body),
      headers: { 'Content-Type': 'application/json' }
    }).then(checkStatus)
}

export const PRICES = "Prices"
export const FIELDS = "Customization"
export const SHIPPING = "Shipping"
export const ORDERS = "Orders"

// TODO - can these be attached to the interface itself? extension methods?
const addressToString = (address: Address): string => {
  return `${address.line1}, ${address.line2}, ${address.city}, ${address.state}`
}

const goodsToString = (goods: OrderedGood[]): string => {
  return goods.map(good => `${good.quantity}${good.unit} ${good.name}`).join(', ')
}

const checkStatus = async (response: Response) => {
  if (response.ok) {
    return response
  } else {
    console.log(await response.json())
    throw new HttpError(`An unexpected error occurred`, 500)
  }
}