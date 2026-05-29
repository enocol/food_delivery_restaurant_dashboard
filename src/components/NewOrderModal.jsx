import { useEffect } from "react";
import { startRingtone } from "../services/notificationSound";
import styles from "./NewOrderModal.module.css";

export default function NewOrderModal({ order, onClose }) {
  // Start ringtone when modal opens; stop it when dismissed or replaced by a newer order
  useEffect(() => {
    const stop = startRingtone();
    return stop;
  }, [order]);

  const fields = Object.entries(order).filter(([k]) => k !== "_receivedAt");

  return (
    <div className={styles.overlay} role="dialog" aria-modal="true" aria-label="New order received">
      <div className={styles.modal}>
        <div className={styles.topRow}>
          <span className={styles.icon}>🔔</span>
          <h2 className={styles.title}>New Order!</h2>
          <button className={styles.closeBtn} onClick={onClose} aria-label="Dismiss">✕</button>
        </div>

        <p className={styles.receivedAt}>Received at {order._receivedAt}</p>

        <table className={styles.table}>
          <tbody>
            {fields.map(([key, value]) => (
              <tr key={key}>
                <td className={styles.key}>{key}</td>
                <td className={styles.value}>
                  {typeof value === "object" ? JSON.stringify(value) : String(value)}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
