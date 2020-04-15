import { Good } from './shop'
import Stripe from 'stripe';
import { put as putOrder } from './order'
import { get as getShopConfig } from './shopConfig'
import { HttpError } from './error'

export interface OrderedGood extends Good {
  quantity: number
}

const baseUrl = process.env.WEBSITE_BASE_URL!!

interface CreateOrderResponse {
  sessionId: string,
  orderId: string
}

export const createOrder = async (shopId: string, email: string, goods: Array<OrderedGood>): Promise<CreateOrderResponse> => {
  const shopConfig = await getShopConfig(shopId)
  if (!shopConfig) {
    throw new HttpError(`No shop found: ${shopId}`, 404)
  }

  const stripe = new Stripe(shopConfig.stripeSecretKey, { apiVersion: '2020-03-02' });

  const lineItems = goods.map(good => ({
    name: good.name,
    amount: good.price * 100,
    currency: 'nzd',
    quantity: good.quantity
  }));

  const orderId = await putOrder({ goods, email, shopId, created: new Date()})

  const successUrl = `${baseUrl}/${shopId}/order/${orderId}?sessionId={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/${shopId}/order/${orderId}/cancel`;

  return await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
  }).then(session => ({
    sessionId: session.id,
    orderId,
    stripeKey: shopConfig.stripeKey,
  }))
}