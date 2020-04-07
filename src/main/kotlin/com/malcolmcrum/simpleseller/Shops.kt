package com.malcolmcrum.simpleseller

import kotlinx.serialization.Serializable

const val PRICES = "Prices"
const val FIELDS = "Customization"

fun getShop(config: ShopConfig, spreadsheetApi: GoogleSpreadsheetApi): Shop {
    val goods = spreadsheetApi.getGoods(config.spreadsheetId)
    val extraFields = spreadsheetApi.getExtraFields(config.spreadsheetId)
    return Shop(config.id, goods, extraFields)
}

private fun GoogleSpreadsheetApi.getExtraFields(spreadsheetId: String): Map<String, String> {
    return read(spreadsheetId, FIELDS).map { row ->
        val (key, value) = row
        key to value
    }.toMap()
}

private fun GoogleSpreadsheetApi.getGoods(spreadsheetId: String): List<Good> {
    return read(spreadsheetId, PRICES)
        .drop(1) // first row is a header
        .map { row ->
            val (name, price, unit, comment) = row
            Good(name, price.toFloat(), unit, comment)
        }
}

@Serializable
data class Shop(val id: String, val goods: List<Good>, val fields: Map<String, String>)