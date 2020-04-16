import fetch from 'node-fetch'

const baseUrl = "https://sheets.googleapis.com/v4/spreadsheets"
const maxRows = 1024
const apiKey = process.env.GOOGLE_API_KEY

// https://sheets.googleapis.com/v4/spreadsheets/19X-_-oAmAeV0keoNb_XMBDkYWwt_CW4RSHTTSL8Wx8o/values:batchGet\?ranges\=Prices!A1:Z26\&ranges\=Customization!A1:Z26\&ranges\=Shipping!A1:Z26\&key\=***REMOVED***\&valueRenderOption=UNFORMATTED_VALUE

export interface Spreadsheet {
  spreadsheetId: string,
  valueRanges: ValueRange[]
}

interface ValueRange {
  range: string,
  majorDimension: string,
  values?: Array<Array<string | Number>>
}

export const getShopRows = async (id: string): Promise<Spreadsheet> => {
  return fetch(`${baseUrl}/${id}/values:batchGet?ranges=${PRICES}!A1:Z${maxRows}&ranges=${FIELDS}!A1:Z${maxRows}&ranges=${SHIPPING}!A1:Z${maxRows}&valueRenderOption=UNFORMATTED_VALUE&key=${apiKey}`)
    .then(response => response.json())  
}

export const PRICES = "Prices"
export const FIELDS = "Customization"
export const SHIPPING = "Shipping"