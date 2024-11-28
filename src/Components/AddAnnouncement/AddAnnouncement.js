import styles from './AddAnnouncement.module.css';
import { React, useState, useEffect, useContext } from 'react';
import logo from '../Assets/logo.png';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

import { GlobalContext } from '../../GlobalContext';

const AddAnnouncement = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();

   // const getFiltersForRole = (role) => (role === 'sitter' ? sitterFilters : ownerFilters);
    
    const [user, setUser] = useState(null);
    const [selectedRole, setSelectedRole] = useState('');
    const [selectedFilters, setSelectedFilters] = useState([]);
    const [adsForRole, setAdsForRole] = useState([]);
    const [userAnimals, setUserAnimals] = useState([]);
    const [adType, setAdType] = useState('');


    const [formData, setFormData] = useState({
        name: '',
        text: '',
        announcement_type: '',
        location: '',
        added_at: '',
        active: true,
        animal_ids: [], // Inicjalizacja tablicy dla ID zwierząt
        owner_id: user?.id,
    });

    useEffect(() => {
        const getUserData = async () => {
            const { data: userData } = await supabase.auth.getUser(); // Pobieranie danych użytkownika z Supabase Auth
            setUser(userData);
    
            if (userData) {
                // Pobierz dane z tabeli 'user_details' na podstawie userData.id
                const { data: userDetails, error } = await supabase
                    .from('users_details')
                    .select('*') // Wybieramy tylko 'name'
                    .eq('user_id', userData.user?.id) // Łączenie z użytkownikiem po ID
                    .single(); // Zakładamy, że jest tylko jedno dopasowanie
    
                if (error) {
                    console.error('Błąd pobierania danych użytkownika:', error);
                } else {
                    // Dodaj imię do danych użytkownika
                    setUser((prevUser) => ({
                        ...prevUser,
                        name: userDetails ? userDetails.name : 'Nieznane', // Jeśli brak imienia, przypisujemy domyślną wartość
                    }));
                }
    
               // setSelectedRole(userData.role);
              //  setSelectedFilters(getFiltersForRole(userData.role));
            }
        };
    
        getUserData();
    }, [supabase]);

    useEffect(() => {
        const fetchUserAnimals = async () => {
            const { data: userData } = await supabase.auth.getUser();
    
            if (userData) {
                const { data: animals, error } = await supabase
                    .from('animals')
                    .select('animal_id, name') 
                    .eq('owner_id', userData.user.id);
    
                if (error) {
                    console.error('Błąd pobierania zwierząt:', error);
                } else {
                    console.log('Pobrane zwierzęta:', animals);
                    setUserAnimals(animals || []);
                }
    
                setFormData((prevData) => ({
                    ...prevData,
                    owner_id: userData.user.id,
                }));
            }
        };
    
        fetchUserAnimals();
    }, [supabase]);

    const handleAnimalSelection = (animalId) => {
        console.log('Wybrano zwierzę:', animalId);
        console.log('Aktualne animal_ids:', formData.animal_ids);

        setFormData((prevData) => {
            const isSelected = prevData.animal_ids.includes(animalId);
            if (isSelected) {
                // Usuń ID zwierzęcia, jeśli było już wybrane
                return {
                    ...prevData,
                    animal_ids: prevData.animal_ids.filter((id) => id !== animalId),
                };
            } else {
                // Dodaj ID zwierzęcia, jeśli jeszcze nie było wybrane
                return {
                    ...prevData,
                    animal_ids: [...prevData.animal_ids, animalId],
                };
            }
        });
    };
    

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value,
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('announcement').insert([formData]);
        if (error) {
            console.error('Błąd dodawania ogłoszenia:', error);
        } else {
            console.log('Ogłoszenie zostało dodane pomyślnie');
            navigate('/'); // Powrót na stronę główną
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <img src={logo} className={styles.logo} alt="logo" />
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                        <Button variant="danger" className={styles.logoutButton}>
                            Strona główna
                        </Button>
                </div>
            </header>

            <div className={styles.mainContent}>
                <div className={styles.ads}>
                        <h2>Dodaj ogłoszenie</h2>
                        <form onSubmit={handleSubmit} className={styles.newAdd}>
                            <label>
                                Jakie ogłoszenie chcesz dodać?:
                                <div className={styles.buttonGroup}>
                                    <button
                                        type="button"
                                        className={`${styles.typeButton} ${formData.announcement_type === 'offering_services' ? styles.active : ''}`}
                                        onClick={() => setFormData((prevData) => ({ ...prevData, announcement_type: 'offering_services' }))}
                                    >
                                        Chcę się opiekować
                                    </button>
                                    <button
                                        type="button"
                                        className={`${styles.typeButton} ${formData.announcement_type === 'looking_for_sitter' ? styles.active : ''}`}
                                        onClick={() => setFormData((prevData) => ({ ...prevData, announcement_type: 'looking_for_sitter' })) }
                                       >                                       
                                        Szukam opiekuna
                                    </button>
                                </div>
                            </label>
                            {formData.announcement_type === 'looking_for_sitter' && (
                                <div>
                                    <p>Wybierz zwierzęta, które potrzebują opieki:</p>
                                    <div className={styles.animalList}>
                                        {userAnimals.map((animal) => (
                                            <label key={animal.animal_id}>
                                                <input
                                                    type="checkbox"
                                                    checked={formData.animal_ids.includes(animal.animal_id)}
                                                    onChange={() => handleAnimalSelection(animal.animal_id)}
                                                />
                                                {animal.name}
                                            </label>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <label>
                                Nazwa:
                                <input
                                    type="text"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>
                            <label>
                                Gdzie?:
                                <select
                                    name="location"
                                    value={formData.location}
                                    onChange={handleInputChange}
                                    required
                                >
                                    <option value="">Wybierz...</option>
                                    <option value="Babimost">Babimost</option>
                                    <option value="Wolsztyn">Wolsztyn</option>
                                </select>
                            </label>
                            <label>
                                Treść ogłoszenia:
                                <textarea
                                    name="text"
                                    value={formData.text}
                                    onChange={handleInputChange}
                                    required
                                />
                            </label>
                           
                            
                            <label>
                                Kiedy?:
                                <input
                                    type="datetime-local"
                                    name="added_at"
                                    value={formData.added_at}
                                    onChange={handleInputChange}                                />
                            </label>
                            
                            
                            <Button type="submit" variant="success">
                                Dodaj ogłoszenie
                            </Button>
                        </form>
                </div>
            </div>
            <footer className={styles.footer}>
                <p>&copy; Amelia</p>
            </footer>
        </div>
    );
};

export default AddAnnouncement;
