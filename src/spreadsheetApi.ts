import fetch from 'node-fetch'

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
    .then(response => response.json())
}

export const PRICES = "Prices"
export const FIELDS = "Customization"
export const SHIPPING = "Shipping"