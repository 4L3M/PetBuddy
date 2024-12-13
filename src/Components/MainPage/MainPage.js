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
        animal_type: [],
        announcement_type: '', // Nowy filtr dla rodzaju ogłoszeń
    }); // Filtry
    const [userDetails, setUserDetails] = useState(null);

    const locations = ['Babimost', 'Wolsztyn', 'Wrocław', 'Gdańsk'];
    const animals = ['kot', 'pies', 'inne'];
    const announcementTypes = ['looking_for_sitter', 'offering_services']; // Typy ogłoszeń

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
                    setFilters((prevFilters) => ({
                        ...prevFilters,
                        announcement_type: userDetails.account_type === 'owner' ? 'looking_for_sitter':'offering_services', // Nowy filtr dla rodzaju ogłoszeń
                    }));
                } else {
                    console.error('Błąd pobierania szczegółów użytkownika:', error);
                }
            }
        };
        getUserData();
    }, [supabase]);

    // Ustaw filtry na podstawie szczegółów użytkownika
    useEffect(() => {
        if (userDetails) {
            setFilters((prevFilters) => ({
                ...prevFilters,
                location: userDetails.location || '', // Ustaw lokalizację z profilu
                animal_type: userDetails.animal_type || [],
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

            // Filtrowanie wg lokalizacji
            if (filters.location) {
                query = query.ilike('location', `%${filters.location}%`);
            }

            // Filtrowanie wg roli
            // if (selectedRole) {
            //     if (selectedRole === 'owner') {
            //         query = query.eq('announcement_type', 'looking_for_sitter');
            //     } else if (selectedRole === 'petsitter') {
            //         query = query.eq('announcement_type', 'offering_services');
            //     }
            // }

           // Filtrowanie wg rodzaju ogłoszenia
            if (filters.announcement_type) {
                query = query.eq('announcement_type', filters.announcement_type);
            }
            // if(filters.animal_type){
            //     console.log(filters.animal_type[0])
            //     query = query.eq('animal_type', filters.animal_type[0])
            // }

            const { data, error } = await query;
            if (error) {
                console.error('Błąd pobierania ogłoszeń:', error);
            } else {
                
                console.log(data)
                setAds(data);
            }
            setLoading(false);
        };

        fetchAnnouncements();
    }, [ filters]);

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        console.log('Wybrana rola:', role);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    const handleAnimalFilterChange = (e, animal) => {
        setFilters((prev) => {
            const newAnimalType = prev.animal_type.includes(animal)
                ? prev.animal_type.filter((a) => a !== animal)
                : [...prev.animal_type, animal];
            return {
                ...prev,
                animal_type: newAnimalType,
            };
        });
    };

    const handleLogout = async () => {
        const { error } = await supabase.auth.signOut();
        if (error) {
            console.error('Błąd wylogowania:', error.message);
        } else {
            setFilters({
                location: '',
                active: true,
                animal_type: [],
                announcement_type: ''
            })
            setUserDetails(null)
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
                        {/* <label className={styles.filterOption}>
                            Rodzaj zwierzęcia:
                            <div className={styles.animalFilters}>
                                {animals.map((animal) => (
                                    <label key={animal} className={styles.filterOption}>
                                        <input
                                            type="checkbox"
                                            name="animal_type"
                                            value={animal}
                                            checked={filters.animal_type.includes(animal)}
                                            onChange={(e) => handleAnimalFilterChange(e, animal)}
                                        />
                                        {animal}
                                    </label>
                                ))}
                            </div>
                        </label> */}
                        {/* Filtr dla rodzaju ogłoszeń */}
                        <label className={styles.filterOption}>
                            Rodzaj ogłoszenia:
                            <select
                                name="announcement_type"
                                value={filters.announcement_type}
                                onChange={handleFilterChange}
                            >
                                <option value="">Wybierz rodzaj ogłoszenia</option>
                                {announcementTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type === 'looking_for_sitter' ? 'Szukam opiekuna' : 'Oferuję usługi'}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                <div className={styles.ads}>
                <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <h2>
                        {userDetails ? `${userDetails.name} ogłoszenia dla Ciebie` : 'Ogłoszenia dla Ciebie'}
                    </h2>
                    <button onClick={() => navigate('/add-announcement')}>
                        {userDetails ? 'Dodaj ogłoszenie' : 'Zaloguj się, aby dodać ogłoszenie'}
                    </button>
                </div>
                    {loading ? (
                        <p>Ładowanie ogłoszeń...</p>
                    ) : ads.length > 0 ? (
                        <div className={styles.adsList}>
                            {ads.map((ad) => (
                                <div key={ad.announcement_id} className={styles.adCard}>
                                    <h3>{ad.name}</h3>
                                    <p>Zwierzę: {ad.animal_type}</p>
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
