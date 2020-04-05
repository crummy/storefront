package com.malcolmcrum.simpleseller

import com.amazonaws.client.builder.AwsClientBuilder
import com.amazonaws.services.dynamodbv2.AmazonDynamoDBClientBuilder
import com.amazonaws.services.dynamodbv2.document.DynamoDB
import com.amazonaws.services.dynamodbv2.document.Item
import com.amazonaws.services.dynamodbv2.document.PrimaryKey

class ShopRepository {
    private val dynamoDbClient = AmazonDynamoDBClientBuilder
        .standard()
        .withEndpointConfiguration(AwsClientBuilder.EndpointConfiguration("http://localhost:8000", "ap-southeast-2"))
        .build()

    private val dynamoDb = DynamoDB(dynamoDbClient)

    fun get(id: String): ShopConfig? {
        val item: Item? = dynamoDb.getTable(TABLE_NAME)
            .getItem(PrimaryKey(ID, id))
        return item?.toShopConfig()
    }

    private fun Item.toShopConfig(): ShopConfig {
        val id = this.getString(ID)
        val spreadsheetId = this.getString(SPREADSHEET_ID)
        return ShopConfig(id, spreadsheetId)
    }

    fun put(config: ShopConfig) {
        dynamoDb.getTable(TABLE_NAME)
            .putItem(config.toItem())
    }

    private fun ShopConfig.toItem(): Item {
        return Item()
            .withPrimaryKey(ID, id)
            .withString(SPREADSHEET_ID, spreadsheetId)
    }

    companion object {
        private const val TABLE_NAME = "shopConfigs"
        private const val ID = "id"
        private const val SPREADSHEET_ID = "spreadsheetId"
    }
}
