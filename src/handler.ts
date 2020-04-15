import { get as readShop } from './shop'
import { createOrder, OrderedGood } from './checkout'
import { get as readOrder, query as readOrders, State, setState } from './order'
import { HttpError } from './error'

interface Response {
  statusCode: number,
  body: string,
  headers: Record<string, any> | undefined
}

interface Event {
  pathParameters: Record<string, string>,
  body: string | null
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
    const order = JSON.parse(body!!)
    const result = await createOrder(shopId, order.email, order.goods as Array<OrderedGood>)
    return ok(result)
  } catch (e) {
    return error(e)
  }
}

export const getOrder = async ({ pathParameters, body }: Event): Promise<Response> => {
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
    await setState(orderId, State.CANCELLED)
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

export const stripeWebhook = async ({ pathParameters, body }: Event): Promise<Response> => {
  try {
    const content = JSON.parse(body!)
    const orderId = content.data.object.client_reference_id
    await setState(orderId, State.PAID)
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
  console.log(exception)
  if (exception instanceof HttpError) {
    return {
      statusCode: exception.statusCode,
      body: JSON.stringify({ error: exception.message }),
      headers: corsHeaders
    }
  } else {
    return {
      statusCode: 500,
      body: JSON.stringify({ error: "An unexpected error occurred" }),
      headers: corsHeaders
    }
  }

}