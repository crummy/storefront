import AWS from 'aws-sdk'

const tableName = process.env.SHOP_CONFIG_TABLE!!
const ddb = new AWS.DynamoDB.DocumentClient()

export interface ShopConfig {
  id: string,
  spreadsheetId: string
}

export const get = async (id: string): Promise<ShopConfig | null> => {
  const params = {
    TableName: tableName,
    Key: {
      id
    }
  }
  return ddb.get(params)
    .promise()
    .then(result => result.Item)
    .then(item => {
      if (item) {
        return { id: item.id, spreadsheetId: item.spreadsheetId }
      } else {
        return null
      }
    })
    .catch(error => { throw Error(error) })
}
