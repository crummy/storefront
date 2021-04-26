import fetch from 'node-fetch'
import { Response } from 'node-fetch'
import { PlacedOrder, Address } from './order'
import { OrderedGood } from './checkout'
import { HttpError } from './error'
import { GoogleSpreadsheet } from 'google-spreadsheet'

const apiBaseUrl = "https://sheets.googleapis.com/v4/spreadsheets"
const websiteBaseUrl = process.env.WEBSITE_BASE_URL!
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
  const url = `${apiBaseUrl}/${id}/values:batchGet?ranges=${PRICES}!A1:Z${maxRows}&ranges=${FIELDS}!A1:Z${maxRows}&ranges=${SHIPPING}!A1:Z${maxRows}&valueRenderOption=UNFORMATTED_VALUE&key=${apiKey}`
  return fetch(url)
    .then(checkStatus)
    .then(response => response.json())
}

export const addOrderRow = async (id: string, order: PlacedOrder): Promise<any> => {
  const doc = new GoogleSpreadsheet(id)
  await doc.useServiceAccountAuth({
    client_email: process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL,
    private_key: process.env.GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  })
  await doc.loadInfo();
  const sheet = doc.sheetsByIndex.find((sheet: any) => sheet.title == ORDERS)
  return sheet.addRow([
    `=HYPERLINK("${websiteBaseUrl}/${order.shopId}/order/${order.id}", "${order.id}")`,
    order.created.toISOString().replace("T", " ").replace("Z", " "),
    order.email,
    order.name,
    addressToString(order.address),
    goodsToString(order.goods),
    order.goods.map(good => good.price * good.quantity).reduce((a, b) => a + b, 0),
    order.shipping,
    order.phoneNumber,
    order.note
  ]
  )
}

export const PRICES = "Prices"
export const FIELDS = "Customization"
export const SHIPPING = "Shipping"
export const ORDERS = "Orders"

// TODO - can these be attached to the interface itself? extension methods?
const addressToString = (address: Address): string => {
  return `${address.line1}, ${address.line2}, ${address.city}, ${address.state}, ${address.postal_code}`
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