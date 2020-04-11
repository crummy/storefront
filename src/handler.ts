import { get } from './shop'
import { createOrder, OrderedGood } from './checkout'
import { APIGatewayEvent } from "aws-lambda"

interface Response {
  statusCode: number,
  body: string,
  headers: Record<string, any> | undefined
}

export const getShop = async (event: APIGatewayEvent): Promise<Response> => {
  try {
    const shopId = event.pathParameters!!['id']!!
    const shop = await get(shopId)
    return ok(shop)
  } catch (e) {
    console.error(e)
    return error(e.message)
  }
}


export const checkout = async (event: APIGatewayEvent): Promise<Response> => {
  try {
    const shopId = event.pathParameters!!['id']!!
    const order = JSON.parse(event.body!!) 
    const shop = await createOrder(shopId, order.email, order.goods as Array<OrderedGood>)
    return ok(shop)
  } catch (e) {
    console.error(e)
    return error(e.message)
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*', // TODO: be smarter about this
  'Access-Control-Allow-Credentials': true,
}


const ok = (message: any): Response => {
  return {
    statusCode: 200,
    body: JSON.stringify(message),
    headers: corsHeaders
  }
}

const error = (reason: string, statusCode: number = 500): Response => {
  return {
    statusCode,
    body: JSON.stringify({ error: reason }),
    headers: corsHeaders
  }
}