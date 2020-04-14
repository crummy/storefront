import { tableName as orderTable } from './order'
import { tableName as shopConfigTable, ShopConfig } from './shopConfig'
import { resetTable } from './testUtil'
import { getShop, checkout, getOrder } from './handler'
import { ddb } from './dynamodb'
import { getRows, PRICES, FIELDS } from './spreadsheetApi'
import { mocked } from 'ts-jest/utils'
import Stripe from 'stripe';

jest.mock('./spreadsheetApi')
jest.mock('stripe', () => {
  return jest.fn().mockImplementation(() => ({
    checkout: {
      sessions: {
        create: jest.fn(() => Promise.resolve({ id: 'session' }))
      }
    }
  }))
})

describe('getShop', () => {
  beforeEach(async () => {
    await resetTable('orderTable', orderTable)
    await resetTable('shopConfigTable', shopConfigTable)
  })

  test('shop does not exist', async () => {
    const response = await getShop({ pathParameters: { shopId: 'missingShop' }, body: null })
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 404,
        body: "{\"error\":\"No shop found with ID missingShop\"}"
      })
    )
  })

  test('shop exists, empty spreadsheet', async () => {
    const shopConfig = { id: 'emptyShop', spreadsheetId: 'spreadsheetId' }
    await createShopConfig(shopConfig)
    mocked(getRows).mockImplementation(() => Promise.resolve([]))
    const response = await getShop({ pathParameters: { shopId: shopConfig.id }, body: null })
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    )
  })

  test('shop exists', async () => {
    const shopConfig = { id: 'shop', spreadsheetId: 'spreadsheetId' }
    await createShopConfig(shopConfig)
    mocked(getRows).mockImplementation((spreadsheetId, table) => {
      expect(spreadsheetId).toEqual(shopConfig.spreadsheetId)
      if (table == PRICES) {
        return Promise.resolve([["skip this row"], ["Apples", 5, "kg", ""], ["Oranges", 200, "g", ""]])
      } else if (table == FIELDS) {
        return Promise.resolve([["Name", "Test"]])
      } else {
        throw new Error(`Unexpected table ${table}`)
      }
    })

    const response = await getShop({ pathParameters: { shopId: shopConfig.id }, body: null })
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

describe('checkout', () => {
  test('read order after creation', async () => {
    const checkoutResponse = await checkout(
      {
        pathParameters: { shopId: 'shop' },
        body: JSON.stringify({
          email: 'email@email.com',
          goods: []
        })
      })
    const orderId = JSON.parse(checkoutResponse.body).orderId
    const response = await getOrder({ pathParameters: { shopId: 'shop', orderId }, body: null })
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body)).toEqual(
      expect.objectContaining(
        { id: orderId, goods: [], email: 'email@email.com', shopId: 'shop' }
      )
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