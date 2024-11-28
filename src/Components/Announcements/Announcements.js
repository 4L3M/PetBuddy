import styles from './Announcements.module.css';
import { React, useState, useEffect, useContext } from 'react';
import logo from '../Assets/logo.png';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { GlobalContext } from '../../GlobalContext';

const Announcements = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();

    const [user, setUser] = useState(null); // Dane użytkownika
    const [selectedRole, setSelectedRole] = useState(''); // Rola użytkownika
    const [ads, setAds] = useState([]); // Ogłoszenia
    const [loading, setLoading] = useState(true); // Status ładowania
    const [filters, setFilters] = useState({
        location: '',
        active: true,
    }); // Filtry
    const [userDetails, setUserDetails] = useState(null); 

    const locations = [
        'Babimost',
        'Wolsztyn',
        'Wrocław',
        'Gdańsk',
    ];

    const animals = [
        'Kot',
        'Pies',
        'Inne',
    ];


    // Pobierz dane użytkownika
    useEffect(() => {
        const getUserData = async () => {
            const { data: userData } = await supabase.auth.getUser();
            if (userData) {
                setUser(userData.user);

                // Pobierz szczegóły użytkownika
                const { data: userDetails, error } = await supabase
                    .from('users_details')
                    .select('*')
                    .eq('user_id', userData.user.id)
                    .single();

                if (!error) {
                    setUserDetails(userDetails);
                    setSelectedRole(userDetails.account_type);
                } else {
                    console.error('Błąd pobierania szczegółów użytkownika:', error);
                }
            }
        };
        getUserData();
    }, [supabase]);

    // Pobierz ogłoszenia na podstawie roli i filtrów
    useEffect(() => {
        const fetchAnnouncements = async () => {
            setLoading(true);
            let query = supabase
                .from('announcement')
                .select('*')
                .eq('active', true) // Pobieramy tylko aktywne ogłoszenia
                .eq('owner_id', user?.id) // Filtrowanie po user_id, aby tylko ogłoszenia danego użytkownika były wyświetlane
                .order('added_at', { ascending: false }); // Sortujemy po dacie dodania

            const { data, error } = await query;
            if (error) {
                console.error('Błąd pobierania ogłoszeń:', error);
            } else {
                
                setAds(data);
            }
            setLoading(false);
        };
        if (selectedRole) {
            fetchAnnouncements();
        }
    }, [selectedRole, filters, supabase]);

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Błąd wylogowania:', error.message);
        } else {
            setUser(null);
            navigate('/');
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <img src={logo} className={styles.logo} alt="logo" />
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <>
                            <Button
                                onClick={() => navigate('/')}
                                variant="info"
                                className={styles.announcementButton}
                            >
                                Szukaj ogłoszeń
                            </Button>
                            <Button
                                onClick={handleLogout}
                                variant="danger"
                                className={styles.logoutButton}
                            >
                                Wyloguj się
                            </Button>
                        </>
                </div>
            </header>

            <div className={styles.mainContent}>
                
                <div className={styles.ads}>
                <div style={{display:'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                    <h2>{userDetails?.name}, Twoje ogłoszenia</h2>
                    <button onClick={() => navigate('/add-announcement')}>Dodaj ogłoszenie</button>
                </div>
                {loading ? (
                        <p>Ładowanie ogłoszeń...</p>
                    ) : ads.length > 0 ? (
                        <div className={styles.adsList}>
                            {ads.map((ad) => (
                                <div key={ad.announcement_id} className={styles.adCard} >
                                    <h3>{ad.name}</h3>
                                    <p>{ad.text}</p>
                                    <p>Lokalizacja: {ad.location}</p>
                                    <p>Dodano: {new Date(ad.added_at).toLocaleDateString()}</p>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <p>Brak ogłoszeń do wyświetlenia</p>
                    )}
                </div>
            </div>

            <footer className={styles.footer}>
                <p>&copy; Amelia</p>
            </footer>
        </div>
    );
};

export default Announcements;
