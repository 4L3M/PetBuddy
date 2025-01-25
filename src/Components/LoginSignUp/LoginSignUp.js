import React, { useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./LoginSignUp.module.css";
import {GlobalContext} from "../../GlobalContext";

const LoginSignUp = () => {

  const {supabase} = useContext(GlobalContext);
  
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [email, setEmail] = useState("");
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [role, setRole] = useState("");
  const [location, setLocation] = useState("");
  const [phone, setPhone] = useState("");
  const [petSpecies, setPetSpecies] = useState("");
  const [isPetOwner, setIsPetOwner] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();

  const handleRoleChange = (event) => {
    setRole(event.target.value);
    setIsPetOwner(event.target.value === "owner"); // Ustala, czy użytkownik jest właścicielem zwierząt
  };

  const capitalizeWords = (text) => {
    return text
      .split(" ")
      .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(" ");
  };

  const handleFirstNameChange = (event) => {
    const formattedName = capitalizeWords(event.target.value);
    setFirstName(formattedName);
  };

  const handleLastNameChange = (event) => {
    const formattedName = capitalizeWords(event.target.value);
    setLastName(formattedName);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!firstName.trim()) newErrors.firstName = "Imię jest wymagane.";
    if (!lastName.trim()) newErrors.lastName = "Nazwisko jest wymagane.";
    if (!email.trim() || !/\S+@\S+\.\S+/.test(email)) newErrors.email = "Podaj poprawny email.";
    if (!password || password.length < 6)
      newErrors.password = "Hasło musi mieć co najmniej 6 znaków.";
    if (password !== confirmPassword)
      newErrors.confirmPassword = "Hasła muszą się zgadzać.";
    if (!location.trim()) newErrors.location = "Lokalizacja jest wymagana.";
    if (!phone.trim() || !/^\d{9,15}$/.test(phone)) newErrors.phone = "Podaj poprawny numer telefonu.";
    if (isPetOwner && !petSpecies.trim())
      newErrors.petSpecies = "Podaj gatunki zwierząt.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

    const handleRegister = async (event) => {
      event.preventDefault();

      if (!validateForm()) return;

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
      });

      if (error) {
        setErrors({ general: "Rejestracja nie powiodła się. Spróbuj ponownie." });
        console.error(error);
      } else {
        navigate("/mainPage");
      }
    };


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
                  <input 
                    type="text" 
                    id="firstName" 
                    className={styles.input} 
                    placeholder="Wpisz swoje imię" 
                    required
                    value={firstName}
                    onChange={handleFirstNameChange}
                  />
                  {errors.firstName && <p className={styles.error}>{errors.firstName}</p>}

                </div>

                <div className={styles.inputGroup}>
                  <label htmlFor="lastName" className={styles.label}>Nazwisko</label>
                  <input 
                    type="text" 
                    id="lastName" 
                    className={styles.input} 
                    placeholder="Wpisz swoje nazwisko" 
                    required 
                    value={lastName}
                    onChange={handleLastNameChange}
                  />
                  {errors.lastName && <p className={styles.error}>{errors.lastName}</p>}
                </div>
              </div>
              <div className={styles.inputGroup}>
                <label htmlFor="email" className={styles.label}>Email</label>
                <input 
                  type="email" 
                  id="email" 
                  className={styles.inputLong} 
                  placeholder="Wpisz swój email" 
                  required />
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
             
            </div>
            
            <button onClick={navigate("/register" )} className={styles.createAccountButton}>Create an account</button>
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
