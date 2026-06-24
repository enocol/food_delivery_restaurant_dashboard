import { useState, useEffect, useCallback, useRef } from "react";
import { Outlet, NavLink } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useSocket } from "../context/SocketContext";
import { disconnectSocket } from "../services/socket";
import NewOrderModal from "./NewOrderModal";
import styles from "./DashboardLayout.module.css";

const STATUS_KEY = "restaurant_status";

export default function DashboardLayout() {
  const { clearToken } = useAuth();
  const { connected, serverReady, orders } = useSocket();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [queue, setQueue] = useState([]);
  const processedLengthRef = useRef(0);

  // Shift the first item off the queue (called on close / accept / reject)
  const closeModal = useCallback(() => setQueue((prev) => prev.slice(1)), []);

  // Enqueue newly arrived orders; reset if orders were cleared (e.g. on logout)
  useEffect(() => {
    if (orders.length < processedLengthRef.current) {
      // orders array was reset
      processedLengthRef.current = 0;
      setQueue([]);
      return;
    }
    const newCount = orders.length - processedLengthRef.current;
    if (newCount === 0) return;
    // orders are prepended newest-first; reverse so we queue oldest-first
    const incoming = orders.slice(0, newCount).reverse();
    setQueue((prev) => [...prev, ...incoming]);
    processedLengthRef.current = orders.length;
  }, [orders.length]);

  function handleLogout() {
    disconnectSocket();
    localStorage.removeItem(STATUS_KEY);
    clearToken();
  }

  return (
    <>
      {queue.length > 0 && (
        <NewOrderModal order={queue[0]} pending={queue.length - 1} onClose={closeModal} />
      )}

      {/* Mobile backdrop — closes sidebar on outside click */}
      {sidebarOpen && (
        <div className={styles.backdrop} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Left sidebar */}
      <nav
        className={`${styles.sidebar} ${sidebarOpen ? styles.sidebarVisible : ""}`}
        aria-label="Main navigation"
      >
        <div className={styles.sidebarBrand}>🍽 Dashboard</div>
        <ul className={styles.navList}>
          <li>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              🏠 Home
            </NavLink>
          </li>
          <li>
            <NavLink
              to="/orders"
              className={({ isActive }) =>
                `${styles.navLink}${isActive ? ` ${styles.navLinkActive}` : ""}`
              }
              onClick={() => setSidebarOpen(false)}
            >
              📋 Orders
            </NavLink>
          </li>
        </ul>
      </nav>

      {/* Hamburger button — mobile only */}
      <button
        className={styles.hamburger}
        onClick={() => setSidebarOpen((o) => !o)}
        aria-label={sidebarOpen ? "Close menu" : "Open menu"}
        aria-expanded={sidebarOpen}
      >
        {sidebarOpen ? "✕" : "☰"}
      </button>

      {/* Fixed top-right header */}
      <header
        className={`${styles.header} position-fixed top-0 end-0 d-flex align-items-center gap-2 p-2 p-sm-3`}
      >
        <span className={serverReady ? styles.badgeOnline : styles.badgeOffline}>
          {serverReady ? "● Live" : connected ? "○ Connecting…" : "○ Disconnected"}
        </span>
        <button className={styles.logoutBtn} onClick={handleLogout}>
          Log out
        </button>
      </header>

      {/* Page content — each route renders here */}
      <main className={styles.page}>
        <Outlet />
      </main>
    </>
  );
}
