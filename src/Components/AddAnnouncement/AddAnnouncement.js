import React, { useState, useEffect, useContext } from 'react';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import styles from './AddAnnouncement.module.css';
import logo from '../Assets/logo.png';
import { GlobalContext } from '../../GlobalContext';

const AddAnnouncement = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [userAnimals, setUserAnimals] = useState([]);
    const [formData, setFormData] = useState({
        name: '',
        text: '',
        announcement_type: '',
        location: '',
        added_at: '',
        active: true,
        animal_id: '',
        owner_id: null,
        animal_type: [] // Tablica typów zwierząt
    });

    const ANIMAL_TYPE_MAP = {
        Pies: 'pies',
        Kot: 'kot',
        Inne: 'inne'
    };

    useEffect(() => {
        const fetchUserData = async () => {
            const { data: userData } = await supabase.auth.getUser();

            if (userData?.user) {
                const { data: userDetails, error } = await supabase
                    .from('users_details')
                    .select('*')
                    .eq('user_id', userData.user.id)
                    .single();

                if (error) {
                    console.error('Błąd pobierania danych użytkownika:', error);
                } else {
                    setUser({
                        ...userData.user,
                        name: userDetails?.name || 'Nieznane'
                    });
                }
            }
        };

        fetchUserData();
    }, [supabase]);

    useEffect(() => {
        const fetchUserAnimals = async () => {
            const { data: userData } = await supabase.auth.getUser();
    
            if (userData?.user) {
                const { data: animals, error } = await supabase
                    .from('animals')
                    .select('animal_id, name, animal_type')
                    .eq('owner_id', userData.user.id);
    
                if (error) {
                    console.error('Błąd pobierania zwierząt:', error);
                } else {
                    console.log('Pobrane zwierzęta:', animals); // Logowanie danych
                    setUserAnimals(animals || []); // Aktualizacja stanu
                }
            }
        };

        fetchUserAnimals();
    }, [supabase]);

    const handleInputChange = (e) => {
        const { name, value } = e.target;

        setFormData((prevData) => ({
            ...prevData,
            [name]: value === '' ? null : value // Jeśli wartość jest pusta, ustawiamy na null
        }));
    };

    const handleAnimalSelection = (animalId) => {
        setFormData((prevData) => ({
            ...prevData,
            animal_id: animalId
        }));
    };

    const handleAnimalTypeSelection = (animalType) => {
        setFormData((prevData) => {
            const isSelected = prevData.animal_type.includes(animalType);
            return {
                ...prevData,
                animal_type: isSelected
                    ? prevData.animal_type.filter((type) => type !== animalType)
                    : [...prevData.animal_type, animalType]
            };
        });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
    
           // Walidacja dla przypadku "szukam opiekuna"
        if (formData.announcement_type === 'looking_for_sitter' && !formData.animal_id) {
            alert('Proszę wybrać zwierzę, które potrzebuje opieki.');
            return;
        }

        // Jeśli animal_type jest pustą tablicą, ustawiamy ją na null
        const formattedAnimalType = formData.animal_type.length === 0 ? null : formData.animal_type;  // Bez JSON.stringify()
    
        // Jeśli animal_id jest pusty, ustawiamy na null
        const dataToInsert = {
            ...formData,
            animal_type: formattedAnimalType,
            animal_id: formData.animal_id === '' ? null : formData.animal_id
        };
    
        const { error } = await supabase.from('announcement').insert([dataToInsert]);
    
        if (error) {
            console.error('Błąd dodawania ogłoszenia:', error);
        } else {
            console.log('Ogłoszenie zostało dodane pomyślnie');
            navigate('/');
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <img src={logo} className={styles.logo} alt="logo" />
                <Button variant="danger" className={styles.logoutButton} onClick={() => navigate('/')}>Strona główna</Button>
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
                                    onClick={() => setFormData((prev) => ({ ...prev, announcement_type: 'offering_services' }))}
                                >Chcę się opiekować</button>
                                <button
                                    type="button"
                                    className={`${styles.typeButton} ${formData.announcement_type === 'looking_for_sitter' ? styles.active : ''}`}
                                    onClick={() => setFormData((prev) => ({ ...prev, announcement_type: 'looking_for_sitter' }))}
                                >Szukam opiekuna</button>
                            </div>
                        </label>

                        {formData.announcement_type === 'looking_for_sitter' && (
                            <div>
                                <label>
                                    Wybierz zwierzę, które potrzebuje opieki:
                                    <select
                                        name="animal_id"
                                        className={styles.animalSelect}
                                        value={formData.animal_id}
                                        onChange={handleInputChange}
                                        required={formData.announcement_type === 'looking_for_sitter'}
                                        >
                                        <option value="">Wybierz...</option>
                                        {console.log(userAnimals)}
                                        {userAnimals.map((animal) => (
                                            <option key={animal.animal_id} value={animal.animal_id}>
                                                {animal.name}
                                            </option>
                                        ))}
                                    </select>
                                </label>
                            </div>
                        )}

                        {formData.announcement_type === 'offering_services' && (
                            <div>
                                <p>Wybierz typy zwierząt, którymi chcesz się opiekować:</p>
                                <div className={styles.animalTypeList}>
                                    {Object.keys(ANIMAL_TYPE_MAP).map((displayName) => (
                                        <label key={displayName}>
                                            <input
                                                type="checkbox"
                                                checked={formData.animal_type.includes(ANIMAL_TYPE_MAP[displayName])}
                                                onChange={() => handleAnimalTypeSelection(ANIMAL_TYPE_MAP[displayName])}
                                            />
                                            {displayName}
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
                                className={styles.newAdd}
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
                                onChange={handleInputChange}
                            />
                        </label>

                        <Button id="add_annoucment_button" type="submit" variant="success">Dodaj ogłoszenie</Button>
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
