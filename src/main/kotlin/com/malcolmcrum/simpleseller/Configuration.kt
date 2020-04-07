package com.malcolmcrum.simpleseller

import com.typesafe.config.ConfigFactory
import io.ktor.config.HoconApplicationConfig

class Configuration {
    val base = HoconApplicationConfig(ConfigFactory.load())

    val stripeApiKey = base.config("stripe").property("apiKey").getString()
    val googleApiKey = base.config("google").property("apiKey").getString()
}