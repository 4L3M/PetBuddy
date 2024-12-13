import React, { useState, useEffect, useContext } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';
import styles from './YourAnimals.module.css';

const YourAnimals = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // Dane użytkownika
    const [animals, setAnimals] = useState([]); // Ogłoszenia użytkownika
    const [loading, setLoading] = useState(true); // Status ładowania

    // Pobierz dane użytkownika po zalogowaniu
    useEffect(() => {
        const fetchUserData = async () => {
            const { data: userData, error } = await supabase.auth.getUser();
            if (error) {
                console.error('Błąd pobierania danych użytkownika:', error);
                return;
            }
            console.log(userData);  // Dodaj to, by sprawdzić dane użytkownika
            setUser(userData?.user);
        };
        fetchUserData();
    }, [supabase]);
    
    // Pobierz zwierzęta powiązane z użytkownikiem
    useEffect(() => {
        const fetchUserAnimals = async () => {
            if (!user) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('animals')
                .select('*') // Pobierz ogłoszenia dla aktualnego użytkownika
                .order('age', { ascending: false }); // Posortuj wg daty dodania
            if (error) {
                console.error('Błąd pobierania ogłoszeń:', error);
            } else {
                setAnimals(data);
                
            console.log(data)
            }
            setLoading(false);
            console.log(data)
        };
        fetchUserAnimals();
    }, [user, supabase]);

    // Funkcja do usuwania ogłoszenia
    const handleDeleteAnnouncement = async (animalID) => {
        const { error } = await supabase
            .from('animal')
            .delete()
            .eq('animal_id', animalID); // Usuń ogłoszenie po ID
        if (error) {
            console.error('Błąd usuwania zwierzecia:', error);
        } else {
            setAnimals((prev) => prev.filter((animal) => animal.animalID !== animalID)); // Usuwanie z listy w stanie
        }
    };

    // Funkcja do edycji ogłoszenia
    const handleEditAnnouncement = (animalID) => {
        navigate(`/edit-animal/${animalID}`); // Przekierowanie do strony edycji ogłoszenia
    };

    if (loading) {
        return <div>Ładowanie zwierząt...</div>;
    }

    return (
        <div className={styles.container}>
            <h2>Twoje zwierzeta</h2>
            {animals.length === 0 ? (
                <p>Nie masz jeszcze żadnych zwierząt.</p>
            ) : (
                <div className={styles.announcementsList}>
                    {animals.map((animal) => (
                        <Card key={animal.animal_id} className={styles.card}>
                            <Card.Body>
                                <Card.Title>{animal.name}</Card.Title>
                                <Card.Text>{animal.text}</Card.Text>
                                <Card.Text>{animal.info}</Card.Text>
                                {/* <Card.Text><strong>Lokalizacja:</strong> {user.location}</Card.Text>
                                <Card.Text><strong>Dodano:</strong> {new Date(animal.added_at).toLocaleDateString()}</Card.Text> */}
                                <Button 
                                    variant="primary" 
                                    onClick={() => handleEditAnnouncement(animal.animal_id)}>
                                    Edytuj
                                </Button>
                                <Button 
                                    variant="danger" 
                                    onClick={() => handleDeleteAnnouncement(animal.animal_id)} 
                                    className="ms-2">
                                    Usuń
                                </Button>
                            </Card.Body>
                        </Card>
                    ))}
                </div>
            )}
            <Button variant="success" onClick={() => navigate('/add-announcement')}>Dodaj nowe zwierzę</Button>
        </div>
    );
};

export default YourAnimals;
