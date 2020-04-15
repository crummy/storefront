import { tableName as orderTable, State } from './order'
import { tableName as shopConfigTable, ShopConfig } from './shopConfig'
import { resetTable } from './testUtil'
import { getShop, checkout, getOrder, getOrders, stripeWebhook } from './handler'
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

const shopConfig: ShopConfig = {
  id: 'shop',
  spreadsheetId: 'spreadsheetId',
  stripeKey: 'stripeKey',
  stripeSecretKey: 'stripeSecretKey'
}

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
  beforeEach(async () => {
    await resetTable('orderTable', orderTable)
    await resetTable('shopConfigTable', shopConfigTable)
  })

  test('read order after creation', async () => {
    await createShopConfig(shopConfig)
    const checkoutResponse = await checkout(
      {
        pathParameters: { shopId: shopConfig.id },
        body: JSON.stringify({
          email: 'email@email.com',
          goods: []
        })
      })
    const orderId = JSON.parse(checkoutResponse.body).orderId
    console.log(`checkout response`, checkoutResponse.body)
    const response = await getOrder({ pathParameters: { shopId: shopConfig.id, orderId }, body: null })
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body)).toEqual(
      expect.objectContaining(
        { id: orderId, goods: [], email: 'email@email.com', shopId: shopConfig.id }
      )
    )
  })
})

describe('getOrders', () => {
  beforeEach(async () => {
    await resetTable('orderTable', orderTable)
    await resetTable('shopConfigTable', shopConfigTable)
  })

  test('no orders', async () => {
    const response = await getOrders({ pathParameters: { shopId: shopConfig.id }, body: null })
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body)).toEqual([])
  })
})

describe('stripeWebhook', () => {
  beforeEach(async () => {
    await resetTable('orderTable', orderTable)
    await resetTable('shopConfigTable', shopConfigTable)
  })

  test('status updated correctly', async () => {
    await createShopConfig(shopConfig)
    const checkoutResponse = await checkout(
      {
        pathParameters: { shopId: shopConfig.id },
        body: JSON.stringify({
          email: 'email@email.com',
          goods: []
        })
      })
    const orderId = JSON.parse(checkoutResponse.body).orderId
    await stripeWebhook({
      pathParameters: {},
      body: JSON.stringify({ data: { object: { client_reference_id: orderId } } })
    })
    const orderResponse = await getOrder({ pathParameters: { shopId: shopConfig.id, orderId }, body: null})
    const order = JSON.parse(orderResponse.body)
    expect(order.state).toEqual(State.PAID)
  })
})

const createShopConfig = async (config: ShopConfig) => {
  await ddb.put({
    TableName: shopConfigTable,
    Item: config
  }).promise()
}