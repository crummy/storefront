import { tableName as orderTable, State } from './order'
import { tableName as shopConfigTable, ShopConfig } from './shopConfig'
import { resetTable } from './testUtil'
import { getShop, checkout, getOrder, getOrders, stripeWebhook, cancelOrder } from './handler'
import { ddb } from './dynamodb'
import { getShopRows } from './spreadsheetApi'
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
  stripeSecretKey: 'stripeSecretKey',
  email: 'email@email.com'
}

describe('getShop', () => {
  beforeEach(async () => {
    await resetTable('orderTable', orderTable)
    await resetTable('shopConfigTable', shopConfigTable)
  })

  test('shop does not exist', async () => {
    const response = await getShop({ pathParameters: { shopId: 'missingShop' } })
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 404,
        body: "{\"error\":\"No shop found with ID missingShop\"}"
      })
    )
  })

  test('shop exists, empty spreadsheet', async () => {
    await createShopConfig(shopConfig)
    mocked(getShopRows).mockImplementation(() => jsonFile('src/test/emptySpreadsheet.json'))
    const response = await getShop({ pathParameters: { shopId: shopConfig.id } })
    expect(response).toEqual(
      expect.objectContaining({
        statusCode: 200
      })
    )
  })

  test('shop exists', async () => {
    await createShopConfig(shopConfig)
    mocked(getShopRows).mockImplementation(() => jsonFile('src/test/spreadsheet.json'))

    const response = await getShop({ pathParameters: { shopId: shopConfig.id } })
    expect(response.statusCode).toEqual(200)
    const body = JSON.parse(response.body)
    expect(body).toEqual(
      expect.objectContaining(
        {
          "id": "shop",
          "goods": [{ "name": "Omega plums", "price": 6, "unit": "kg" }, { "name": "Angelino plums", "price": 6, "unit": "kg" }, { "name": "Plum seconds", "price": 4, "unit": "kg" }, { "name": "Feijoas", "price": 4, "unit": "kg" }, { "name": "Feijoa smalls", "price": 3, "unit": "kg", "comment": "egg sized" }, { "name": "Liberty apples", "price": 4, "unit": "kg", "comment": "from Heavens' Scent orchard" }],
          "fields": { "title": "Windsong Orchard", "message": "Feijoa season! Short and Sweet", "footer": "Biogro #130 certified organic produce", "shipping_north_island": 25, "shipping_south_island": 15, "shipping_rural": 5.5, "shipping_kg_unit": "14 or less" },
          "shippingCosts": [{ "name": "North Island", "pricePerBox": 25, "kgPerBox": 14 }, { "name": "North Island Rural Delivery", "pricePerBox": 29.5, "kgPerBox": 14 }, { "name": "South Island", "pricePerBox": 15, "kgPerBox": 14 }, { "name": "South Island Rural Delivery", "pricePerBox": 19.5, "kgPerBox": 14 }, { "name": "Pickup", "pricePerBox": 0, "kgPerBox": 14 }]
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
    mocked(getShopRows).mockImplementation(() => jsonFile('src/test/spreadsheet.json'))
    const { orderId } = await createOrder()
    const response = await getOrder({ pathParameters: { shopId: shopConfig.id, orderId } })
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body)).toEqual(
      expect.objectContaining(
        { id: orderId, goods: [{ name: "Omega plums", price: 6, quantity: 1, unit: "kg" }], email: 'email@email.com', shopId: shopConfig.id, state: State.PENDING_PAYMENT }
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
    const response = await getOrders({ pathParameters: { shopId: shopConfig.id } })
    expect(response.statusCode).toEqual(200)
    expect(JSON.parse(response.body)).toEqual([])
  })
})

describe('cancelOrder', () => {
  beforeEach(async () => {
    await resetTable('orderTable', orderTable)
    await resetTable('shopConfigTable', shopConfigTable)
  })

  test('cancel existing order', async () => {
    await createShopConfig(shopConfig)
    mocked(getShopRows).mockImplementation(() => jsonFile('src/test/spreadsheet.json'))
    const { orderId } = await createOrder()
    const cancelResponse = await cancelOrder({ pathParameters: { shopId: shopConfig.id, orderId } })
    expect(cancelResponse.statusCode).toEqual(200)
    const response = await getOrder({ pathParameters: { shopId: shopConfig.id, orderId } })
    expect(JSON.parse(response.body)).toEqual(
      expect.objectContaining(
        { state: State.CANCELLED }
      )
    )
  })
})

describe('stripeWebhook', () => {
  beforeEach(async () => {
    await resetTable('orderTable', orderTable)
    await resetTable('shopConfigTable', shopConfigTable)
  })

  test('status updated correctly', async () => {
    await createShopConfig(shopConfig)
    mocked(getShopRows).mockImplementation(() => jsonFile('src/test/spreadsheet.json'))
    
    const { orderId } = await createOrder()
    const body = jsonFile('src/test/webhook.json')
    body.data.object.client_reference_id = orderId
    await stripeWebhook({
      pathParameters: {},
      body: JSON.stringify(body)
    })
    const orderResponse = await getOrder({ pathParameters: { shopId: shopConfig.id, orderId } })
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

const createOrder = async () => {
  const checkoutResponse = await checkout(
    {
      pathParameters: { shopId: shopConfig.id },
      body: JSON.stringify({ email: 'email@email.com', goods: [{ name: "Omega plums", price: 6, quantity: 1, unit: "kg" }], shipping: 'Pickup' })
    })
  return JSON.parse(checkoutResponse.body)
}

const jsonFile = (path: string): any => {
  const contents = fs.readFileSync(path)
  return JSON.parse(contents.toString())
}