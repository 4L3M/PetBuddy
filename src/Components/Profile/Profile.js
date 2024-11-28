import styles from './Profile.module.css';
import { React, useContext, useEffect, useState } from 'react';
import logo from '../Assets/logo.png';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';

const Profile = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [surname, setSurname] = useState("");
    const [phone , setPhone] = useState("");
    const [location, setLocation] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [passwordConfirmation, setPasswordConfirmation] = useState("");
    const [accountType, setAccountType] = useState(""); // Typ konta
    const [userId, setUserId] = useState("");

    const locationOptions = [
      { value: "Babimost", label: "Babimost" },
      { value: "Wolsztyn", label: "Wolsztyn" },
      { value: "Wroclaw", label: "Wrocław" },
      { value: "Gdańsk", label: "Gdańsk" },
    ];

        // Opcje dla account_type
    const accountTypes = [
        { value: "owner", label: "Właściciel zwierząt" },
        { value: "petsitter", label: "Opiekun zwierząt" },
    ];

    const [selectedLocations, setSelectedLocations] = useState([]);
    const [selectedAccountTypes, setSelectedAccountTypes] = useState([]);
    
    const handleLocationSelection = (location) => {
      setSelectedLocations((prev) =>
        prev.includes(location)
          ? prev.filter((loc) => loc !== location) // Usuń, jeśli już zaznaczone
          : [...prev, location] // Dodaj, jeśli jeszcze nie zaznaczone
      );
     // console.log(selectedLocations);
    };
    
    const handleAccountTypeSelection = (type) => {
      setSelectedAccountTypes((prev) =>
        prev.includes(type)
          ? prev.filter((t) => t !== type) // Usuń, jeśli już zaznaczone
          : [...prev, type] // Dodaj, jeśli jeszcze nie zaznaczone
      );
    };
    
    

    // Pobieranie danych użytkownika
    useEffect(() => {
        const fetchUserData = async () => {
        const sessionResponse = await supabase.auth.getSession();
        const session = sessionResponse.data.session;

        if (session) {
            const user = session.user;
            setUserId(user.id);
            setEmail(user.email);

            // Pobranie szczegółowych danych użytkownika z tabeli `users_details`
            let { data: userDetails, error } = await supabase
            .from("users_details")
            .select("*")
            .eq("user_id", user.id);

            if (error) {
            console.error("Błąd podczas pobierania danych użytkownika:", error);
            } else if (userDetails && userDetails.length > 0) {
            setName(userDetails[0].name);
            setSurname(userDetails[0].surname);
            setPhone(userDetails[0].phone);
            setLocation(userDetails[0].location);
            setAccountType(userDetails[0].account_type); // Pobranie account_type
            }
        } else {
            navigate("/login"); // Jeśli użytkownik nie jest zalogowany, przekieruj na stronę logowania
        }
        };

        fetchUserData();
    }, [supabase, navigate]);

    // Aktualizacja danych użytkownika
    const handleUpdateProfile = async (event) => {
        event.preventDefault();

        if (!userId) {
        console.error("Brak ID użytkownika. Nie można zaktualizować danych.");
        return;
        }

        // Aktualizacja danych użytkownika w tabeli `users_details`
        const { data, error } = await supabase
        .from('users_details')
        .update({
              name: name,
              surname: surname,
              phone: phone,
              location: location,
              account_type: accountType,
          })
        .eq("user_id", userId)
        .select();
      
        if (error) {
          if (error) {
            console.error("Błąd podczas aktualizacji danych użytkownika:", error.message);
            console.error("Szczegóły błędu:", error.details);
            console.error("Sugestie:", error.hint);
          } else {
            console.log("Dane użytkownika zostały pomyślnie zaktualizowane:", data);
            console.log(data);
        }
      }
    };


        // Zmiana hasła
    const handleChangePassword = async () => {
        const { error } = await supabase.auth.updateUser({ password: password });

        if (error) {
        console.error("Błąd podczas zmiany hasła:", error);
        } else {
        console.log("Hasło zostało zmienione.");
        }
    };


    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <img src={logo} className={styles.logo} alt="logo" />
                <h1>Twój profil</h1>
                <button 
                    onClick={() => navigate("/")} 
                    className={styles.logoutButton}>
                        Powrót do strony głównej
                </button>
            </header>

{/* Main Content */}
<form 
    className={styles.profileForm} 
    onSubmit={handleUpdateProfile}>
        <div className={styles.inputGroup}>
          <label htmlFor="email">Email</label>
          <input
            type="email"
            id="email"
            value={email}
            disabled
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="name">Imię</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="surname">Nazwisko</label>
          <input
            type="text"
            id="surname"
            value={surname}
            onChange={(e) => setSurname(e.target.value)}
            required
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="phone">Numer telefonu</label>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            
          />
        </div>

        <div className={styles.inputGroup}>
          <label htmlFor="location">Lokalizacja</label>
          <div className={styles.buttonGroup}>
            {['Babimost', 'Wolsztyn'].map((loc) => (
              <button
                key={loc}
                type="button"
                className={`${styles.typeButton} ${
                  location === loc ? styles.active : ''
                }`}
                onClick={() => setLocation(loc)}
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        <div className={styles.inputGroup}>
          <label>Typ konta</label>
          <div className={styles.buttonGroup}>
            {['owner', 'sitter'].map((type) => (
              <button
                key={type}
                type="button"
                className={`${styles.typeButton} ${
                  selectedAccountTypes.includes(type) ? styles.active : ''
                }`}
                onClick={() => handleAccountTypeSelection(type)}
              >
                {type === 'owner' ? 'Właściciel' : 'Opiekun'}
              </button>
            ))}
          </div>
        </div>



        <div className={styles.inputGroup}>
          <label htmlFor="password">Zmień hasło</label>
          <input
            type="password"
            id="password"
            placeholder="Wprowadź nowe hasło"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />
          <button type="button" onClick={handleChangePassword}>
            Zmień hasło
          </button>
        </div>

        <button type="submit" className={styles.updateButton} onClick={handleUpdateProfile}>
          Zapisz zmiany
        </button>
      </form>

      {/* Footer */}
      <footer className={styles.footer}>
        <p>&copy; Amelia</p>
      </footer>
    </div>
  );
};


export default Profile