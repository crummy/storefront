package com.malcolmcrum.simpleseller

import io.ktor.application.Application
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.features.*
import io.ktor.http.HttpMethod
import io.ktor.request.receive
import io.ktor.response.respond
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.routing.routing
import io.ktor.serialization.json
import org.slf4j.event.Level

val configuration = Configuration()
val shopRepository = ShopRepository()
val spreadsheetApi = GoogleSpreadsheetApi(configuration.googleApiKey)

fun Application.main() {
    install(DefaultHeaders)
    install(CallLogging) {
        level = Level.INFO
    }
    install(ContentNegotiation) {
        json()
    }
    install(CORS) { // TODO remove this
        anyHost()
        method(HttpMethod.Options)
        header("Sec-Fetch-Dest")
        header("User-Agent")
        header("Referer")
        header("Content-Type")
        header("Accept")
    }
    routing {
        get("/shop/{id}") {
            val id = call.parameters["id"]!!
            val config = shopRepository.get(id) ?: throw NotFoundException("No shop found for $id")
            val shop = getShop(config, spreadsheetApi)
            call.respond(shop)
        }
        post("/shop/{id}/checkout") {
            val order = call.receive(Order::class)
            val checkoutId = checkout(order, configuration.stripeApiKey)
            call.respond(mapOf("id" to checkoutId))
        }
    }
}