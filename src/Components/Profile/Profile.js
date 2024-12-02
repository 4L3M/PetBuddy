import { React, useContext, useEffect, useState } from 'react';
import styles from './Profile.module.css';
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
  const [accountType, setAccountType] = useState("");
  const [preferredAnimals, setPreferredAnimals] = useState([]); // Nowy stan
  const [userId, setUserId] = useState("");

  const locations = ["Babimost", "Wolsztyn", "Gdańsk", "Poznań", "Wrocław"];
  const animals = ["kot", "pies", "inne"]; // Lista zwierząt

  const [isOwnerClicked, setIsOwnerClicked] = useState(false);
  const [isPetsitterClicked, setIsPetsitterClicked] = useState(false);

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
         // setPhone(userData.phone || "");
          setLocation(userData.location || "");
          setAccountType(userData.account_type || "");
          setPreferredAnimals(userData.preferred_animals?.split(",") || []);
        }
      } else {
        navigate("/login");
      }
    };

    fetchUserData();
  }, [supabase, navigate]);

  const handleAccountType = (type) => {
    if (type === "owner") {
      setIsOwnerClicked((prev) => !prev);
    } else if (type === "petsitter") {
      setIsPetsitterClicked((prev) => !prev);
    }
  };

  useEffect(() => {
    if (isOwnerClicked && isPetsitterClicked) {
      setAccountType("both");
    } else if (isOwnerClicked) {
      setAccountType("owner");
    } else if (isPetsitterClicked) {
      setAccountType("petsitter");
    } else {
      setAccountType("");
    }
  }, [isOwnerClicked, isPetsitterClicked]);

  const handleAnimalPreference = (animal) => {
    setPreferredAnimals((prev) =>
      prev.includes(animal)
        ? prev.filter((a) => a !== animal)
        : [...prev, animal]
    );
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    if (!accountType) {
      alert("Musisz wybrać przynajmniej jeden typ konta.");
      return;
    }

    const { data, error } = await supabase
      .from("users_details")
      .update({
        name,
        surname,
       // phone,
        location,
        account_type: accountType,
        animal_type: preferredAnimals.join(","),
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
      <header className={styles.header}>
        <img src={logo} className={styles.logo} alt="logo" />
        <h1>Twój profil</h1>
        <button onClick={() => navigate("/")} className={styles.logoutButton}>
          Powrót do strony głównej
        </button>
      </header>

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

        {isPetsitterClicked && (
          <div className={styles.inputGroup}>
            <label>Jakimi zwierzętami preferuję się opiekować:</label>
            <div className={styles.checkboxGroup}>
              {animals.map((animal) => (
                <label key={animal}>
                  <input
                    type="checkbox"
                    checked={preferredAnimals.includes(animal)}
                    onChange={() => handleAnimalPreference(animal)}
                  />
                  {animal}
                </label>
              ))}
            </div>
          </div>
        )}

        <button type="submit" className={styles.updateButton}>
          Zapisz zmiany
        </button>
      </form>

      <footer className={styles.footer}>
        <p>&copy; Amelia</p>
      </footer>
    </div>
  );
};

export default Profile;
