import styles from './MainPage.module.css';
import { React, useState, useEffect, useContext } from 'react';
import logo from '../Assets/logo.png';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { GlobalContext } from '../../GlobalContext';

const MainPage = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();
    const handleAnnouncementClick = (announcement) => {
        // Przekazujemy `id` i dane ogłoszenia do innej strony
        navigate(`/announcement/${announcement.id}`, { state: announcement });
      };

    const [imageUrls, setImageUrls] = useState({});
    const [user, setUser] = useState(null); // Dane użytkownika
    const [selectedRole, setSelectedRole] = useState(''); // Rola użytkownika
    const [ads, setAds] = useState([]); // Ogłoszenia
    const [loading, setLoading] = useState(true); // Status ładowania
    const [filters, setFilters] = useState({
        location: '',
        active: true,
        animal_type: '',
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
                        announcement_type: 
                            userDetails.account_type === 'owner'
                            ? 'looking_for_sitter'
                            : userDetails.account_type === 'petsitter'
                            ? 'offering_services'
                            : '', // Do not preselect for 'both'
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
                location: userDetails.location || '',
                animal_type: userDetails.animal_type || '',
                announcement_type:
                userDetails.account_type === 'owner'
                    ? 'looking_for_sitter'
                    : userDetails.account_type === 'petsitter'
                    ? 'offering_services'
                    : '', // Keep it empty for 'both'
                }));
        }
    }, [userDetails]);

    // Pobierz ogłoszenia na podstawie roli i filtrów
    // Pobierz ogłoszenia na podstawie roli i filtrów
    useEffect(() => {
        const fetchAnnouncements = async () => {
            setLoading(true);
    
            let query = supabase
                .from('announcement')
                .select(`
                    *,
                    animals:animal_id (
                        name,
                        breed,
                        animal_type,
                        animal_photo
                    )
                `)
                .eq('active', true) // Tylko aktywne ogłoszenia
                .order('added_at', { ascending: false });
    
            // Wykluczenie ogłoszeń użytkownika
            if (user?.id) {
                query = query.not('owner_id', 'eq', user.id);
            }
    
            // Filtrowanie wg lokalizacji
            if (filters.location) {
                query = query.ilike('location', `%${filters.location}%`);
            }
    
            // Filtrowanie wg rodzaju ogłoszenia
            if (filters.announcement_type) {
                query = query.eq('announcement_type', filters.announcement_type);
            }
    
            // Filtrowanie wg rodzaju zwierzęcia
            if (filters.animal_type) {
                query = query.filter('animal_type', 'cs', `"${filters.animal_type}"`);
            }
    
            const { data, error } = await query;
            if (error) {
                console.error('Błąd pobierania ogłoszeń:', error);
            } else {
                // Pobierz dane użytkowników (owner_id) dla każdego ogłoszenia
                const adsWithUserDetails = await Promise.all(data.map(async (ad) => {
                    const { data: userDetails } = await supabase
                        .from('users_details')
                        .select('name')
                        .eq('user_id', ad.owner_id)
                        .single(); // Zakładając, że owner_id jest unikalne
    
                     
                        if (error) {
                            console.error("Błąd pobierania szczegółów użytkownika:", error);
                            return ad;
                        }

                        return { ...ad, userDetails }; // Dodajemy dane użytkownika do ogłoszenia
                    }));
    
                setAds(adsWithUserDetails);
            }
            setLoading(false);
        };
    
        fetchAnnouncements();
    }, [filters, user]);
    


    useEffect(() => {
        const loadImages = async () => {
            const urls = {};
            for (const ad of ads) {
                const imageUrl = await fetchImage(ad); // Pobierz zdjęcie dla ogłoszenia
                urls[ad.announcement_id] = imageUrl;
            }
            setImageUrls(urls); // Zaktualizuj stan zdjęć
        };

        if (ads.length > 0) {
            loadImages(); // Ładuj zdjęcia, gdy ogłoszenia są dostępne
        }
    }, [ads]);

    

    const handleRoleChange = (role) => {
        setSelectedRole(role);
    };

    const handleFilterChange = (e) => {
        const { name, value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            [name]: value,
        }));
    };

    // Obsługa zmiany filtra dla zwierzęcia
    const handleAnimalFilterChange = (e) => {
        const { value } = e.target;
        setFilters((prevFilters) => ({
            ...prevFilters,
            animal_type: value, // Ustawiamy nową wartość jako string
        }));
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

    const fetchImage = async (ad) => {
        try {
            
            
            if (ad.announcement_type === "looking_for_sitter" && ad?.animal_id) {
                
                // Pobierz zdjęcie zwierzęcia
                const { data: animalDetails, error } = await supabase
                    .from("animals")
                    .select("animal_photo")
                    .eq("animal_id", ad.animal_id)
                    .single(); 
    
                if (error) {
                    console.error("Błąd podczas pobierania zdjęcia zwierzęcia:", error);
                    return "default_pet_image_url.png"; // Domyślne zdjęcie
                } 
                return animalDetails.animal_photo;
            } else if (ad.announcement_type === "offering_services" && ad?.owner_id) {
                // Pobierz zdjęcie użytkownika
                const { data: userDetails, error } = await supabase
                    .from("users_details")
                    .select("user_photo")
                    .eq("user_id", ad.owner_id)
                    .single();
                
                if (error) {
                    console.error("Błąd podczas pobierania zdjęcia użytkownika:", error);
                    return "default_petsitter_image_url.png"; // Domyślne zdjęcie
                }

                return userDetails?.user_photo;
            }
        } catch (error) {
            console.error("Błąd podczas pobierania zdjęcia:", error);
        }
    
        return "default_image_url.png"; // Domyślne zdjęcie
    };
    
 
    
    

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <img
                    src={logo} 
                    className={styles.logo} 
                    alt="logo" 
                />
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    {user ? (
                        <>
                         {selectedRole === 'owner' && (
                            <button
                                onClick={() => navigate('/animals')}
                                variant="success"
                                className={styles.headerButton}
                            >
                                Twoje zwierzęta
                            </button>
                        )}
                            <button
                                onClick={() => navigate('/profile')}
                                variant="primary"
                                className={styles.headerButton}
                            >
                                Twój profil
                            </button>
                            
                            <button
                                onClick={() => navigate('/announcements')}
                                variant="info"
                                className={styles.headerButton}
                            >
                                Twoje ogłoszenia
                            </button>
                            <button
                                id='logout'
                                onClick={handleLogout}
                                variant="danger"
                                className={styles.logoutButton}
                            >
                                Wyloguj się
                            </button>
                        </>
                    ) : (
                        <div className={styles.buttonGroup}>
                            <button
                                className={`${styles.animalsButton} ${
                                    selectedRole === 'petsitter' ? styles.selectedButton : ''
                                }`}
                                onClick={() => handleRoleChange('petsitter')}
                            >
                                Chcę się opiekować zwierzętami
                            </button>
                            <button
                                 className={`${styles.roleButton} ${
                                    selectedRole === 'owner' ? styles.selectedButton : ''
                                }`}
                                onClick={() => handleRoleChange('owner')}
                            >
                                Szukam opieki dla swojego zwierzęcia
                            </button>
                        </div>
                    )}
                </div>
                {!user && (
                    <div style={{ display: 'flex', flexDirection: 'column' }}>
                        <button onClick={() => navigate('/login')} variant="primary">
                            Zaloguj się
                        </button>
                        <button onClick={() => navigate('/register')} variant="success">
                            Zarejestruj się
                        </button>
                    </div>
                )}
            </header>
          
            <div style={{ paddingRight: '5%', paddingLeft: '5%',display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                <h2>
                    {userDetails ? `${userDetails.name}, ogłoszenia dla Ciebie` : 'Ogłoszenia dla Ciebie'}
                </h2>
                <button 
                    id="add-announcement"
                    onClick={() => userDetails ? navigate('/add-announcement') : navigate('/login')}
                    disabled={!userDetails && false} // Przy braku użytkownika umożliwiamy tylko przekierowanie do logowania
                    >
                    {userDetails ? 'Dodaj ogłoszenie' : 'Zaloguj się, aby dodać ogłoszenie'}
                </button>
            </div>
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
                        <label className={styles.filterOption}>
                            Rodzaj zwierzęcia:
                            <select
                                name="animal_type"
                                value={filters.animal_type}
                                onChange={handleAnimalFilterChange}
                            >
                                <option value="">Wybierz rodzaj zwierzęcia</option>
                                {animals.map((animal) => (
                                    <option key={animal} value={animal}>
                                        {animal}
                                        
                                    </option>
                                    
                                ))}
                            </select>
                        </label>
                        {/* Filtr dla rodzaju ogłoszeń */}
                        <label className={styles.filterOption}>
                            Czego potrzebujesz?
                            <select
                                className={styles.filterSelect}
                                name="announcement_type"
                                value={filters.announcement_type}
                                onChange={handleFilterChange}
                            >
                                <option value="">Wybierz rodzaj ogłoszenia</option>
                                {announcementTypes.map((type) => (
                                    <option key={type} value={type}>
                                        {type === 'looking_for_sitter' ? 'Zaopiekuję się' : 'Szukam opiekuna'}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}

                <div className={styles.ads}>           

                    {loading ? (
                        <p>Ładowanie ogłoszeń...</p>
                    ) : ads.length > 0 ? (
                        <div className={styles.adsList}>
                            {ads.map((ad) => (
                                <div 
                                    key={ad.announcement_id} 
                                    className={styles.adCard}
                                    onClick={() => navigate(`/ad/${ad.announcement_id}`, { state: ad })}
                                >
                                    {ad.announcement_type === "offering_services" ? (console.log(ad)):null}
                                    <h3>{ad.name}</h3>
                                    <img
                                        src={imageUrls[ad.announcement_id] || "default_image_url.png"} // Domyślne zdjęcie w razie problemów
                                        alt={ad.announcement_type === "offering_services" ? "Opiekun" : "Zwierzę"}
                                        className={styles.profilePicture}
                                        style={{maxHeight: '100px'}}
                                    />
                                    
                                    <strong>
                                      {ad.announcement_type === "offering_services"
                                        ? ad.userDetails?.name || "Opiekun nieznany"  // Sprawdzamy, czy dane użytkownika są dostępne
                                        : ad.animals?.name || "Zwierzę nieznane"}
                                    </strong>
                                    <p></p>
                                    {/* <p>{ad.announcement_type === "offering_services" ? "Opiekun" : "Zwierzę"}</p> */}
                                    <p>{ad.animal_type}</p>
                                    {/* <p>{ad.text}</p> */}
                                    <p>Lokalizacja: <strong>{ad.location}</strong></p>
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
