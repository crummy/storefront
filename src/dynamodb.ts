import { DynamoDBDocument } from '@aws-sdk/lib-dynamodb';
import { DynamoDB } from '@aws-sdk/client-dynamodb';

const config = process.env.NODE_ENV == 'test'
  ? { endpoint: 'http://localhost:8000' }
  : {}

export const ddb = DynamoDBDocument.from(new DynamoDB({
  ...config
}), {
  marshallOptions: {
    convertEmptyValues: true
  }
})

export const raw = new DynamoDB(config)