import React, { useState, useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./Login.module.css";
import { GlobalContext } from "../../GlobalContext";

const Login = () => {
    const { supabase } = useContext(GlobalContext);
    const [password, setPassword] = useState("Konrad123!");
    const [email, setEmail] = useState("amelia.draga@gmail.com");
    const navigate = useNavigate();

    const handleLogin = async () => {      
        let { data, error } = await supabase.auth.signInWithPassword({
            email: email,
            password: password
        })    
        if (error) {
            console.log(error)
            // alert("Nie udało się zalogować")
        } 
        if(data) {
            console.log(data)
        }
    }

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
                    <div className={styles.form}>
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

                        <button onClick={handleLogin} className={styles.loginButton}>Zaloguj</button>
                    </div>

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

export default Login;
