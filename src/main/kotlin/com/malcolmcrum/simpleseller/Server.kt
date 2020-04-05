package com.malcolmcrum.simpleseller

import io.ktor.application.ApplicationCall
import io.ktor.application.call
import io.ktor.application.install
import io.ktor.auth.*
import io.ktor.client.HttpClient
import io.ktor.client.engine.cio.CIO
import io.ktor.client.features.json.JsonFeature
import io.ktor.client.request.get
import io.ktor.client.request.header
import io.ktor.features.CORS
import io.ktor.features.ContentNegotiation
import io.ktor.features.NotFoundException
import io.ktor.features.origin
import io.ktor.http.HttpMethod
import io.ktor.request.host
import io.ktor.request.port
import io.ktor.request.receiveText
import io.ktor.response.respond
import io.ktor.response.respondRedirect
import io.ktor.response.respondText
import io.ktor.routing.get
import io.ktor.routing.post
import io.ktor.routing.route
import io.ktor.routing.routing
import io.ktor.serialization.json
import io.ktor.server.engine.embeddedServer
import io.ktor.server.netty.Netty
import io.ktor.sessions.SessionTransportTransformerMessageAuthentication
import io.ktor.sessions.Sessions
import io.ktor.sessions.cookie
import io.ktor.sessions.sessions
import io.ktor.util.hex
import kotlinx.serialization.Serializable

@Serializable
data class GoogleSession(val sub: String, val picture: String, val email: String, val email_verified: Boolean)

val googleOauthProvider = OAuthServerSettings.OAuth2ServerSettings(
    name = "google",
    authorizeUrl = "https://accounts.google.com/o/oauth2/auth",
    accessTokenUrl = "https://www.googleapis.com/oauth2/v3/token",
    requestMethod = HttpMethod.Post,

    clientId = "544291885814-554c2u4hsth8lieljdaqb6ffjvi8cb4l.apps.googleusercontent.com",
    clientSecret = "mX0ECdTOv3Tzj3P8_7HUXRd_",
    defaultScopes = listOf("email") // no email, but gives full name, picture, and id
)

fun main() {
    val shopRepository = ShopRepository()
    val shops = Shops()

    val server = embeddedServer(Netty, port = 8080) {
        install(ContentNegotiation) {
            json()
        }
        install(CORS) { // TODO delete this
            anyHost()
        }
        install(Sessions) {
            cookie<GoogleSession>("google-session") {
                val secretSignKey = hex("7c31c44f5906c1467333967585f42714")
                transform(SessionTransportTransformerMessageAuthentication(secretSignKey))
            }
        }
        install(Authentication) {
            oauth("google-oauth") {
                client = HttpClient(CIO)
                providerLookup = { googleOauthProvider }
                urlProvider = { redirectUrl("/login") }
            }
        }

        routing {
            get("/shop/{id}") {
                val id = call.parameters["id"]!!
                val config = shopRepository.get(id) ?: throw NotFoundException("No shop found for $id")
                val shop = shops.get(config)
                call.respond(shop)
            }
            post("/shop/{id}/checkout") {
                val json = call.receiveText()
                println(json)
                call.respondText("basketId")
            }
            authenticate("google-oauth") {
                route("/login") {
                    handle {
                        val principal = call.authentication.principal<OAuthAccessTokenResponse.OAuth2>()
                            ?: error("No principal")

                        val client = HttpClient(CIO) {
                            install(JsonFeature)
                        }
                        val session = client.get<GoogleSession>("https://www.googleapis.com/oauth2/v3/userinfo") {
                            header("Authorization", "Bearer ${principal.accessToken}")
                        }

                        call.sessions.set("google-session", session)
                        call.respondRedirect("/")
                    }
                }
            }
        }
    }
    server.start(wait = true)
}

private fun ApplicationCall.redirectUrl(path: String): String {
    val defaultPort = if (request.origin.scheme == "http") 80 else 443
    val hostPort = request.host()!! + request.port().let { port -> if (port == defaultPort) "" else ":$port" }
    val protocol = request.origin.scheme
    return "$protocol://$hostPort$path"
}