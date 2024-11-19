import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { GlobalContext } from "../../GlobalContext";

const LoginSignUp = () => {
  const { supabase } = useContext(GlobalContext);
  const [password, setPassword] = useState("");
  const [email, setEmail] = useState("");
  const navigate = useNavigate();

  return (
    <div className={styles.page}>
        <div className={styles.mainContainer}>
            <div className={styles.leftContainer}></div>
            <div className={styles.rightContainer}>
                <header className={styles.header}>
                        <a href="/" className={styles.homeLink}>Powrót do strony głównej</a>
                    </header>
                <div className={styles.imageContainer}>
                    <h2 className={styles.title}>Zaloguj się</h2>
                    <form className={styles.form}>
                        <div className={styles.inputGroup}>
                            <label htmlFor="email" className={styles.labelRegister}>Email</label>
                            <input
                            type="email"
                            id="email"
                            className={styles.inputLong}
                            placeholder="Wpisz swój email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            />
                        </div>

                        <div className={styles.inputGroup}>
                            <label htmlFor="password" className={styles.labelRegister}>Hasło</label>
                            <input
                            type="password"
                            id="password"
                            className={styles.inputLong}
                            placeholder="Wpisz swoje hasło"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            />
                        </div>

                        <button type="submit" className={styles.loginButton}>Zaloguj</button>
                    </form>

                    <div className={styles.links}>
                        <a href="#" className={styles.link}>Other ways to sign in</a>
                        <a href="#" className={styles.link}>Forgot your password?</a>
                    </div>

                    <button className={styles.createAccountButton}>Create an account</button>
                </div>
            </div>
        </div>
      <footer className={styles.footer}>
        <p>&copy; Amelka</p>
      </footer>
    </div>
  );
};

export default LoginSignUp;
