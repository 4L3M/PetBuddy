import React, { useContext, useEffect, useState } from 'react';
import styles from './EditAnnouncement.module.css';
import logo from '../Assets/logo.png';
import { Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';

const EditAnnouncement = () => {
  const { supabase } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { id } = useParams(); // Pobieranie ID ogłoszenia z URL

  const [formData, setFormData] = useState({
    name: '',
    text: '',
    announcement_type: '',
    location: '',
    added_at: '',
    active: true,
    animal_id: '',
    owner_id: '',
  });
  const [userAnimals, setUserAnimals] = useState([]); // Lista zwierząt użytkownika
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setIsLoading(true);

        // Pobierz dane ogłoszenia
        const { data: announcement, error: announcementError } = await supabase
          .from('announcement')
          .select('*')
          .eq('announcement_id', id)
          .single();

        if (announcementError) throw announcementError;
        setFormData(announcement);

        // Pobierz dane użytkownika
        const { data: session } = await supabase.auth.getSession();
        const userId = session?.user?.id;

        if (userId) {
          // Pobierz zwierzęta należące do użytkownika
          const { data: animals, error: animalsError } = await supabase
            .from('animals')
            .select('animal_id, name')
            .eq('owner_id', userId);

          if (animalsError) throw animalsError;
          setUserAnimals(animals || []);

          // Ustaw owner_id w formularzu
          setFormData((prevData) => ({ ...prevData, owner_id: userId }));
        }
      } catch (err) {
        console.error('Błąd podczas pobierania danych:', err);
        setError('Nie udało się załadować danych.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [id, supabase]);

  useEffect(() => {
    const fetchUserAnimals = async () => {
        const { data: userData } = await supabase.auth.getUser();
 
        if (userData?.user) {
            console.log('Zalogowany użytkownik:', userData.user); // Logowanie użytkownika
            const { data: animals, error } = await supabase
                .from('animals')
                .select('animal_id, name, animal_type')
                .eq('owner_id', userData.user.id);
 
            if (error) {
                console.error('Błąd pobierania zwierząt:', error);
            } else {
                console.log('Pobrane zwierzęta:', animals); // Logowanie pobranych zwierząt
                setUserAnimals(animals || []); // Aktualizacja stanu
            }
        } else {
            console.log('Brak danych użytkownika!');
        }
    };

    fetchUserAnimals();
}, [supabase]);


  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAnimalSelection = async (animalId) => {
    const selectedAnimal = userAnimals.find(animal => animal.animal_id === animalId);
    
    if (selectedAnimal) {
      // Ustawiamy animal_type na wartość zwierzęcia
      setFormData((prevData) => ({
        ...prevData,
        animal_id: animalId,
        animal_type: selectedAnimal.animal_type, // Ustawiamy typ zwierzęcia
      }));
  
      // Po wybraniu zwierzęcia, zaktualizujemy ogłoszenie w bazie danych
      try {
        const { error } = await supabase
          .from('announcement')
          .update({
            animal_type: selectedAnimal.animal_type, // Zaktualizowanie typu zwierzęcia
          })
          .eq('announcement_id', id);
  
        if (error) throw error;
      } catch (err) {
        console.error('Błąd podczas aktualizacji animal_type:', err);
        setError('Nie udało się zaktualizować typu zwierzęcia.');
      }
    }
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error: updateError } = await supabase
        .from('announcement')
        .update({
          ...formData, // Zaktualizowanie całych danych formularza
          animal_type: formData.animal_type, // Dodajemy animal_type do aktualizacji
        })
        .eq('announcement_id', id);
  
      if (updateError) throw updateError;
      navigate('/'); // Po pomyślnym zaktualizowaniu ogłoszenia, przekierowanie na stronę główną
    } catch (err) {
      console.error('Błąd podczas aktualizacji ogłoszenia:', err);
      setError('Nie udało się zaktualizować ogłoszenia.');
    }
  };
  

  const toggleActiveStatus = async () => {
    try {
      // Zmieniamy status aktywności ogłoszenia
      const { error: updateError } = await supabase
        .from('announcement')
        .update({ active: !formData.active })
        .eq('announcement_id', id);

      if (updateError) throw updateError;
      
      // Po pomyślnym zaktualizowaniu, zmieniamy stan aktywności w formularzu
      setFormData((prevData) => ({ ...prevData, active: !prevData.active }));
    } catch (err) {
      console.error('Błąd podczas aktualizacji statusu aktywności:', err);
      setError('Nie udało się zmienić statusu aktywności ogłoszenia.');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <img src={logo} className={styles.logo} alt="logo" />
        <Button
          variant="danger"
          className={styles.logoutButton}
          onClick={() => navigate('/')}
        >
          Strona główna
        </Button>
      </header>

      <div className={styles.mainContent}>
        {isLoading ? (
          <p>Ładowanie danych...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.newAdd}>
            <label>
              Typ ogłoszenia:
              <div className={styles.buttonGroup}>
                <button
                  type="button"
                  className={`${styles.typeButton} ${formData.announcement_type === 'offering_services' ? styles.active : ''}`}
                  onClick={() =>
                    setFormData((prevData) => ({
                      ...prevData,
                      announcement_type: 'offering_services',
                      animal_id: '', // Resetowanie wyboru zwierząt
                    }))
                  }
                >
                  Chcę się opiekować
                </button>
                <button
                  type="button"
                  className={`${styles.typeButton} ${formData.announcement_type === 'looking_for_sitter' ? styles.active : ''}`}
                  onClick={() =>
                    setFormData((prevData) => ({
                      ...prevData,
                      announcement_type: 'looking_for_sitter',
                    }))
                  }
                >
                  Szukam opiekuna
                </button>
              </div>
            </label>

            {formData.announcement_type === 'looking_for_sitter' && (
              <div>
                <p>Wybierz zwierzęta, które potrzebują opieki:</p>
                {userAnimals.length === 0 ? (
                    <p>Nie posiadasz żadnych zwierząt.</p>
                ) : (
                    <select
                        name="animal_id"
                        className={styles.animalSelect}
                        value={formData.animal_id}
                        onChange={(e) => handleAnimalSelection(e.target.value)} // Zmieniamy na handleAnimalSelection
                        required={formData.announcement_type === 'looking_for_sitter'}
                    >
                        <option value="">Wybierz...</option>
                        {userAnimals.map((animal) => (
                            <option key={animal.animal_id} value={animal.animal_id}>
                                {animal.name}
                            </option>
                        ))}
                    </select>
                )}
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
              Lokalizacja:
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
              Data:
              <input
                type="datetime-local"
                name="added_at"
                value={formData.added_at}
                onChange={handleInputChange}
              />
            </label>

            <Button type="submit" variant="success">
              Zaktualizuj ogłoszenie
            </Button>

            <Button
              variant={formData.active ? 'danger' : 'success'}
              className={`${styles.toggleActiveButton} ${formData.active ? styles.disabled : ''}`}
              onClick={toggleActiveStatus}
            >
              {formData.active ? 'Wyłącz' : 'Aktywuj'} ogłoszenie
            </Button>
          </form>
        )}
      </div>

      <footer className={styles.footer}>
        <p>&copy; Amelia</p>
      </footer>
    </div>
  );
};

export default EditAnnouncement;
