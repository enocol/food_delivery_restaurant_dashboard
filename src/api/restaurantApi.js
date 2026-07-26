const BASE_URL = (
  import.meta.env.VITE_API_URL || "http://localhost:5000"
).replace(/\/$/, "");

const TOKEN_KEY = "restaurant_jwt";

/** Wrapper around fetch that attaches the stored JWT as a Bearer token. */
function authFetch(url, options = {}) {
  const token = localStorage.getItem(TOKEN_KEY);
  return fetch(url, {
    cache: "no-store", // always get fresh data from the server
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
}

/**
 * Authenticates a restaurant and returns a JWT.
 * @param {string} email
 * @param {string} password
 * @returns {Promise<{token: string}>}
 */
export async function loginRestaurant(email, password) {
  const res = await fetch(`${BASE_URL}/api/restaurants/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.message || "Invalid email or password.");
  }
  return res.json();
}

/**
 * Fetches the current status of a restaurant.
 * @param {string} restaurantId
 * @returns {Promise<{id: string, name: string, isOpen: boolean}>}
 */
export async function getRestaurantStatus(restaurantId) {
  const res = await authFetch(`${BASE_URL}/api/restaurants/${restaurantId}`);
  if (!res.ok) throw new Error("Failed to fetch restaurant status.");
  const data = await res.json();
  return data;
}

/**
 * Updates the open/closed status of a restaurant.
 * @param {string} restaurantId
 * @param {boolean} is_open
 * @returns {Promise<{id: string, name: string, isOpen: boolean}>}
 */
export async function setRestaurantOpen(restaurantId, is_open) {
  const res = await authFetch(
    `${BASE_URL}/api/restaurants/${restaurantId}/status`,
    {
      method: "PATCH",
      body: JSON.stringify({ is_open }),
    },
  );
  if (!res.ok) throw new Error("Failed to update restaurant status.");
  const data = await res.json();
  return data;
}

/**
 * Updates the status of an order (e.g. confirmed, cancelled).
 * @param {string} orderId
 * @param {string} status  e.g. "confirmed" | "cancelled"
 * @returns {Promise<object>}
 */
export async function updateOrderStatus(orderId, status) {
  const res = await authFetch(`${BASE_URL}/api/orders/${orderId}/status`, {
    method: "PATCH",
    body: JSON.stringify({ status }),
  });
  if (!res.ok) throw new Error("Failed to update order status.");
  return res.json();
}

/**
 * Deletes an order.
 * @param {string} orderId
 * @returns {Promise<void>}
 */
export async function deleteOrder(orderId) {
  const res = await authFetch(`${BASE_URL}/api/orders/${orderId}`, {
    method: "DELETE",
  });
  if (!res.ok) throw new Error("Failed to delete order.");
}

/**
 * Fetches all orders for a restaurant.
 * @param {string} restaurantId
 * @returns {Promise<Array>}
 */
export async function getRestaurantOrders(restaurantId) {
  const res = await authFetch(
    `${BASE_URL}/api/orders/restaurant/${restaurantId}`,
  );
  if (!res.ok) throw new Error("Failed to fetch orders.");
  const data = await res.json();
  console.log("Fetched orders:", data);
  return data;
}
