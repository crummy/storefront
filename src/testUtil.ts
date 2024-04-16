import YAML from 'yaml'
import fs from 'fs'
import { raw } from './dynamodb'

export const resetTable = async (tableReference: string, tableName: string) => {
  const tables = await listTables()
  if (tables.includes(tableName)) {
    await deleteTable(tableName)
  }
  await createTable(tableReference, tableName)
}

const deleteTable = async (tableName: string) => {
  await // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  raw.deleteTable({ TableName: tableName })
}

const createTable = async (tableReference: string, tableName: string) => {
  const configFile = fs.readFileSync('./serverless.yml', 'utf8')
  const config = YAML.parse(configFile)
  const properties = config.resources.Resources[tableReference].Properties

  await // The `.promise()` call might be on an JS SDK v2 client API.
  // If yes, please remove .promise(). If not, remove this comment.
  raw.createTable({ ...properties, TableName: tableName })
}

const listTables = async (): Promise<string[]> => {
  return (
    // The `.promise()` call might be on an JS SDK v2 client API.
    // If yes, please remove .promise(). If not, remove this comment.
    raw.listTables()
      .then(response => response.TableNames || [])
  );
}