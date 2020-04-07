package com.malcolmcrum.simpleseller

import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.features.*
import io.ktor.request.receiveText
import io.ktor.response.respond
import io.ktor.response.respondText
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.routing.routing
import io.ktor.serialization.json

val configuration = Configuration()
val shopRepository = ShopRepository()
val spreadsheetApi = GoogleSpreadsheetApi(configuration.googleApiKey)

fun Application.main() {
    install(DefaultHeaders)
    install(CallLogging)
    install(ContentNegotiation) {
        json()
    }
    install(CORS) { // TODO remove this
        anyHost()
    }
    routing {
        get("/shop/{id}") {
            val id = call.parameters["id"]!!
            val config = shopRepository.get(id) ?: throw NotFoundException("No shop found for $id")
            val shop = getShop(config, spreadsheetApi)
            call.respond(shop)
        }
        post("/shop/{id}/checkout") {
            val json = call.receiveText()
            println(json)
            checkout(configuration.stripeApiKey)
            call.respondText("basketId")
        }
    }
}