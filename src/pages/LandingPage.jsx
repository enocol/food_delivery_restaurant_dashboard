import { useState, useEffect } from "react";
import { getRestaurantStatus, setRestaurantOpen } from "../api/restaurantApi";
import OpenRestaurantButton from "../components/OpenRestaurantButton";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import styles from "./LandingPage.module.css";

const STATUS_KEY = "restaurant_status";

export default function LandingPage() {
  const { restaurantName, restaurantId } = useAuth();
  const { orders } = useSocket();

  const [restaurant, setRestaurant] = useState(() => {
    try {
      const cached = localStorage.getItem(STATUS_KEY);
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });
  const [loading, setLoading] = useState(() => !localStorage.getItem(STATUS_KEY));
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState(null);

  // Always fetch the real status from the server on mount.
  useEffect(() => {
    getRestaurantStatus(restaurantId)
      .then((data) => {
        setRestaurant(data.restaurant);
        localStorage.setItem(STATUS_KEY, JSON.stringify(data.restaurant));
      })
      .catch(() => setError("Could not load restaurant data. Is the server running?"))
      .finally(() => setLoading(false));
  }, []);

  async function handleToggle() {
    if (!restaurant) return;
    setUpdating(true);
    setError(null);
    try {
      const updated = await setRestaurantOpen(restaurantId, !restaurant.isOpen);
      setRestaurant(updated);
      localStorage.setItem(STATUS_KEY, JSON.stringify(updated));
    } catch {
      setError("Failed to update status. Please try again.");
    } finally {
      setUpdating(false);
    }
  }

  return (
    <div className="container-fluid px-3 px-sm-4">
      {/* Status card */}
      <div className="row justify-content-center">
        <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
          <div className={styles.card}>
            <h1 className={styles.title}>{restaurantName}</h1>

            {loading && <p className={styles.info}>Loading restaurant data…</p>}

            {!loading && restaurant && (
              <>
                <p className={styles.statusLabel}>
                  Status:{" "}
                  <span className={restaurant.isOpen ? styles.statusOpen : styles.statusClosed}>
                    {restaurant.isOpen ? "Open" : "Closed"}
                  </span>
                </p>
                <div className="d-grid">
                  <OpenRestaurantButton
                    isOpen={restaurant.isOpen}
                    loading={updating}
                    onClick={handleToggle}
                  />
                </div>
              </>
            )}

            {error && <p className={styles.error}>{error}</p>}
          </div>
        </div>
      </div>

      {/* Orders feed */}
      {orders.length > 0 && (
        <div id="orders" className="row justify-content-center mt-3 mt-md-4">
          <div className="col-12 col-sm-10 col-md-8 col-lg-6 col-xl-5">
            <div className={styles.eventFeed}>
              <h2 className={styles.eventTitle}>New Orders ({orders.length})</h2>
              <ul className={styles.eventList}>
                {orders.map((order, i) => (
                  <li key={i} className={styles.eventItem}>
                    <span className={styles.eventTime}>{order._receivedAt}</span>
                    <span className={styles.eventMsg}>
                      {JSON.stringify(order, (k, v) => k === "_receivedAt" ? undefined : v)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
