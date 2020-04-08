package com.malcolmcrum.simpleseller

import kotlinx.serialization.Serializable

@Serializable
data class Good(val name: String, val price: Float, val unit: String, val comment: String, var quantity: Int? = null)

@Serializable
data class Order(val goods: List<Good>)

@Serializable
data class ShopConfig(
    val id: String,
    val spreadsheetId: String
)