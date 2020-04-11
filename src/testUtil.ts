import YAML from 'yaml'
import fs from 'fs'
import AWS from 'aws-sdk'

export const resetTable = async (tableName: string) => {
  try {
    await deleteTable(tableName)
  } finally {
    await createTable(tableName)
  }
}

const deleteTable = async (tableName: string) => {
  const dynamoDB = new AWS.DynamoDB()
  await dynamoDB.deleteTable({ TableName: tableName }).promise()
}

const createTable = async (tableName: string) => {
  const configFile = fs.readFileSync('./serverless.yml', 'utf8')
  const config = YAML.parse(configFile)
  const properties = config.resources.Resources.usageTable.Properties
  const dynamoDB = new AWS.DynamoDB()

  await dynamoDB.createTable({ ...properties, TableName: tableName }).promise()
}