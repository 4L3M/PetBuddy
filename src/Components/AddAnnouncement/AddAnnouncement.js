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
        animal_ids: [],
        owner_id: null,
        animal_type: []
    });

    const ANIMAL_TYPE_MAP = {
        Pies: 'dog',
        Kot: 'cat',
        Inne: 'other'
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
                    .select('animal_id, name')
                    .eq('owner_id', userData.user.id);

                if (error) {
                    console.error('Błąd pobierania zwierząt:', error);
                } else {
                    setUserAnimals(animals || []);
                    setFormData((prevData) => ({
                        ...prevData,
                        owner_id: userData.user.id
                    }));
                }
            }
        };

        fetchUserAnimals();
    }, [supabase]);

    const handleInputChange = (e) => {
        const { name, value, type, checked } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: type === 'checkbox' ? checked : value
        }));
    };

    const handleAnimalSelection = (animalId) => {
        setFormData((prevData) => {
            const isSelected = prevData.animal_ids.includes(animalId);
            return {
                ...prevData,
                animal_ids: isSelected
                    ? prevData.animal_ids.filter((id) => id !== animalId)
                    : [...prevData.animal_ids, animalId]
            };
        });
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
        const { error } = await supabase.from('announcement').insert([formData]);

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

                        <Button type="submit" variant="success">Dodaj ogłoszenie</Button>
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
