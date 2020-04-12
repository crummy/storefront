import { tableName as orderTable } from './order'
import { tableName as shopConfigTable } from './shopConfig'
import { resetTable } from './testUtil'
import { getShop } from './handler'

describe('create order', () => {
  beforeEach(async () => {
    await resetTable('orderTable', orderTable)
    await resetTable('shopConfigTable', shopConfigTable)
  })

  test('shop does not exist', async () => {
    const response = getShop({ pathParameters: { id: 'missingShop' }})
    await expect(response).resolves.toEqual(
      expect.objectContaining({
        statusCode: 404,
        body: "{\"error\":\"No shop found with ID missingShop\"}"
      })
    )
  })
})