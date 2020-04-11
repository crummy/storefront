import { APIGatewayEvent } from "aws-lambda"

export const get = async (event: APIGatewayEvent): Promise<any> => {
  const shopId = event.pathParameters!!['shopId']!!
  console.log(shopId)
}