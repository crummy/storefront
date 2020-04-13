import { tableName as orderTable } from './order'
import { tableName as shopConfigTable, ShopConfig } from './shopConfig'
import { resetTable } from './testUtil'
import { getShop } from './handler'
import { ddb } from './dynamodb'
import { getRows, PRICES, FIELDS } from './spreadsheetApi'
import { mocked } from 'ts-jest/utils'
jest.mock('./spreadsheetApi')

describe('create order', () => {
  beforeEach(async () => {
    await resetTable('orderTable', orderTable)
    await resetTable('shopConfigTable', shopConfigTable)
  })

  test('shop does not exist', async () => {
    const response = await getShop({ pathParameters: { id: 'missingShop' } })
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 404,
        body: "{\"error\":\"No shop found with ID missingShop\"}"
      })
    )
  })

  test('shop exists, empty spreadsheet', async () => {
    const shopConfig = { id: 'shop', spreadsheetId: 'spreadsheetId' }
    await createShopConfig(shopConfig)
    const mockedGetRows = mocked(getRows, true)
    mockedGetRows.mockImplementation(() => Promise.resolve([]))

    const response = await getShop({ pathParameters: { id: shopConfig.id } })
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    )
  })

  test('shop exists', async () => {
    const shopConfig = { id: 'shop', spreadsheetId: 'spreadsheetId' }
    await createShopConfig(shopConfig)
    const mockedGetRows = mocked(getRows, true)
    mockedGetRows.mockImplementation((spreadsheetId, table) => {
      expect(spreadsheetId).toEqual(shopConfig.spreadsheetId)
      if (table == PRICES) {
        return Promise.resolve([["skip this row"], ["Apples", 5, "kg", ""], ["Oranges", 200, "g", ""]])
      } else if (table == FIELDS) {
        return Promise.resolve([["Name", "Test"]])
      } else {
        throw new Error(`Unexpected table ${table}`)
      }
    })

    const response = await getShop({ pathParameters: { id: shopConfig.id } })
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200,
        body: JSON.stringify({
          goods: [
            { name: "Apples", price: 5, unit: "kg", comment: "" },
            { name: "Oranges", price: 200, unit: "g", comment: "" }
          ],
          fields: { Name: "Test" }
        })
      })
    )
  })
})

const createShopConfig = async (config: ShopConfig) => {
  await ddb.put({
    TableName: shopConfigTable,
    Item: config
  }).promise()
  const result = await ddb.scan(
    {
      TableName: shopConfigTable,
    }
  ).promise()
}