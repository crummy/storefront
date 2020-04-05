package com.malcolmcrum.simpleseller

import kotlinx.serialization.Serializable

class Shops {
    private val spreadsheetApi = GoogleSpreadsheetApi("***REMOVED***")

    fun get(config: ShopConfig): Shop {
        val goods = getGoods(config.spreadsheetId)
        val extraFields = getExtraFields(config.spreadsheetId)
        return Shop(config.id, goods, extraFields)
    }

    private fun getExtraFields(spreadsheetId: String): Map<String, String> {
        return spreadsheetApi.read(spreadsheetId, FIELDS).map { row ->
            val (key, value) = row
            key to value
        }.toMap()
    }

    private fun getGoods(spreadsheetId: String): List<Good> {
        return spreadsheetApi.read(spreadsheetId, PRICES)
            .drop(1) // first row is a header
            .map { row ->
                val (name, price, unit, comment) = row
                Good(name, price.toFloat(), unit, comment)
            }
    }

    companion object {
        const val PRICES = "Prices"
        const val FIELDS = "Customization"
    }
}

@Serializable
data class Shop(val id: String, val goods: List<Good>, val fields: Map<String, String>)