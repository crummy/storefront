import { get as readShop } from './shop'
import { get as getShopConfig } from './shopConfig'
import { createOrder, OrderedGood } from './checkout'
import {get as readOrder, query as readOrders, State, updateOrderCancelled, updateOrderPlaced, PlacedOrder, SavedOrder} from './order'
import { HttpError } from './error'
import { addOrderRow } from './spreadsheetApi'
import { sendOrderNotification } from './email'

interface Response {
  statusCode: number,
  body: string,
  headers?: Record<string, any>
}

interface Event {
  pathParameters: Record<string, string>,
  body?: string
}

export const getShop = async ({ pathParameters }: Event): Promise<Response> => {
  try {
    const { shopId } = pathParameters
    const shop = await readShop(shopId)
    return ok(shop)
  } catch (e) {
    return error(e)
  }
}

export const checkout = async ({ pathParameters, body }: Event): Promise<Response> => {
  try {
    const { shopId } = pathParameters
    const order = JSON.parse(body!)
    if (order.goods.length == 0) {
      throw new HttpError(`Cannot create an order with no goods`, 409)
    }
    if (order.goods.some((good: OrderedGood) => good.quantity < 0)) {
      throw new HttpError(`Tried to order goods with negative quantity`, 409)
    }
    const result = await createOrder(shopId, order.goods, order.shipping, order.note, order.phoneNumber)
    return ok(result)
  } catch (e) {
    return error(e)
  }
}

export const getOrder = async ({ pathParameters }: Event): Promise<Response> => {
  try {
    const { shopId, orderId } = pathParameters
    const order = await readOrder(orderId)
    if (order == null || order.shopId !== shopId) {
      throw new HttpError(`No order found for orderId ${orderId}`, 404)
    }
    return ok(order)
  } catch (e) {
    return error(e)
  }
}

export const cancelOrder = async ({ pathParameters }: Event): Promise<Response> => {
  try {
    const { shopId, orderId } = pathParameters
    const order = await readOrder(orderId)
    if (order == null || order.shopId !== shopId) {
      throw new HttpError(`No order found for orderId ${orderId}`, 404)
    } else if (order.state != State.PENDING_PAYMENT) {
      console.log(`Attempted to cancel order ${orderId} but it is in state ${order.state}`)
      throw new HttpError(`Order ${orderId} cannot be cancelled`, 409)
    }
    await updateOrderCancelled(orderId)
    return ok({ message: `Order ${orderId} cancelled` })
  } catch (e) {
    return error(e)
  }
}

export const getOrders = async ({ pathParameters }: Event): Promise<Response> => {
  try {
    const { shopId } = pathParameters
    const orders = await readOrders(shopId)
    return ok(orders)
  } catch (e) {
    return error(e)
  }
}

export const stripeWebhook = async ({ body }: Event): Promise<Response> => {
  console.log("Received webhook event", body)
  try {
    const { data: { object: { client_reference_id, customer_details: { email }, shipping: { address, name } } } } = JSON.parse(body!)
    const orderId = client_reference_id
    await updateOrderPlaced(orderId, name, address, email)
    const order = await readOrder(orderId) as PlacedOrder
    const shopConfig = await getShopConfig(order!.shopId)
    await addOrderRow(shopConfig!.spreadsheetId, order)
    await sendOrderNotification(order, shopConfig!)
    return ok()
  } catch (e) {
    return error(e)
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // TODO: be smarter about this
  'Access-Control-Allow-Credentials': true,
}

const ok = (message: any = {}): Response => {
  return {
    statusCode: 200,
    body: JSON.stringify(message),
    headers: corsHeaders
  }
}

const error = (exception: Error): Response => {
  console.error("Fatal error", exception)
  if (exception instanceof HttpError) {
    return {
      statusCode: exception.statusCode,
      body: JSON.stringify({ error: exception.message }),
      headers: corsHeaders
    }
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An unexpected error occurred", exception }),
      headers: corsHeaders
    }
  }

}