import { Good, get as getShop } from './shop'
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

export const createOrder = async (shopId: string, email: string, goods: OrderedGood[]): Promise<CreateOrderResponse> => {
  const shopConfig = await getShopConfig(shopId)
  if (!shopConfig) {
    throw new HttpError(`No shop found: ${shopId}`, 404)
  }
  await verifyPrices(shopId, goods)

  const stripe = new Stripe(shopConfig.stripeSecretKey, { apiVersion: '2020-03-02' });

  const orderId = await putOrder({ goods, email, shopId, created: new Date() })

  const successUrl = `${baseUrl}/${shopId}/order/${orderId}?sessionId={CHECKOUT_SESSION_ID}`;
  const cancelUrl = `${baseUrl}/${shopId}/order/${orderId}/cancel`;
  const lineItems = goods.map(good => ({
    name: good.name,
    amount: good.price * 100,
    currency: 'nzd',
    quantity: good.quantity
  }));

  return await stripe.checkout.sessions.create({
    customer_email: email,
    payment_method_types: ['card'],
    line_items: lineItems,
    success_url: successUrl,
    cancel_url: cancelUrl,
    client_reference_id: orderId,
    shipping_address_collection: {
      allowed_countries: ['NZ'],
    },
  }).then(session => ({
    sessionId: session.id,
    orderId,
    stripeKey: shopConfig.stripeKey,
  }))
}

const verifyPrices = async (shopId: string, goods: OrderedGood[]) => {
  const shop = (await getShop(shopId))!
  const goodsMatch = goods.every(good =>
    shop.goods.some(g =>
      g.name == good.name && g.unit == good.unit && g.price == good.price
    )
  )
  if (!goodsMatch) {
    console.log("Tried to buy illegal goods", goods)
    throw new HttpError("Unable to purchase goods", 409)
  }
}