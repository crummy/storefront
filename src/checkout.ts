import { Good } from './shop'
import Stripe from 'stripe';
import { put as putOrder } from './order'

export interface OrderedGood extends Good {
  quantity: number
}

const baseUrl = process.env.WEBSITE_BASE_URL!!

const stripe = new Stripe(process.env.STRIPE_API_KEY!!, { apiVersion: '2020-03-02' });

export const createOrder = async (shopId: string, email: string, goods: Array<OrderedGood>): Promise<string> => {

  const lineItems = goods.map(good => ({
    name: good.name,
    amount: good.price * 100,
    currency: 'nzd',
    quantity: good.quantity
  }));

  const orderId = await putOrder({ goods, email, shopId, created: new Date()})

  const successUrl = `${baseUrl}/order/${orderId}?sessionId={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/order/cancelled`;

  return await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
  }).then(session => session.id)
}