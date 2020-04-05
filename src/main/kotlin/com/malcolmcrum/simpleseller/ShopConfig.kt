package com.malcolmcrum.simpleseller

import kotlinx.serialization.Serializable

@Serializable
data class ShopConfig(
    val id: String,
    val spreadsheetId: String
)