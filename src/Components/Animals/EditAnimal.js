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
    animal_photo: '', // Pole na URL zdjęcia
  });
  const [imageFile, setImageFile] = useState(null); // Przechowywanie nowego pliku
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

  // Obsługa wyboru nowego pliku
  const handleFileChange = (e) => {
    setImageFile(e.target.files[0]);
  };

  // Funkcja przesyłania zdjęcia do Supabase Storage
  const uploadImage = async () => {
    if (!imageFile) return formData.animal_photo; // Zwróć obecny URL, jeśli plik nie został zmieniony

    const fileName = `${Date.now()}_${imageFile.name}`;
    const { data, error } = await supabase.storage
      .from('photos') // Nazwa bucketu w Supabase
      .upload(fileName, imageFile);

    if (error) {
      console.error('Błąd przesyłania zdjęcia:', error);
      throw error;
    }

    // Pobieranie URL do zdjęcia
    const { data: publicUrlData } = supabase.storage
      .from('photos')
      .getPublicUrl(fileName);

    return publicUrlData?.publicUrl || null;
  };

  // Obsługa wysyłania formularza
  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // Przesyłanie nowego zdjęcia, jeśli zostało wybrane
      const imageUrl = await uploadImage();

      const { error: updateError } = await supabase
        .from('animals')
        .update({ ...formData, animal_photo: imageUrl }) // Aktualizacja URL zdjęcia
        .eq('animal_id', id);

      if (updateError) throw updateError;
      console.log('Dane zwierzęcia zostały zaktualizowane pomyślnie.');
      navigate('/animals');
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
            <label>
              Aktualne zdjęcie:
              {formData.animal_photo ? (
                <img
                  src={formData.animal_photo}
                  alt="Zdjęcie zwierzęcia"
                  className={styles.preview}
                />
              ) : (
                <p>Brak zdjęcia</p>
              )}
            </label>
            <label>
              Zmień zdjęcie:
              <input
                type="file"
                accept="image/*"
                onChange={handleFileChange}
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
