package com.malcolmcrum.simpleseller

import com.stripe.Stripe
import com.stripe.model.checkout.Session
import com.stripe.param.checkout.SessionCreateParams

fun checkout(stripeApiKey: String) {
    Stripe.apiKey = "***REMOVED***";

    val params: SessionCreateParams =
        SessionCreateParams.builder()
            .addPaymentMethodType(SessionCreateParams.PaymentMethodType.CARD)
            .addLineItem(
                SessionCreateParams.LineItem.builder()
                    .setName("T-shirt")
                    .setDescription("Comfortable cotton t-shirt")
                    .setAmount(500L)
                    .setCurrency("nzd")
                    .setQuantity(1L)
                    .build()
            )
            .setSuccessUrl("https://example.com/success?session_id={CHECKOUT_SESSION_ID}")
            .setCancelUrl("https://example.com/cancel")
            .build()

    val session = Session.create(params);
}