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
  const [userId, setUserId] = useState("");
  const [profilePicture, setProfilePicture] = useState("");
  const [selectedFile, setSelectedFile] = useState(null);

  const locations = ["Babimost", "Wolsztyn", "Gdańsk", "Poznań", "Wrocław"];
  const accountTypes = ["owner", "petsitter"];

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
          setLocation(userData.location || "");
          setAccountType(userData.account_type || "");
          setProfilePicture(userData.user_photo || ""); // Pobierz URL zdjęcia
        }
      } else {
        navigate("/login");
      }
    };

    fetchUserData();
  }, [supabase, navigate]);

  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Function to upload a profile picture
  const uploadProfilePicture = async () => {
    if (!selectedFile) return null;

    const fileName = `${userId}_${selectedFile.name}`;
    try {
      // Upload the file to Supabase storage
      const { data, error } = await supabase.storage
        .from("photos")
        .upload(fileName, selectedFile, { upsert: true });

      if (error) {
        console.error("Błąd podczas przesyłania zdjęcia:", error.message);
        return null;
      }

      // Get the public URL for the uploaded file
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

  // Function to update user profile
  const handleUpdateProfile = async (event) => {
    event.preventDefault();

    let profilePictureUrl = profilePicture;

    // Upload new profile picture if a file was selected
    if (selectedFile) {
      const uploadedUrl = await uploadProfilePicture();
      if (uploadedUrl) {
        profilePictureUrl = uploadedUrl;
      }
    }

    // Update user details in the database
    const { data, error } = await supabase
      .from("users_details")
      .update({
        name: name || "",
        surname: surname || "",
        location: location || "",
        account_type: accountType || "",
        user_photo: profilePictureUrl || "",
      })
      .eq("user_id", userId);

    if (error) {
      console.error("Błąd podczas aktualizacji danych:", error.message);
    } else {
      console.log("Dane użytkownika zostały zaktualizowane:", data);
      // Refetch user data to reflect changes in the UI
      fetchUserData();
    }
  };

  // Fetch user data to reflect updates
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
        setProfilePicture(userData.user_photo || "");
      }
    } else {
      navigate("/login");
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
      <div style={{ display: "flex", justifyContent: "center" }}>
        <form className={styles.profileForm} onSubmit={handleUpdateProfile}>
          {/* Profile picture section */}
          <div className={styles.inputGroup}>
            <label>Zdjęcie profilowe</label>
            <img
              src={profilePicture || "default_picture_url.png"} // Default placeholder
              alt="Profile"
              className={styles.profilePicture}
            />
            <input type="file" accept="image/*" onChange={handleFileChange} />
          </div>

          {/* Other fields */}
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
            <label htmlFor="location">Lokalizacja</label>
            <select
              className={styles.profile}
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

          <button type="submit" className={styles.updateButton}>
            Zapisz zmiany
          </button>
        </form>
      </div>
      <footer className={styles.footer}>
        <p>&copy; Amelia</p>
      </footer>
    </div>
  );
};

export default Profile;
