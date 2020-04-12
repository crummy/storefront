import AWS from 'aws-sdk'

const config = process.env.NODE_ENV == 'test'
  ? { endpoint: 'http://localhost:8000' }
  : {}

export const ddb = new AWS.DynamoDB.DocumentClient(config)

export const raw = new AWS.DynamoDB(config)