import { tableName as orderTable, State } from './order'
import { tableName as shopConfigTable, ShopConfig } from './shopConfig'
import { resetTable } from './testUtil'
import { getShop, checkout, getOrder, getOrders, stripeWebhook } from './handler'
import { ddb } from './dynamodb'
import { getShopRows, PRICES, FIELDS } from './spreadsheetApi'
import { mocked } from 'ts-jest/utils'
import fs from 'fs'

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
    mocked(getShopRows).mockImplementation(() => {
      const contents = fs.readFileSync('src/test/emptySpreadsheet.json')
      return JSON.parse(contents.toString())
    })
    const response = await getShop({ pathParameters: { shopId: shopConfig.id }, body: null })
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    )
  })

  test('shop exists', async () => {
    await createShopConfig(shopConfig)
    mocked(getShopRows).mockImplementation(() => {
      const contents = fs.readFileSync('src/test/spreadsheet.json')
      return JSON.parse(contents.toString())
    })

    const response = await getShop({ pathParameters: { shopId: shopConfig.id }, body: null })
    expect(response.statusCode).toEqual(200)
    const body = JSON.parse(response.body)
    expect(body).toEqual(
      expect.objectContaining(
        {
          "id": "shop",
          "goods": [{ "name": "Omega plums", "price": 6, "unit": "kg", "comment": "undefined" }, { "name": "Angelino plums", "price": 6, "unit": "kg", "comment": "undefined" }, { "name": "Plum seconds", "price": 4, "unit": "kg", "comment": "undefined" }, { "name": "Feijoas", "price": 4, "unit": "kg", "comment": "undefined" }, { "name": "Feijoa smalls", "price": 3, "unit": "kg", "comment": "egg sized" }, { "name": "Liberty apples", "price": 4, "unit": "kg", "comment": "from Heavens' Scent orchard" }],
          "fields": { "title": "Windsong Orchard", "message": "Feijoa season! Short and Sweet", "footer": "Biogro #130 certified organic produce", "shipping_north_island": 25, "shipping_south_island": 15, "shipping_rural": 5.5, "shipping_kg_unit": "14 or less" },
          "shippingCosts": [{ "name": "North Island", "price": 25, "perKg": 14 }, { "name": "North Island Rural Delivery", "price": 29.5, "perKg": 14 }, { "name": "South Island", "price": 15, "perKg": 14 }, { "name": "South Island Rural Delivery", "price": 19.5, "perKg": 14 }, { "name": "Pickup", "price": 0, "perKg": 14 }]
        }
      )
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
    const orderResponse = await getOrder({ pathParameters: { shopId: shopConfig.id, orderId }, body: null })
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