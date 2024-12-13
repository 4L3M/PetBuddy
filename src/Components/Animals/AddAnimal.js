import styles from './AddAnimal.module.css';
import { React, useState, useEffect, useContext } from 'react';
import logo from '../Assets/logo.png';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';

const AddAnimal = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();

    const [user, setUser] = useState(null);
    const [userAnimals, setUserAnimals] = useState([]); // Zwierzęta użytkownika
    const [formData, setFormData] = useState({
        name: '',
        animal_type: '',
        breed: '',
        age: '',
        info: '',
        owner_id: null, // ID użytkownika
    });

    // Załaduj dane użytkownika
    useEffect(() => {
        const getUserData = async () => {
            const { data: userData } = await supabase.auth.getUser();
            setUser(userData);

            if (userData) {
                setFormData((prevData) => ({
                    ...prevData,
                    owner_id: userData?.user.id,
                }));
            }
        };

        getUserData();
    }, [supabase]);

    // Funkcja obsługująca zmiany w formularzu
    const handleInputChange = (e) => {
        const { name, value } = e.target;
        setFormData((prevData) => ({
            ...prevData,
            [name]: value,
        }));
    };

    // Funkcja obsługująca wysyłanie formularza
    const handleSubmit = async (e) => {
        e.preventDefault();
        const { error } = await supabase.from('animals').insert([formData]);
        if (error) {
            console.error('Błąd dodawania zwierzęcia:', error);
        } else {
            console.log('Zwierzę zostało dodane pomyślnie');
            navigate('/your-animals'); // Powrót do listy zwierząt
        }
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <img src={logo} className={styles.logo} alt="logo" />
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <Button variant="danger" className={styles.logoutButton} onClick={() => navigate('/animals')}>
                        Twoje zwierzęta
                    </Button>
                </div>
            </header>

            <div className={styles.mainContent}>
                <div className={styles.ads}>
                    <h2>Dodaj nowe zwierzę</h2>
                    <form onSubmit={handleSubmit} className={styles.newAdd}>
                        <label>
                            Imie:
                            <input
                                type="text"
                                name="name"
                                value={formData.name}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Typ zwierzęcia:
                            <select
                                name="animal_type"
                                value={formData.animal_type}
                                onChange={handleInputChange}
                                required
                            >
                                <option value="">Wybierz...</option>
                                <option value="pies">Pies</option>
                                <option value="kot">Kot</option>
                                <option value="inne">Inne</option>
                            </select>
                        </label>
                        <label>
                            Rasa:
                            <input
                                type="text"
                                name="breed"
                                value={formData.breed}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Wiek:
                            <input
                                type="number"
                                name="age"
                                value={formData.age}
                                onChange={handleInputChange}
                                required
                            />
                        </label>
                        <label>
                            Opis:
                            <textarea
                                name="info"
                                value={formData.info}
                                onChange={handleInputChange}
                                required
                            />
                        </label>

                        <Button type="submit" variant="success">
                            Dodaj zwierzę
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

export default AddAnimal;
