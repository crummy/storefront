package com.malcolmcrum.simpleseller

import kotlinx.serialization.Serializable

@Serializable
data class Good(val name: String, val price: Float, val unit: String, val comment: String)