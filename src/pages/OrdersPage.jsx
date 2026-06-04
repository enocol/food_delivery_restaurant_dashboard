import { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getRestaurantOrders } from "../api/restaurantApi";
import styles from "./OrdersPage.module.css";

export default function OrdersPage() {
  const { restaurantId } = useAuth();
  const { reconnectCount } = useSocket();
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    getRestaurantOrders(restaurantId)
      .then(setOrders)
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [restaurantId, reconnectCount]);

  return (
    <div className={`${styles.page} container-fluid px-3 px-sm-4 pt-3`}>
     <div className={styles.header}>
         <h1 className={styles.heading}>Orders</h1>
      <span className={styles.subheading}>
        Number of online orders: {orders? <span className="count">{orders.count}</span> : "—"}
      </span>
     </div>

      {loading && <p className={styles.info}>Loading orders…</p>}
      {error && <p className={styles.error}>{error}</p>}

      {!loading && !error && orders.count === 0 && (
        <p className={styles.info}>No orders yet.</p>
      )}

      {orders.count > 0 && (
        <div className={styles.tableWrapper}>
          <table className={styles.table}>
            <thead>
              <tr>
                <th>Order ID</th>
                <th>Customer</th>
                <th>Items</th>
                <th>Total</th>
                <th>Status</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.orders.map((order) => (
                <tr key={order.orderId ?? order.id}>
                  <td className={styles.idCell}>
                    {String(order.orderId ?? order.id).slice(-6)}
                  </td>
                  <td>{order.customer.phone ?? order.customer?.name ?? "—"}</td>
                  <td>
                    {Array.isArray(order.items)
                      ? order.items
                          .map((i) => `${i.name ?? i.product} ×${i.quantity ?? i.qty ?? 1}`)
                          .join(", ")
                      : "—"}
                  </td>
                  <td className={styles.totalCell}>
                    {order.total ?? order.totalAmount ?? "—"}
                  </td>
                  <td>
                    <span
                      className={
                        styles[
                          `status_${(order.status ?? "pending").toLowerCase()}`
                        ] ?? styles.status_pending
                      }
                    >
                      {order.status ?? "pending"}
                    </span>
                  </td>
                  <td className={styles.timeCell}>
                    {order.createdAt
                      ? new Date(order.createdAt).toLocaleString()
                      : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
