package com.malcolmcrum.simpleseller

import com.stripe.Stripe
import com.stripe.model.checkout.Session
import com.stripe.param.checkout.SessionCreateParams

fun checkout(order: Order, stripeApiKey: String): String {
    Stripe.apiKey = stripeApiKey

    val builder =
        SessionCreateParams.builder()
            .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)

    for (good in order.goods) {
        builder.addLineItem(
            SessionCreateParams.LineItem.builder()
                .setName(good.name)
                .setAmount((good.price * 100).toLong())
                .setCurrency("nzd")
                .setQuantity(good.quantity?.toLong() ?: throw IllegalStateException("Expected a quantity for $good"))
                .build()
        )
    }

    val params = builder
        .setSuccessUrl("https://example.com/success?session_id={CHECKOUT_SESSION_ID}")
        .setCancelUrl("https://example.com/cancel")
        .build()

    val session = Session.create(params);
    return session.id
}