import React, { useContext, useEffect, useState } from 'react';
import styles from './EditAnimal.module.css';
import logo from '../Assets/logo.png';
import { Button } from 'react-bootstrap';
import { useNavigate, useParams } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';

const EditAnimal = () => {
  const { supabase } = useContext(GlobalContext);
  const navigate = useNavigate();
  const { id } = useParams(); // Pobieranie ID zwierzęcia z URL

  const [formData, setFormData] = useState({
    name: '',
    animal_type: '',
    breed: '',
    age: '',
    info: '',
    owner_id: null,
  });
  const [error, setError] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  // Pobieranie danych zwierzęcia do edycji
  useEffect(() => {
    const fetchAnimalData = async () => {
      try {
        setIsLoading(true);
        const { data: animal, error: animalError } = await supabase
          .from('animals')
          .select('*')
          .eq('animal_id', id)
          .single();

        if (animalError) throw animalError;
        setFormData(animal);
      } catch (err) {
        console.error('Błąd podczas pobierania danych zwierzęcia:', err);
        setError('Nie udało się załadować danych zwierzęcia.');
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimalData();
  }, [id, supabase]);

  // Obsługa zmian w formularzu
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
  };

  // Obsługa wysyłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const { error: updateError } = await supabase
        .from('animals')
        .update({ ...formData })
        .eq('animal_id', id);

      if (updateError) throw updateError;
      console.log('Dane zwierzęcia zostały zaktualizowane pomyślnie.');
      navigate('/your-animals');
    } catch (err) {
      console.error('Błąd podczas aktualizacji danych zwierzęcia:', err);
      setError('Nie udało się zaktualizować danych zwierzęcia.');
    }
  };

  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <img src={logo} className={styles.logo} alt="logo" />
        <Button
          variant="danger"
          className={styles.logoutButton}
          onClick={() => navigate('/animals')}
        >
          Twoje zwierzęta
        </Button>
      </header>

      <div className={styles.mainContent}>
        {isLoading ? (
          <p>Ładowanie danych...</p>
        ) : error ? (
          <p className={styles.error}>{error}</p>
        ) : (
          <form onSubmit={handleSubmit} className={styles.editForm}>
            <label>
              Imię:
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
              Zaktualizuj dane
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

export default EditAnimal;
