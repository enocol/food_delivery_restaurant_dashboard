import styles from "./OpenRestaurantButton.module.css";

/**
 * Button that toggles the restaurant's open/closed state.
 *
 * Props:
 *   isOpen    {boolean}           – current status
 *   loading   {boolean}           – disables button while request is in-flight
 *   onClick   {() => void}        – called when the button is pressed
 */
export default function OpenRestaurantButton({ isOpen, loading, onClick }) {
  return (
    <button
      className={`${styles.btn} ${isOpen ? styles.open : styles.closed}`}
      onClick={onClick}
      disabled={loading}
      aria-label={isOpen ? "Mark restaurant as closed" : "Mark restaurant as open"}
    >
      {loading
        ? "Updating…"
        : isOpen
        ? "Close Restaurant"
        : "Open Restaurant"}
    </button>
  );
}
