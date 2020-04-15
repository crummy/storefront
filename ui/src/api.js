const baseUrl = process.env.apiUrl;

export const getShop = async (shopId) => {
  let response = await fetch(`${baseUrl}/shop/${shopId}`);
  return response.json();
};

export const checkout = async (shopId, order) => {
  return fetch(`${baseUrl}/shop/${shopId}/checkout`, {
    method: "POST",
    body: JSON.stringify(order),
    headers: {
      Accept: "application/json",
      "Content-Type": "application/json"
    }
  });
}

export const getOrder = async (shopId, orderId) => {
  let response = await fetch(`${baseUrl}/shop/${shopId}/order/${orderId}`);
  return response.json();
}

export const cancel = async(shopId, orderId) => {
  return fetch(`${baseUrl}/shop/${shopId}/order/${orderId}/cancel`, {
    method: "POST"
  })
}