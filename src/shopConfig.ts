import { ddb } from './dynamodb'

export const tableName = process.env.SHOP_CONFIG_TABLE!!

export interface ShopConfig {
  id: string,
  spreadsheetId: string,
  stripeKey: string,
  stripeSecretKey: string,
  email: string
}

export const get = async (id: string): Promise<ShopConfig | null> => {
  const params = {
    TableName: tableName,
    Key: {
      id
    }
  }
  return (
    ddb.get(params)
      .then(result => result.Item)
      .then(item => {
        if (item) {
          return item as ShopConfig
        } else {
          return null
        }
      })
  );
}
