import React, { useEffect } from "react";
import styles from "./Register.module.css";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { GlobalContext } from "../../GlobalContext";
import { useContext } from "react";


import { useState } from "react";

const Register = () => {

  const { supabase } = useContext(GlobalContext);
  const [password, setPassword] = useState("Konrad123!");
  const [passwordConfirmation, setPasswordConfirmation] = useState("Konrad123!");
  const [email, setEmail] = useState("czadowa.mela@gmail.com");

  const [firstName, setFirstName] = useState("Mela");
  const [lastName, setLastName] = useState("Kot");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("Wolsztyn");

  const handleSignUp = async () => {

    if (password !== passwordConfirmation) {
      console.log("Hasła nie są takie same");
      return;
    }

    let { data, error } = await supabase.auth.signUp({
      email: email,
      password: password
    })

    if (error) {
      console.log(error)
      // alert("Nie udało się zalogować")
    } 

    if(data?.user) {
        console.log(data)
        const id = data.user.id;
        const { user, error } = await supabase
        .from('users')
        .insert([
          { user_id: id, name: firstName, surname: lastName, location: location },
        ])
        .select()
        if (error) {
          console.log(error)
          // alert("Nie udało się zalogować")
        }

        if(user) {
          console.log("kondek"+ user)
        }
      }
  }


  const locationOptions = [
    { value: "babimost", label: "Babimost" },
    { value: "wolsztyn", label: "Wolsztyn" },
    { value: "wroclaw", label: "Wrocław" },
    { value: "poznan", label: "Poznań" },
    { value: "gdansk", label: "Gdańsk" },
  ];

  const [role, setRole] = useState(""); // Przechowuje wybraną rolę
  const [isPetOwner, setIsPetOwner] = useState(false); // Sprawdza, czy użytkownik jest właścicielem zwierząt

  const handleRoleChange = (role) => {
    setRole(role);
    setIsPetOwner(role === "owner"); // Ustala, czy użytkownik jest właścicielem zwierząt
  };

  return (
    <div className={styles.page}>
    <header className={styles.header}>
      <a href="/" className={styles.homeLink}>
        Powrót do strony głównej
      </a>
    </header>
    <div className={styles.container}>
      <div className={styles.imageContainer}>
        <h2 className={styles.title}>Rejestracja</h2>
        <form className={styles.form}>
          <div className={styles.inputGroupRow}>
            <div className={styles.inputGroup}>
              <label htmlFor="firstName" className={styles.labelRegister}>
                Imię
              </label>
              <input
                type="text"
                id="firstName"
                className={styles.inputRegister}
                placeholder="Wpisz swoje imię"
                required
              />
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="lastName" className={styles.labelRegister}>
                Nazwisko
              </label>
              <input
                type="text"
                id="lastName"
                className={styles.inputRegister}
                placeholder="Wpisz swoje nazwisko"
                required
              />
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="email" className={styles.labelRegister}>
              Email
            </label>
            <input
              type="email"
              id="email"
              className={styles.inputLong}
              placeholder="Wpisz swój email"
              required
            />
          </div>

          <div className={styles.roleGroup}>
            <label className={styles.labelRegister}>Rola</label>
            <div className={styles.roleButtons}>
              <button
                type="button"
                className={`${styles.roleButton} ${role === "owner" && styles.selected}`}
                onClick={() => handleRoleChange("owner")}
              >
                Właściciel zwierząt - szukam opiekuna
              </button>
              <button
                type="button"
                className={`${styles.roleButton} ${role === "petsitter" && styles.selected}`}
                onClick={() => handleRoleChange("petsitter")}
              >
                Chcę opiekować się zwierzętami
              </button>
              <button
                type="button"
                className={`${styles.roleButton} ${role === "guest" && styles.selected}`}
                onClick={() => handleRoleChange("guest")}
              >
                Gość
              </button>
            </div>
          </div>

          {isPetOwner && (
            <div className={styles.inputGroup}>
              <label htmlFor="petSpecies" className={styles.labelRegister}>
                Wybierz gatunki zwierząt
              </label>
              <input
                type="text"
                id="petSpecies"
                className={styles.inputRegister}
                placeholder="Wpisz gatunki zwierząt"
                required
              />
            </div>
          )}

          <div className={styles.inputGroup}>
            <label htmlFor="location" className={styles.labelRegister}>
              Lokalizacja
            </label>
            <Select
            components={makeAnimated()}
            styles={{
              control: (base) => ({
                ...base,
                border: "2px solid #ccc",
                borderRadius: "25px",
                boxShadow: "none",
                width: "100%",
                cursor: "pointer",
              }),
            }}
            options={locationOptions}
            placeholder="Wybierz miasto"
          />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={styles.labelRegister}>
              Numer telefonu
            </label>
            <input
              type="tel"
              id="phone"
              className={styles.inputLong}
              placeholder="Wpisz swój numer telefonu"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="password" className={styles.labelRegister}>
              Hasło
            </label>
            <input
              type="password"
              id="password"
              className={styles.inputLong}
              placeholder="Wpisz swoje hasło"
              required
            />
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword" className={styles.labelRegister}>
              Powtórz hasło
            </label>
            <input
              type="password"
              id="confirmPassword"
              className={styles.inputLong}
              placeholder="Wpisz swoje hasło"
              required
            />
          </div>

          <button onClick={handleSignUp} className={styles.loginButton}>
            Zarejestruj się
          </button>
        </form>
      </div>
    </div>
    <footer className={styles.footer}>
      <p>&copy; Amelka</p>
    </footer>
  </div>
);
};

export default Register;
