import { get } from './shop'
import { APIGatewayEvent } from "aws-lambda"

interface Response {
  statusCode: number,
  body: string,
  headers: Record<string, any> | undefined
}

export const getShop = async (event: APIGatewayEvent): Promise<Response> => {
  const shopId = event.pathParameters!!['id']!!
  try {
    const shop = await get(shopId)
    return ok(shop)
  } catch (e) {
    return error(e.message)
  }
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*.storefront.nz',
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