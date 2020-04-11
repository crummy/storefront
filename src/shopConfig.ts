import { DocumentClient } from 'aws-sdk/clients/dynamodb';
import AWS from 'aws-sdk'

const tableName = process.env.SHOP_CONFIG_TABLE!!

export interface ShopConfig {
  id: string,
  spreadsheetId: string
}

export const get = (id: string): Promise<ShopConfig|null|undefined> => {
  const ddb = new AWS.DynamoDB();
  const params = {
    TableName: tableName,
    Key: {
      id: { 'S': id }
    }
  }
  ddb.getItem(params)
    .promise()
    .then(result => console.log(result))
  return Promise.resolve({ id: "foo", spreadsheetId: "bar"})
}