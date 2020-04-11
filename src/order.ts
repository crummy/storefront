import AWS from 'aws-sdk'
import { OrderedGood } from './checkout'
import uuid from 'uuid'

export const tableName = process.env.ORDER_TABLE!!
const ddb = new AWS.DynamoDB.DocumentClient()

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
    .catch(error => { throw Error(error) })
}

export const put = async (order: Order): Promise<string> => {
  const id = uuid.v4()
  const params = {
    TableName: tableName, 
    Item: {id, ...order }
  }
  await ddb.put(params).promise()
    .catch(error => { throw Error(error) })
  return id
}
