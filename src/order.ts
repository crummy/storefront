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
  note?: string,
  shipping?: string,
  shippingCost?: number,
  phoneNumber: string
}

export interface PlacedOrder extends SavedOrder {
  name: string,
  address: Address,
  email: string
}

export interface Address {
  city: string,
  country: string,
  line1: string,
  line2?: string,
  postal_code: string,
  state?: string
}

export const get = async (id: string): Promise<SavedOrder | PlacedOrder | null> => {
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
      if (item && item.state == State.PAID) {
        return toPlacedOrder(item)
      } else if (item) {
        return toSavedOrder(item)
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

export const updateOrderCancelled = async (id: string) => {
  const params = {
    TableName: tableName,
    Key: { id },
    UpdateExpression: "set #state = :state",
    ExpressionAttributeNames: {
      "#state": "state"
    },
    ExpressionAttributeValues: {
      ":state": State.CANCELLED
    }
  }
  await ddb.update(params).promise()
}

export const updateOrderPlaced = async (id: string, name: string, address: Address, email: string) => {
  const params = {
    TableName: tableName,
    Key: { id },
    AttributeUpdates: {
      state: { Action: "PUT", Value: State.PAID },
      address: { Action: "PUT", Value: address },
      name: { Action: "PUT", Value: name },
      email: { Action: "PUT", Value: email }
    },
    ReturnValues: "ALL_NEW"
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
    .then(result => result.Items?.map(item => toSavedOrder(item)) || [])
}

const toSavedOrder = (item: any): SavedOrder => ({
  id: item.id,
  goods: item.goods,
  created: new Date(item.created),
  shopId: item.shopId,
  state: item.state,
  note: item.note,
  shipping: item.shipping,
  shippingCost: item.shippingCost,
  phoneNumber: item.phoneNumber
})

const toPlacedOrder = (item: any): PlacedOrder => ({
  id: item.id,
  goods: item.goods,
  email: item.email,
  created: new Date(item.created),
  shopId: item.shopId,
  state: item.state,
  name: item.name,
  address: item.address,
  note: item.note,
  shipping: item.shipping,
  shippingCost: item.shippingCost,
  phoneNumber: item.phoneNumber
})