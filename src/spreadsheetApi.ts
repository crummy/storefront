import fetch from 'node-fetch'

const baseUrl = "https://sheets.googleapis.com/v4/spreadsheets"
const maxRows = 1024
const apiKey = process.env.GOOGLE_API_KEY

export const getRows = async (id: string, table: string): Promise<Array<any>> => {
  return fetch(`${baseUrl}/${id}/values/${table}!A1:Z${maxRows}?valueRenderOption=UNFORMATTED_VALUE&key=${apiKey}`)
    .then(response => response.json())
    .then(response => response.values)
    .catch(error => { throw Error(error) })
}