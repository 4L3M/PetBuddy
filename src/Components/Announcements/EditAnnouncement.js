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
    animal_ids: [],
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

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleAnimalSelection = (animalId) => {
    setFormData((prevData) => {
      const isSelected = prevData.animal_ids.includes(animalId);
      return {
        ...prevData,
        animal_ids: isSelected
          ? prevData.animal_ids.filter((id) => id !== animalId)
          : [...prevData.animal_ids, animalId],
      };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error: updateError } = await supabase
        .from('announcement')
        .update({ ...formData })
        .eq('announcement_id', id);

      if (updateError) throw updateError;
      navigate('/');
    } catch (err) {
      console.error('Błąd podczas aktualizacji ogłoszenia:', err);
      setError('Nie udało się zaktualizować ogłoszenia.');
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
