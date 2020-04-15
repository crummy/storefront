import { Good } from './shop'
import Stripe from 'stripe';
import { put as putOrder } from './order'

export interface OrderedGood extends Good {
  quantity: number
}

const baseUrl = process.env.WEBSITE_BASE_URL!!

const stripe = new Stripe(process.env.STRIPE_API_KEY!!, { apiVersion: '2020-03-02' });

interface CreateOrderResponse {
  sessionId: string,
  orderId: string
}

export const createOrder = async (shopId: string, email: string, goods: Array<OrderedGood>): Promise<CreateOrderResponse> => {

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
    orderId
  }))
}