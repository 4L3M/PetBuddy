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
  const [location, setLocation] = useState("");
  const [accountType, setAccountType] = useState("");
  const [phone, setPhone] = useState("");
  const [userId, setUserId] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);
  const [isSaved, setIsSaved] = useState(false); // Nowy stan dla komunikatu "Zapisano zmiany"

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");

  const locations = ["Babimost", "Wolsztyn", "Gdańsk", "Poznań", "Wrocław"];
  const accountTypes = ["owner", "petsitter"];


  // Funkcja do obsługi wyboru roli
  const toggleAccountType = (type) => {
    setIsSaved(false); // Ukryj komunikat "Zapisano zmiany"
  
    setAccountType((prevType) => {
      if (prevType === "both") {
        // Jeśli oba typy były zaznaczone, usuń wybrany typ
        return type === "owner" ? "petsitter" : "owner";
      } else if (prevType === type) {
        // Jeśli bieżący typ jest zaznaczony, odznacz go
        return "";
      } else if (prevType) {
        // Jeśli istnieje inny typ, ustaw "both"
        return "both";
      } else {
        // W przeciwnym razie ustaw nowy typ
        return type;
      }
    });
  };

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
        setLocation(userData.location || "");
        setAccountType(userData.account_type || "");
        setProfilePicture(userData.user_photo || ""); // Pobierz URL zdjęcia
        setPhone(userData.phone || ""); // Pobierz numer telefonu
      }
      console.log("Account type:", accountType);
    } else {
      navigate("/login");
    }
  };

  useEffect(() => {
    fetchUserData();
  }, [supabase, navigate]);

  const handleFileChange = (event) => {
    setIsSaved(false); // Ukryj komunikat, gdy użytkownik zmienia plik
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  const handleInputChange = (setter) => (event) => {
    setIsSaved(false); // Ukryj komunikat, gdy użytkownik edytuje dowolne pole
    setter(event.target.value);
  };

  const uploadProfilePicture = async () => {
    if (!selectedFile) return null;

    const fileName = `${userId}_${selectedFile.name}`;
    try {
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(fileName, selectedFile, { upsert: true });

      if (error) {
        console.error("Błąd podczas przesyłania zdjęcia:", error.message);
        return null;
      }

      const { data: publicUrlData, error: publicUrlError } = supabase.storage
        .from("photos")
        .getPublicUrl(fileName);

      if (publicUrlError) {
        console.error("Błąd podczas uzyskiwania publicznego URL zdjęcia:", publicUrlError.message);
        return null;
      }

      return publicUrlData.publicUrl;
    } catch (err) {
      console.error("Unexpected error during upload:", err);
      return null;
    }
  };

  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    let profilePictureUrl = profilePicture;

    if (selectedFile) {
      const uploadedUrl = await uploadProfilePicture();
      if (uploadedUrl) {
        profilePictureUrl = uploadedUrl;
      }
    }

    const finalAccountType =
    accountType === "both" || accountType.includes("owner") && accountType.includes("petsitter")
      ? "both"
      : accountType;


    const { data, error } = await supabase
      .from("users_details")
      .update({
        name: name || "",
        surname: surname || "",
        location: location || "",
        account_type: finalAccountType || "",
        user_photo: profilePictureUrl || "",
        phone: phone || "",
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Błąd podczas aktualizacji danych:", error.message);
    } else {
      console.log("Dane użytkownika zostały zaktualizowane:", data);
      setIsSaved(true); // Pokaż komunikat "Zapisano zmiany"
      fetchUserData();
    }
  };

  const handlePasswordChange = async (event) => {
    event.preventDefault();
  
    if (newPassword !== confirmPassword) {
      setPasswordError("Hasła nie są takie same.");
      setPasswordSuccess("");
      return;
    }
  
    try {
      const { data, error } = await supabase.auth.updateUser({
        password: newPassword,
      });
  
      if (error) {
        console.error("Błąd podczas zmiany hasła:", error.message);
        setPasswordError("Nie udało się zmienić hasła.");
        setPasswordSuccess(false);
      } else {
        console.log("Hasło zostało zmienione:", data);
        setPasswordError("");
        setPasswordSuccess(true);
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Unexpected error during password change:", err);
      setPasswordError("Wystąpił nieoczekiwany błąd.");
      setPasswordSuccess(false);
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
      <div style={{ display: "flex", flexDirection: 'column', justifyContent: "center" }}>
        <form className={styles.profileForm} onSubmit={handleUpdateProfile}>
          <div className={styles.inputGroup}>
            <label>Zdjęcie profilowe</label>
            <img
              src={profilePicture || "default_picture_url.png"}
              alt="Profile"
              className={styles.profilePicture}
            />
           <label htmlFor="fileUpload" className={styles.customFileButton}>
            Wybierz zdjęcie
          </label>
          <input
            id="fileUpload"
            type="file"
            accept="image/*"
            onChange={handleFileChange}
          />
          </div>

          <div className={styles.inputGroup}>
            <label>Typ konta</label>
            <div className={styles.roleButtons}>
              {accountTypes.map((type) => (
                <button
                  key={type}
                  type="button"
                  className={`${styles.roleButton} ${
                    accountType === type || accountType === "both" ? styles.activeRole : ""
                  }`}
                  onClick={() => toggleAccountType(type)}
                >
                  {type === "owner" ? "Właściciel" : "Opiekun"}
                </button>
              ))}
            </div>
          </div>

          <div className={styles.inputGroup}>
            <label htmlFor="name">Imię</label>
            <input
              type="text"
              id="name"
              value={name}
              onChange={handleInputChange(setName)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="surname">Nazwisko</label>
            <input
              type="text"
              id="surname"
              value={surname}
              onChange={handleInputChange(setSurname)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="phone">Numer telefonu</label>
            <input
              type="text"
              id="phone"
              value={phone}
              onChange={handleInputChange(setPhone)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="location">Lokalizacja</label>
            <select
              id="location"
              value={location}
              onChange={handleInputChange(setLocation)}
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

          <button type="submit" className={styles.updateButton}>
            Zapisz zmiany
          </button>

          {isSaved && (
            <p className={styles.savedMessage}>Zapisano zmiany</p>
          )}
        </form>

        <form className={styles.profileForm}  onSubmit={handlePasswordChange}>
          <div className={styles.inputGroup}>
            <label htmlFor="newPassword">Nowe hasło</label>
            <input
              type="password"
              id="newPassword"
              value={newPassword}
              onChange={handleInputChange(setNewPassword)}
              required
            />
          </div>
          <div className={styles.inputGroup}>
            <label htmlFor="confirmPassword">Potwierdź hasło</label>
            <input
              type="password"
              id="confirmPassword"
              value={confirmPassword}
              onChange={handleInputChange(setConfirmPassword)}
              required
            />
          </div>
          <button type="submit" className={styles.updateButton}>
            Zmień hasło
          </button>

          {passwordError && (
            <p className={styles.error}>{passwordError}</p>
          )}
          {passwordSuccess && (
            <p className={styles.success}>Hasło zostało zmienione</p>
          )}
        </form>

      </div>
      <footer className={styles.footer}>
        <p>&copy; Amelia</p>
      </footer>
    </div>
  );
};

export default Profile;
