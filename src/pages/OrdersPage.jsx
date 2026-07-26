import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { getRestaurantOrders, updateOrderStatus, deleteOrder } from "../api/restaurantApi";
import styles from "./OrdersPage.module.css";

export default function OrdersPage() {
  const { restaurantId } = useAuth();
  const { reconnectCount, ordersVersion } = useSocket();
  const [orders, setOrders] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [actioning, setActioning] = useState({});

  const fetchOrders = useCallback(async () => {
    setError(null);
    const fresh = await getRestaurantOrders(restaurantId);
    setOrders(fresh);
  }, [restaurantId]);

  useEffect(() => {
    setLoading(true);
    fetchOrders()
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [fetchOrders, reconnectCount, ordersVersion]);

  async function handleStatusChange(orderId, status) {
    setActioning((prev) => ({ ...prev, [orderId]: true }));
    try {
      await updateOrderStatus(orderId, status);
      const fresh = await getRestaurantOrders(restaurantId);
      setOrders(fresh);
    } catch (err) {
      console.error(err);
    } finally {
      setActioning((prev) => ({ ...prev, [orderId]: false }));
    }
  }

  async function handleDelete(orderId) {
    setActioning((prev) => ({ ...prev, [orderId]: true }));
    try {
      await deleteOrder(orderId);
      const fresh = await getRestaurantOrders(restaurantId);
      setOrders(fresh);
    } catch (err) {
      console.error(err);
    } finally {
      setActioning((prev) => ({ ...prev, [orderId]: false }));
    }
  }

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
                <th>Actions</th>
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
                  <td className={styles.actionsCell}>
                    {(() => {
                      const id = order.orderId ?? order.id;
                      const busy = !!actioning[id];
                      const status = (order.status ?? "pending").toLowerCase();
                      if (status === "pending") {
                        return (
                          <div className={styles.actionBtns}>
                            <button
                              className={styles.btnConfirm}
                              disabled={busy}
                              onClick={() => handleStatusChange(id, "confirmed")}
                            >
                              Confirm
                            </button>
                            <button
                              className={styles.btnReject}
                              disabled={busy}
                              onClick={() => handleStatusChange(id, "cancelled")}
                            >
                              Reject
                            </button>
                          </div>
                        );
                      }
                      if (status === "confirmed") {
                        return (
                          <button
                            className={styles.btnReady}
                            disabled={busy}
                            onClick={() => handleStatusChange(id, "ready_for_pickup")}
                          >
                            Mark Ready
                          </button>
                        );
                      }
                      if (status === "cancelled") {
                        return (
                          <button
                            className={styles.btnDelete}
                            disabled={busy}
                            onClick={() => handleDelete(id)}
                          >
                            Delete
                          </button>
                        );
                      }
                      return <span className={styles.noAction}>—</span>;
                    })()}
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
