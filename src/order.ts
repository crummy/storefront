import { ddb } from './dynamodb'
import { OrderedGood } from './checkout'
import { v4 as uuidv4 } from 'uuid';

export const tableName = process.env.ORDER_TABLE!!

export enum State {
  PENDING_PAYMENT = "PENDING_PAYMENT",
  PAID = "PAID",
  CANCELLED = "CANCELLED"
}

export interface SavedOrder extends Order {
  id: string,
  state: State
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
        return { id: item.id, goods: item.goods, email: item.email, created: new Date(item.created), shopId: item.shopId, state: item.state }
      } else {
        return null
      }
    })
}

export const put = async (order: Order): Promise<string> => {
  const id = uuidv4()
  const params = {
    TableName: tableName,
    Item: { id, state: State.PENDING_PAYMENT, ...order, created: order.created.toISOString() }
  }
  await ddb.put(params).promise()
  return id
}

export const setState = async (id: string, state: State) => {
  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: "set state = :state",
    ExpressionAttributeValues: {
      ":state": state
    }
  }
  await ddb.update(params).promise()
}

export const query = async (shopId: string): Promise<SavedOrder[]> => {
  const params = {
    TableName: tableName,
    IndexName: 'shopId',
    KeyConditionExpression: "shopId = :shopId",
    ExpressionAttributeValues: {
      ":shopId": shopId
    }
  }
  return ddb.query(params).promise()
    .then(result => result.Items?.map(item => toOrder(item)) || [])
}

const toOrder = (item: any): SavedOrder => ({
  id: item.id,
  goods: item.goods,
  created: new Date(item.created),
  shopId: item.shopId,
  email: item.email,
  state: item.state
})