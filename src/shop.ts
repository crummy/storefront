import { APIGatewayEvent } from "aws-lambda"

export const get = async (event: APIGatewayEvent): Promise<any> => {
  return {
    statusCode: 200,
    body: "Hello world"
  }
}