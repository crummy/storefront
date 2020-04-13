import { ddb } from './dynamodb'
import { OrderedGood } from './checkout'
import { v4 as uuidv4 } from 'uuid';

export const tableName = process.env.ORDER_TABLE!!

export interface SavedOrder extends Order {
  id: string
}

export interface Order {
  goods: Array<OrderedGood>,
  shopId: string,
  created: Date,
  email: string
}

export const get = async (id: string): Promise<SavedOrder | null> => {
  const params = {
    TableName: tableName,
    Key: {
      id
    }
  }
  return ddb.get(params)
    .promise()
    .then(result => result.Item)
    .then(item => {
      if (item) {
        return { id: item.id, goods: item.goods, email: item.email, created: item.created, shopId: item.shopId }
      } else {
        return null
      }
    })
}

export const put = async (order: Order): Promise<string> => {
  const id = uuidv4()
  const params = {
    TableName: tableName, 
    Item: {id, ...order }
  }
  await ddb.put(params).promise()
  return id
}
