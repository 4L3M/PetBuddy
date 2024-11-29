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
  const [phone, setPhone] = useState("");
  const [location, setLocation] = useState("");
  const [accountType, setAccountType] = useState([]);
  const [userId, setUserId] = useState("");

  const locations = ["Babimost", "Wolsztyn", "Gdańsk", "Poznań", "Wrocław"];
  const accountTypes = ["both","owner", "petsitter"];

  useEffect(() => {
    const fetchUserData = async () => {
      const sessionResponse = await supabase.auth.getSession();
      const session = sessionResponse.data.session;

      if (session) {
        const user = session.user;
        setUserId(user.id);

        const { data: userDetails, error } = await supabase
          .from("users_details")
          .select("*")
          .eq("user_id", user.id);

        if (error) {
          console.error("Błąd podczas pobierania danych użytkownika:", error);
        } else if (userDetails && userDetails.length > 0) {
          const userData = userDetails[0];
          setName(userData.name || "");
          setSurname(userData.surname || "");
          setPhone(userData.phone || "");
          setLocation(userData.location || "");
          setAccountType(userData.account_type || "");
        }
      } else {
        navigate("/login");
      }
    };

    fetchUserData();
  }, [supabase, navigate]);


  const [isOwnerClicked, setIsOwnerClicked] = useState(false);
  const [isPetsitterClicked, setIsPetsitterClicked] = useState(false);
  
  const handleAccountType = (type) => {
    if (type === "owner") {
      setIsOwnerClicked((prev) => !prev);
    } else if (type === "petsitter") {
      setIsPetsitterClicked((prev) => !prev);
    }
  };
  
  useEffect(() => {
    // Ustawienie accountType na podstawie stanu przycisków
    if (isOwnerClicked && isPetsitterClicked) {
      setAccountType("both");
    } else if (isOwnerClicked) {
      setAccountType("owner");
    } else if (isPetsitterClicked) {
      setAccountType("petsitter");
    } else {
      setAccountType(""); // Jeśli nic nie jest wybrane
    }
  
    // Debugowanie w konsoli
    console.log("isOwnerClicked:", isOwnerClicked);
    console.log("isPetsitterClicked:", isPetsitterClicked);
    console.log("accountType:", accountType);
  }, [isOwnerClicked, isPetsitterClicked]); // Uruchamiane przy zmianie stanu przycisków
  

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

 if (!accountType) {
    console.error("Musisz wybrać przynajmniej jeden typ konta.");
    alert("Musisz wybrać przynajmniej jeden typ konta."); // Opcjonalny alert dla użytkownika
    return;
  }

    if (!userId) {
      console.error("Brak ID użytkownika. Nie można zaktualizować danych.");
      return;
    }

    const { data, error } = await supabase
      .from('users_details')
      .update({
        name,
        surname,
       // phone,
        location,
        account_type: accountType.includes('both') ? 'both' : accountType.join(','),
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Błąd podczas aktualizacji danych:", error.message);
    } else {
      console.log("Dane użytkownika zostały zaktualizowane:", data);
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
      <form className={styles.profileForm} onSubmit={handleUpdateProfile}>
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
          <select
            id="location"
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            required
          >
            <option value="">Wybierz lokalizację</option>
            {locations.map((loc) => (
              <option key={loc} value={loc}>
                {loc}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.inputGroup}>
          <label>Typ konta</label>
          <div className={styles.buttonGroup}>
            <button
              type="button"
              className={isOwnerClicked ? styles.activeButton : styles.inactiveButton}
              onClick={() => handleAccountType("owner")}
            >
              Właściciel
            </button>
            <button
              type="button"
              className={isPetsitterClicked ? styles.activeButton : styles.inactiveButton}
              onClick={() => handleAccountType("petsitter")}
            >
              Opiekun
            </button>
          </div>
        </div>


        <button type="submit" className={styles.updateButton}>
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

export default Profile;
