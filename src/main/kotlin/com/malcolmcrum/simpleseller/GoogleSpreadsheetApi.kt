package com.malcolmcrum.simpleseller

import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.features.json.JsonFeature
import io.ktor.client.features.json.serializer.KotlinxSerializer
import io.ktor.client.request.get
import kotlinx.coroutines.runBlocking
import kotlinx.serialization.Serializable
import kotlinx.serialization.json.Json
import kotlinx.serialization.json.JsonConfiguration
import kotlinx.serialization.json.JsonElement
import kotlinx.serialization.json.content


class GoogleSpreadsheetApi(val apiKey: String) {
    fun read(id: String, table: String): List<List<String>> {
        val client = HttpClient(CIO) {
            install(JsonFeature) {
                serializer = KotlinxSerializer(Json(JsonConfiguration.Stable.copy(ignoreUnknownKeys = true)))
            }
        }
        return runBlocking {
            client.use {
                val content: SpreadsheetContent = it.get("${BASE_URL}/${id}/values/${table}!A1:Z${MAX_ROWS}?valueRenderOption=UNFORMATTED_VALUE&key=${apiKey}")
                content.values.map { item -> item.map { cell -> cell.content } }
            }
        }
    }

    companion object {
        const val BASE_URL = "https://sheets.googleapis.com/v4/spreadsheets"
        const val MAX_ROWS = 1024
    }

    @Serializable data class SpreadsheetContent(val values: List<List<JsonElement>>)
}