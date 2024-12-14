import React, { useState, useEffect, useContext } from 'react';
import { Button, Card } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';
import styles from './UserAnnouncements.module.css';

const UserAnnouncements = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();
    const [user, setUser] = useState(null); // Dane użytkownika
    const [announcements, setAnnouncements] = useState([]); // Ogłoszenia użytkownika
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
    
    // Pobierz ogłoszenia powiązane z użytkownikiem
    useEffect(() => {
        const fetchUserAnnouncements = async () => {
            if (!user) return;
            setLoading(true);
            const { data, error } = await supabase
                .from('announcement')
                .select('*')
                .eq('owner_id', user?.id) // Pobierz ogłoszenia dla aktualnego użytkownika
                .order('added_at', { ascending: false }); // Posortuj wg daty dodania
            if (error) {
                console.error('Błąd pobierania ogłoszeń:', error);
            } else {
                setAnnouncements(data);
            }
            setLoading(false);
        };
        fetchUserAnnouncements();
    }, [user, supabase]);

    // Funkcja do usuwania ogłoszenia
    const handleDeleteAnnouncement = async (announcementId) => {
        const { error } = await supabase
            .from('announcement')
            .delete()
            .eq('announcement_id', announcementId); // Usuń ogłoszenie po ID
        if (error) {
            console.error('Błąd usuwania ogłoszenia:', error);
        } else {
            setAnnouncements((prev) => prev.filter((ad) => ad.announcement_id !== announcementId)); // Usuwanie z listy w stanie
        }
    };

    // Funkcja do edycji ogłoszenia
    const handleEditAnnouncement = (announcementId) => {
        navigate(`/edit-announcement/${announcementId}`); // Przekierowanie do strony edycji ogłoszenia
    };

    if (loading) {
        return <div>Ładowanie ogłoszeń...</div>;
    }

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <h1>Twoje ogłoszenia</h1>
                <button 
                    className={styles.backButton} 
                    onClick={() => navigate('/')}>
                    Powrót do strony głównej
                </button>
            </div>
            <div className={styles.container}>
                {announcements.length === 0 ? (
                    <p>Nie masz jeszcze żadnych ogłoszeń.</p>
                ) : (
                    <div className={styles.announcementsList}>
                        {announcements.map((announcement) => (
                            <Card key={announcement.announcement_id} 
                                className={styles.card}>
                                <Card.Body>
                                    <Card.Title>{announcement.name}</Card.Title>
                                    <Card.Text>{announcement.text}</Card.Text>
                                    <Card.Text><strong>Lokalizacja:</strong> {announcement.location}</Card.Text>
                                    <Card.Text><strong>Dodano:</strong> {new Date(announcement.added_at).toLocaleDateString()}</Card.Text>
                                    <button 
                                        variant="primary" 
                                        onClick={() => handleEditAnnouncement(announcement.announcement_id)}>
                                        Edytuj
                                    </button>
                                    <button 
                                        variant="danger" 
                                        onClick={() => handleDeleteAnnouncement(announcement.announcement_id)} 
                                        className="ms-2">
                                        Usuń
                                    </button>
                                </Card.Body>
                            </Card>
                        ))}
                    </div>
                )}
                <button 
                    variant="success" 
                    onClick={() => navigate('/add-announcement')}
                    style={{ width: 'fit-content' }}
                    >
                        Dodaj nowe ogłoszenie
                </button>
            </div>
            <footer className={styles.footer}>
                Amelia &copy
            </footer>
        </div>
    );
};

export default UserAnnouncements;
