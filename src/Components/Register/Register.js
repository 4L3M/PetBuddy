import React, { useEffect } from "react";
import styles from "./Register.module.css";
import Select from "react-select";
import makeAnimated from 'react-select/animated';
import { GlobalContext } from "../../GlobalContext";
import { useContext } from "react";
import { useNavigate } from "react-router-dom";

import { useState } from "react";

const Register = () => {

  const navigate = useNavigate();

  const { supabase } = useContext(GlobalContext);
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [email, setEmail] = useState("");

  const [name, setName] = useState("");
  const [surname, setSurname] = useState("");
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");

  const [role, setRole] = useState(""); // Przechowuje wybraną rolę
  const [isPetOwner, setIsPetOwner] = useState(false); // Sprawdza, czy użytkownik jest właścicielem zwierząt

  const animalOptions = [
    { value: "Kot", label: "Kot" },
    { value: "Pies", label: "Pies" },
    { value: "Inne", label: "Inne" },
  ];

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (password !== passwordConfirmation) {
      console.log("Hasła nie są takie same");
      return;
    }

    // Rejestracja użytkownika
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

        // WWstawienie danych do tabeli users_details
        const { user, error } = await supabase
        .from('users_details')
        .insert([
          { user_id: id, 
            name: name,
            account_type: role,
            surname: surname,
            location: location
          },
        ])

        .select()
        if (error) {
          console.log(error)
          // alert("Nie udało się zalogować")
        }
        else navigate('/');


        
      }
  }


  const locationOptions = [
    { value: "Babimost", label: "Babimost" },
    { value: "Wolsztyn", label: "Wolsztyn" },
    { value: "Wroclaw", label: "Wrocław" },
    { value: "Gdańsk", label: "Gdańsk" },
  ];


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
                value={name}
                onChange={(e) => setName(e.target.value)}
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
                value={surname}
                onChange={(e) => setSurname(e.target.value)}
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
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>

          <div className={styles.roleGroup}>
            <label className={styles.labelRegister}>Rola</label>
            <div className={styles.roleButtons}>
              <button
                type="button"
                className={`${styles.roleButton} ${role === "owner" && styles.selected}`}
               // value={role}
                onClick={() => handleRoleChange("owner")}
              >
                Właściciel zwierząt - szukam opiekuna
              </button>
              <button
                type="button"
                className={`${styles.roleButton} ${role === "petsitter" && styles.selected}`}
                // value={role}
                onClick={() => handleRoleChange("petsitter")}
              >
                Chcę opiekować się zwierzętami
              </button>
            </div>
          </div>

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
                onChange={(selectedOption) => setLocation(selectedOption?.value)}
              />
            </div>

          {/* {isPetOwner && (
            <div className={styles.inputGroup}>
              <label htmlFor="petSpecies" className={styles.labelRegister}>
                Wybierz gatunki zwierząt
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
                options={animalOptions}
                placeholder="Wybierz gatunek"
                onChange={(selectedOption) => setLocation(selectedOption?.value)}
              />
            </div>
          )} */}

          <div className={styles.inputGroup}>
            <label htmlFor="phone" className={styles.labelRegister}>
              Numer telefonu
            </label>
            <input
              type="tel"
              id="phone"
              className={styles.inputLong}
              placeholder="Wpisz swój numer telefonu"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
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
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
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
