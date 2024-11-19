import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginSignUp.module.css";
import {GlobalContext} from "../../GlobalContext";

const LoginSignUp = () => {

  const {supabase} = useContext(GlobalContext);
  
  const[password, setPassword] = useState("");
  const[email, setEmail] = useState("");
  const navigate = useNavigate();

  const [role, setRole] = useState(""); // Przechowuje wybraną rolę
  const [isPetOwner, setIsPetOwner] = useState(false); // Sprawdza, czy użytkownik jest właścicielem zwierząt

  const handleRoleChange = (event) => {
    setRole(event.target.value);
    setIsPetOwner(event.target.value === "owner"); // Ustala, czy użytkownik jest właścicielem zwierząt
  };

  const handleRegister = async (event) => {
        // email: 'amelia.draga@gmail.com',
        // password: '123456'
    let { data, error } = await supabase.auth.signInWithPassword({
        email: 'amelia.draga@gmail.com',
        password: '123456'
      })
      console.log(data, error)
    };

    const handleSignUp = async (event) => {
      navigate("/mainPage");
    }


  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <a href="/" className={styles.homeLink}>Wróć do strony głównej</a>
      </header>
      <div className={styles.container}>
        <div className={styles.imageContainer}>
          <div className={styles.formContainer}>
            <h2 className={styles.title}>Zarejestruj się</h2>
            <form className={styles.form}>
              <div className={styles.inputGroupRow}>
                <div className={styles.inputGroup}>
                  <label htmlFor="firstName" className={styles.label}>Imię</label>
                  <input type="text" id="firstName" className={styles.input} placeholder="Wpisz swoje imię" required />
                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="lastName" className={styles.label}>Nazwisko</label>
                  <input type="text" id="lastName" className={styles.input} placeholder="Wpisz swoje nazwisko" required />
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input type="email" id="email" className={styles.inputLong} placeholder="Wpisz swój email" required />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="role" className={styles.label}>Rola</label>
                <select id="role" className={styles.input} value={role} onChange={handleRoleChange} required>
                  <option value="">Wybierz rolę</option>
                  <option value="user">Opiekun</option>
                  <option value="owner">Właściciel</option>
                </select>
              </div>

              {isPetOwner && (
                <>
                  <div className={styles.inputGroup}>
                    <label htmlFor="petSpecies" className={styles.label}>Wybierz gatunki zwierząt</label>
                    <input type="text" id="petSpecies" className={styles.input} placeholder="Wpisz gatunki zwierząt" required />
                  </div>
                </>
              )}

                  <div className={styles.inputGroup}>
                    <label htmlFor="location" className={styles.label}>Lokalizacja</label>
                    <input type="text" id="location" className={styles.input} placeholder="Wpisz swoją lokalizację" required />
                  </div>

                  <div className={styles.inputGroup}>
                    <label htmlFor="phone" className={styles.label}>Numer telefonu</label>
                    <input type="tel" id="phone" className={styles.input} placeholder="Wpisz swój numer telefonu" required />
                  </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Hasło</label>
                <input type="password" id="password" className={styles.input} placeholder="Wpisz swoje hasło" required />
              </div>

              <div className={styles.inputGroup}>
                <label htmlFor="password" className={styles.label}>Powtórz hasło</label>
                <input type="password" id="password" className={styles.input} placeholder="Wpisz swoje hasło" required />
              </div>

              <button onClick={handleRegister} type="submit" className={styles.loginButton}>Zaloguj</button>
            </form>

            <div className={styles.links}>
              <a href="#" className={styles.link}>Other ways to sign in</a><br/>
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
