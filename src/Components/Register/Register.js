import React, { useContext, useState } from "react";
import styles from "./Register.module.css";
import Select from "react-select";
import makeAnimated from "react-select/animated";
import { GlobalContext } from "../../GlobalContext";
import { useNavigate } from "react-router-dom";

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
  const [formErrors, setFormErrors] = useState({}); // Przechowuje błędy dla pól formularza

  const locationOptions = [
    { value: "Babimost", label: "Babimost" },
    { value: "Wolsztyn", label: "Wolsztyn" },
    { value: "Wroclaw", label: "Wrocław" },
    { value: "Gdańsk", label: "Gdańsk" },
  ];

  // Funkcja do formatowania imienia i nazwiska
  const capitalizeWords = (text) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const validateForm = () => {
    const errors = {};

    // Walidacja imienia
    if (!name.trim()) {
      errors.name = "Imię jest wymagane.";
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(name)) {
      errors.name = "Imię może zawierać tylko litery.";
    }    
    // Walidacja nazwiska
    if (!surname.trim()) {
      errors.surname = "Nazwisko jest wymagane.";
    } else if (!/^[A-Za-zÀ-ÿ\s]+$/.test(surname)) {
      errors.surname = "Nazwisko może zawierać tylko litery.";
    }

    // Walidacja email
    if (!email.trim()) {
      errors.email = "Email jest wymagany.";
    } else if (
      !/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/.test(email)
    ) {
      errors.email = "Podaj poprawny adres e-mail.";
    }
    if (!role) errors.role = "Wybierz swoją rolę.";
    if (!location) errors.location = "Wybierz lokalizację.";
    // Walidacja telefonu
    if (!phone.trim()) {
      errors.phone = "Numer telefonu jest wymagany.";
    } else if (!/^\d{9}$/.test(phone)) {
      errors.phone = "Numer telefonu musi zawierać dokładnie 9 cyfr.";
    }

      // Walidacja hasła
  if (!password.trim()) {
    errors.password = "Hasło jest wymagane.";
  } else if (password.length < 6) {
    errors.password = "Hasło musi mieć co najmniej 6 znaków.";
  } else if (!/[A-Z]/.test(password)) {
    errors.password = "Hasło musi zawierać co najmniej jedną wielką literę.";
  } else if (!/[0-9]/.test(password)) {
    errors.password = "Hasło musi zawierać co najmniej jedną cyfrę.";
  } else if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    errors.password = "Hasło musi zawierać co najmniej jeden znak specjalny.";
  }

  // Walidacja potwierdzenia hasła
  if (password !== passwordConfirmation) {
    errors.passwordConfirmation = "Hasła nie są takie same.";
  }

    setFormErrors(errors);
    return Object.keys(errors).length === 0; // Zwraca true, jeśli brak błędów
  };

  const handleSignUp = async (event) => {
    event.preventDefault();

    if (!validateForm()) return;

    // Rejestracja użytkownika
    let { data, error } = await supabase.auth.signUp({
      email: email,
      password: password,
    });

    if (error) {
      setFormErrors({ email: "Błąd rejestracji: " + error.message });
      return;
    }

    if (data?.user) {
      console.log(data);
      const id = data.user.id;

      // Wstawienie danych do tabeli `users_details`
      const { error } = await supabase
        .from("users_details")
        .insert([
          {
            user_id: id,
            name: capitalizeWords(name),
            surname: capitalizeWords(surname),
            account_type: role,
            location: location,
          },
        ])
        .select();

      if (error) {
        setFormErrors({
          general: "Błąd podczas zapisywania danych: " + error.message,
        });
      } else {
        navigate("/");
      }
    }
  };

  const handleRoleChange = (role) => {
    setRole(role);
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
          {formErrors.general && (
            <div className={styles.errorMessage}>{formErrors.general}</div>
          )}
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
                  onChange={(e) => setName(capitalizeWords(e.target.value))}
                  required
                />
                {formErrors.name && (
                  <div className={styles.errorText}>{formErrors.name}</div>
                )}
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
                  onChange={(e) => setSurname(capitalizeWords(e.target.value))}
                  required
                />
                {formErrors.surname && (
                  <div className={styles.errorText}>{formErrors.surname}</div>
                )}
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
              {formErrors.email && (
                <div className={styles.errorText}>{formErrors.email}</div>
              )}
            </div>

            <div className={styles.roleGroup}>
              <label className={styles.labelRegister}>Rola</label>
              <div className={styles.roleButtons}>
                <button
                  type="button"
                  className={`${styles.roleButton} ${
                    role === "owner" && styles.selected
                  }`}
                  onClick={() => handleRoleChange("owner")}
                >
                  Właściciel zwierząt - szukam opiekuna
                </button>
                <button
                  type="button"
                  className={`${styles.roleButton} ${
                    role === "petsitter" && styles.selected
                  }`}
                  onClick={() => handleRoleChange("petsitter")}
                >
                  Chcę opiekować się zwierzętami
                </button>
              </div>
              {formErrors.role && (
                <div className={styles.errorText}>{formErrors.role}</div>
              )}
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
                onChange={(selectedOption) =>
                  setLocation(selectedOption?.value || "")
                }
              />
              {formErrors.location && (
                <div className={styles.errorText}>{formErrors.location}</div>
              )}
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
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
              />
              {formErrors.phone && (
                <div className={styles.errorText}>{formErrors.phone}</div>
              )}
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
              {formErrors.password && (
                <div className={styles.errorText}>{formErrors.password}</div>
              )}
            </div>

            <div className={styles.inputGroup}>
              <label htmlFor="confirmPassword" className={styles.labelRegister}>
                Powtórz hasło
              </label>
              <input
                type="password"
                id="confirmPassword"
                className={styles.inputLong}
                placeholder="Powtórz hasło"
                value={passwordConfirmation}
                onChange={(e) => setPasswordConfirmation(e.target.value)}
                required
              />
              {formErrors.passwordConfirmation && (
                <div className={styles.errorText}>
                  {formErrors.passwordConfirmation}
                </div>
              )}
            </div>

            <button
              type="submit"
              onClick={handleSignUp}
              className={styles.submitButton}
            >
              Zarejestruj się
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;
