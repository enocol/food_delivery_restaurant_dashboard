import { useEffect } from "react";
import { startRingtone } from "../services/notificationSound";
import styles from "./NewOrderModal.module.css";

// Common keys that represent the order total
const TOTAL_KEYS = ["total", "subtotal", "amount", "totalAmount", "orderTotal"];

export default function NewOrderModal({ order, onClose }) {
  useEffect(() => {
    const stop = startRingtone();
    return stop;
  }, [order]);

  // Find the first total-like field present in the order
  const totalEntry = TOTAL_KEYS.map((k) => [k, order[k]]).find(([, v]) => v != null);

  // Show all fields except _receivedAt and the total field (shown in badge)
  const excludeKeys = new Set(["_receivedAt", ...(totalEntry ? [totalEntry[0]] : [])]);
  const fields = Object.entries(order).filter(([k]) => !excludeKeys.has(k));

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="New order received">
      <div className={styles.modal}>

        {/* Green header */}
        <div className={styles.header}>
          <span className={styles.headerIcon}>🔔</span>
          <h2 className={styles.headerTitle}>New Order!</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Dismiss">✕</button>
        </div>

        {/* Scrollable order fields */}
        <div className={styles.body}>
          <table className={styles.table}>
            <tbody>
              {fields.map(([key, value]) => (
                <tr key={key}>
                  <td className={styles.key}>{key}</td>
                  <td className={styles.value}>
                    {Array.isArray(value) ? (
                      <ul className={styles.itemList}>
                        {value.map((item, i) => (
                          <li key={i} className={styles.itemRow}>
                            <span className={styles.itemName}>{item.name ?? "—"}</span>
                            <span className={styles.itemQty}>×{item.quantity ?? item.qty ?? 1}</span>
                            <span className={styles.itemPrice}>{item.price ?? ""}</span>
                          </li>
                        ))}
                      </ul>
                    ) : key === "deliveryAddress" && value && typeof value === "object" ? (
                      <span className={styles.address}>
                        {[value.name, value.street, value.city].filter(Boolean).join(", ")}
                      </span>
                    ) : typeof value === "object" ? (
                      JSON.stringify(value)
                    ) : (
                      String(value)
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Subtotal badge — bottom-right corner */}
        {totalEntry && (
          <div className={styles.footer}>
            <span className={styles.totalBadge}>
              {totalEntry[0]}: {String(totalEntry[1])}
            </span>
          </div>
        )}

      </div>
    </div>
  );
}
