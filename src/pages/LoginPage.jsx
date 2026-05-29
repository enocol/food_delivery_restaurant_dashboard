import { useState } from "react";
import { loginRestaurant } from "../api/restaurantApi";
import { useAuth } from "../context/AuthContext";
import styles from "./LoginPage.module.css";

export default function LoginPage() {
  const { saveLoginData } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const data = await loginRestaurant(email, password);
      saveLoginData({
        token: data.token,
        restaurantName: data.restaurantName,
        restaurantId: data.restaurantId,
      });
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className={styles.page}>
      <div className="container-fluid px-3 px-sm-4">
        <div className="row justify-content-center">
          <div className="col-12 col-sm-9 col-md-7 col-lg-5 col-xl-4">
            <div className={styles.card}>
              <div className={styles.logo}>🍽️</div>
              <h1 className={styles.title}>Restaurant Dashboard</h1>
              <p className={styles.subtitle}>Sign in to manage your restaurant</p>

              <form className={styles.form} onSubmit={handleSubmit} noValidate>
                <div className={styles.field}>
                  <label htmlFor="email" className={styles.label}>
                    Email
                  </label>
                  <input
                    id="email"
                    type="email"
                    className={styles.input}
                    placeholder="you@restaurant.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    autoComplete="email"
                  />
                </div>

                <div className={styles.field}>
                  <label htmlFor="password" className={styles.label}>
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className={styles.input}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    autoComplete="current-password"
                  />
                </div>

                {error && <p className={styles.error}>{error}</p>}

                <div className="d-grid">
                  <button type="submit" className={styles.btn} disabled={loading}>
                    {loading ? "Signing in…" : "Sign In"}
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
