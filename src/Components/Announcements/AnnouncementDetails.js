import React from "react";
import logo from '../Assets/logo.png';
import { Button } from "react-bootstrap";
import { useNavigate } from 'react-router-dom';
import { useContext } from "react";
import { useParams, useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import { GlobalContext } from "../../GlobalContext";

import styles from "./AnnouncementDetails.module.css";

const AnnouncementDetails = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();

    const { id } = useParams(); // Pobieranie ID z URL-a
    const location = useLocation(); // Pobieranie danych przekazanych w state
    const announcement = location.state; // Dane ogłoszenia przekazane z poprzedniej strony
    const [adDetails, setAdDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [user, setUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('owner');
    
    const handleRoleChange = (role) => {
        setSelectedRole(role);
        console.log('Wybrana rola:', role);
    };

    // Pobierz szczegóły ogłoszenia na podstawie ID
    useEffect(() => {
        const fetchAdDetails = async () => {
            setLoading(true);
            const { data, error } = await supabase
                .from('announcement')
                .select('*')
                .eq('announcement_id', id)
                .single(); // Pobierz jedno ogłoszenie

            if (error) {
                console.error('Błąd pobierania szczegółów ogłoszenia:', error);
            } else {
                setAdDetails(data);
            }
            setLoading(false);
        };

        fetchAdDetails();
    }, [id, supabase]);

    if (loading) {
        return <p>Ładowanie szczegółów ogłoszenia...</p>;
    }

    if (!adDetails) {
        return <p>Nie znaleziono ogłoszenia</p>;
    }
    
    return (
    console.log(announcement),
    <div className={styles.page}>
            <header className={styles.header}>
                <img src={logo} className={styles.logo} alt="logo" />
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                
                         {selectedRole === 'owner' && (
                            <Button
                                onClick={() => navigate('/animals')}
                                variant="success"
                                className={styles.animalsButton}
                            >
                                Twoje zwierzęta
                            </Button>
                        )}
                            <Button
                                onClick={() => navigate('/profile')}
                                variant="primary"
                                className={styles.profileButton}
                            >
                                Twój profil
                            </Button>
                            <Button
                                onClick={() => navigate('/profile')}
                                variant="primary"
                                className={styles.profileButton}
                            >
                            </Button>
                            <Button
                                onClick={() => navigate('/announcements')}
                                variant="info"
                                className={styles.announcementButton}
                            >
                                Twoje ogłoszenia
                            </Button>
                           
                     
                </div>
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button onClick={() => navigate('/register')} variant="success">
                            Zarejestruj się
                        </Button>
                    </div>
            </header>

            <div className={styles.mainContent}>


    <div className="ad-container">
      <div className="ad-header">
        {/* <h1>{ad.name}</h1> */}
        <h1>Szczegóły ogłoszenia</h1>
      <p><strong>ID:</strong> {id}</p>
      <p><strong>Nazwa:</strong> {announcement?.name || 'Brak danych'}</p>
      <p><strong>Opis:</strong> {announcement?.description || 'Brak danych'}</p>

      </div>
      <div className="ad-image">
       {/* // <img src={ad.imageUrl} alt={`Zdjęcie ${ad.animal}`} /> */}
      </div>
      <div className="ad-details">
        <p>
          {/* <strong>Gatunek:</strong> {ad.animal_type} */}
        </p>
        <p>
          {/* <strong>Lokalizacja:</strong> {ad.location} */}
        </p>
        <p>
          {/* <strong>Dodano:</strong> {ad.added_at} */}
        </p>
      </div>
      <div className="ad-description">
        {/* <p>{ad.text}</p> */}
      </div>
      <a href="/" className="back-btn">
        Powrót
      </a>
    </div>
    </div>
    </div>
  );
}

export default AnnouncementDetails;
