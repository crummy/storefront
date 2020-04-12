import { get } from './shop'
import { createOrder, OrderedGood } from './checkout'
import { APIGatewayEvent } from "aws-lambda"
import { HttpError } from './error'

interface Response {
  statusCode: number,
  body: string,
  headers: Record<string, any> | undefined
}

export const getShop = async ({ pathParameters }: { pathParameters: Record<string, string> }): Promise<Response> => {
  try {
    const shopId = pathParameters.id
    const shop = await get(shopId)
    return ok(shop)
  } catch (e) {
    return error(e)
  }
}


export const checkout = async (event: APIGatewayEvent): Promise<Response> => {
  try {
    const shopId = event.pathParameters!!['id']!!
    const order = JSON.parse(event.body!!) 
    const shop = await createOrder(shopId, order.email, order.goods as Array<OrderedGood>)
    return ok(shop)
  } catch (e) {
    return error(e)
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