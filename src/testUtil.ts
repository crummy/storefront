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
  await raw.deleteTable({ TableName: tableName }).promise()
}

const createTable = async (tableReference: string, tableName: string) => {
  const configFile = fs.readFileSync('./serverless.yml', 'utf8')
  const config = YAML.parse(configFile)
  const properties = config.resources.Resources[tableReference].Properties

  await raw.createTable({ ...properties, TableName: tableName }).promise()
}

const listTables = async (): Promise<string[]> => {
  return raw.listTables().promise()
    .then(response => response.TableNames || [])
}