import styles from './MainPage.module.css';
import { React, useState, useEffect, useContext } from 'react';
import logo from '../Assets/logo.png';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { GlobalContext } from '../../GlobalContext';

const MainPage = () => {
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
            if (userData?.user?.id) {
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

    useEffect(() => {
        if (userDetails) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                location: userDetails.location || '', // Ustaw lokalizację z profilu
            }));
        }
    }, [userDetails]);

    // Pobierz ogłoszenia na podstawie roli i filtrów
    useEffect(() => {
        const fetchAnnouncements = async () => {
            setLoading(true);
            let query = supabase
                .from('announcement')
                .select('*')
                .eq('active', true) // Pobieramy tylko aktywne ogłoszenia
                .order('added_at', { ascending: false }); // Sortujemy po dacie dodania

            // Filtrowanie wg lokalizacji (jeśli podano)
            if (filters.location) {
                query = query.ilike('location', `%${filters.location}%`);
            }

            // Filtrowanie wg roli
            if(selectedRole){
                if (selectedRole === 'owner') {
                    query = query.eq('announcement_type', 'looking_for_sitter');
                } else if (selectedRole === 'petsitter' ) {
                    query = query.eq('announcement_type', 'offering_services');
                }
            }

            const { data, error } = await query;
            if (error) {
                console.error('Błąd pobierania ogłoszeń:', error);
            } else {
                console.log(data);
                setAds(data);
            }
            setLoading(false);
        };
        
            fetchAnnouncements();
        
    }, [selectedRole, filters, supabase]);


    const handleRoleChange = (role) => {
        setSelectedRole(role);
        console.log(role);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

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
                    {user ? (
                        <>
                            <Button
                                onClick={() => navigate('/profile')}
                                variant="primary"
                                className={styles.profileButton}
                            >
                                Twój profil
                            </Button>
                            <Button
                                onClick={() => navigate('/announcements')}
                                variant="info"
                                className={styles.announcementButton}
                            >
                                Twoje ogłoszenia
                            </Button>
                            <Button
                                onClick={handleLogout}
                                variant="danger"
                                className={styles.logoutButton}
                            >
                                Wyloguj się
                            </Button>
                        </>
                    ) : (
                        <div className={styles.buttonGroup}>
                            <Button
                                variant={selectedRole === 'petsitter' ? 'primary' : 'secondary'}
                                onClick={() => handleRoleChange('petsitter')}
                                className={styles.roleButton}
                            >
                                Chcę się opiekować zwierzętami
                            </Button>
                            <Button
                                variant={selectedRole === 'owner' ? 'primary' : 'secondary'}
                                onClick={() => handleRoleChange('owner')}
                                className={styles.roleButton}
                            >
                                Szukam opieki dla swojego zwierzęcia
                            </Button>
                        </div>
                    )}
                </div>
                {!user && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <Button onClick={() => navigate('/login')} variant="primary">
                            Zaloguj się
                        </Button>
                        <Button onClick={() => navigate('/register')} variant="success">
                            Zarejestruj się
                        </Button>
                    </div>
                )}
            </header>

            <div className={styles.mainContent}>
                {user && (
                    <div className={styles.sideFilters}>
                        <h3>Filtry</h3>
                        <label className={styles.filterOption}>
                            Lokalizacja:
                            <select
                                name="location"
                                value={filters.location}
                                onChange={handleFilterChange}
                            >
                                <option value="">Wybierz lokalizację</option>
                                {locations.map((loc) => (
                                    <option key={loc} value={loc}>
                                        {loc}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                <div className={styles.ads}>
                    <div style={{display:'flex', flexDirection: 'row', justifyContent: 'space-between'}}>
                        <h2>{userDetails ? `${userDetails.name} ogłoszenia dla Ciebie` : 'Ogłoszenia dla Ciebie'}</h2>
                        <button onClick={() => navigate('/add-announcement')}>Dodaj ogłoszenie</button>
                    </div>
                {loading ? (
                        <p>Ładowanie ogłoszeń...</p>
                    ) : ads.length > 0 ? (
                        <div className={styles.adsList}>
                            {ads.map((ad) => (
                                <div key={ad.announcement_id} className={styles.adCard}>
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

export default MainPage;
