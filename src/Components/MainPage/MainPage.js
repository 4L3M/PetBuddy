import styles from './MainPage.module.css';
import { React, useState } from 'react';
import logo from '../Assets/logo.png';
import { Button } from 'react-bootstrap';
import { useNavigate } from 'react-router-dom';

const MainPage = () => {
    const navigate = useNavigate();

    const ads = [
        { id: 1, name: "Anna", avatar: "https://example.com/avatar1.png" },
        { id: 2, name: "Jan", avatar: "https://example.com/avatar2.png" },
        { id: 3, name: "Brak zdjęcia", avatar: "" },
    ];

    const sitterFilters = [
        { id: 1, label: 'Wybór gatunku:', type: 'select', options: ['Kot', 'Pies', 'Inne'] },
        { id: 2, label: 'Rozmiar zwierzęcia:', type: 'select', options: ['Małe', 'Średnie', 'Duże'] },
        { id: 3, label: 'Stan zdrowia:', type: 'select', options: ['Zdrowe', 'Chore'] },
        { id: 4, label: 'Chwilowa opieka', type: 'checkbox', checked: false },
        { id: 5, label: 'Regularna opieka', type: 'checkbox', checked: false },
        { id: 6, label: 'Długoterminowa opieka', type: 'checkbox', checked: false },
    ];

    const ownerFilters = [
        { id: 1, label: 'Ocena użytkownika:', type: 'range', min: 0, max: 5, value: 0 },
        { id: 2, label: 'Spacer', type: 'checkbox', checked: false },
        { id: 3, label: 'Wizyta u lekarza', type: 'checkbox', checked: false },
        { id: 4, label: 'Chwilowa opieka', type: 'checkbox', checked: false },
        { id: 5, label: 'Regularna opieka', type: 'checkbox', checked: false },
        { id: 6, label: 'Długoterminowa opieka', type: 'checkbox', checked: false },
    ];

    const getFiltersForRole = (role) => (role === 'sitter' ? sitterFilters : ownerFilters);

    const [selectedRole, setSelectedRole] = useState('1'); // Domyślna rola
    const [selectedFilters, setSelectedFilters] = useState(getFiltersForRole('1')); // Domyślne filtry

    const handleRoleChange = (role) => {
        setSelectedRole(role);
        setSelectedFilters(getFiltersForRole(role)); // Ustaw filtry na podstawie roli
        if (role == 'sitter'){
        
        }
    };

    const handleFilterChange = (id, value) => {
        setSelectedFilters((prevFilters) =>
            prevFilters.map((filter) =>
                filter.id === id
                    ? { ...filter, ...(filter.type === 'checkbox' ? { checked: !filter.checked } : { value }) }
                    : filter
            )
        );
    };

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header}>
                <img src={logo} className={styles.logo} alt="logo" />
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div className={styles.buttonGroup}>
                        <Button
                            variant={selectedRole === 'sitter' ? 'primary' : 'secondary'}
                            onClick={() => handleRoleChange('sitter')}
                            className={styles.roleButton}
                        >
                            Chcę się opiekować zwierzętami
                        </Button>
                        <Button
                            variant={selectedRole === 'owner' ? 'primary' : 'secondary'}
                            onClick={() => handleRoleChange('owner')}
                            className={styles.roleButton}
                        >
                            Szukam opieki dla swojego zwierzęcia
                        </Button>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button onClick={() => navigate('/login')}> Zaloguj się</button>
                    <button onClick={() => navigate('/register')}>Zarejestruj się</button>
                </div>
            </header>

            {/* Main Content */}
            <div className={styles.mainContent}>
                {/* Filters Section */}
                <div className={styles.sideFilters}>
                    <h3>Filtry</h3>
                    {selectedFilters.map((filter) => (
                        <label key={filter.id} className={styles.filterOption}>
                            {filter.type === 'checkbox' && (
                                <input
                                    type="checkbox"
                                    checked={filter.checked}
                                    onChange={() => handleFilterChange(filter.id)}
                                />
                            )}
                            {filter.label}
                        </label>
                    ))}
                </div>

                {/* Ads Section */}
                <div className={styles.ads}>
                    <h2>Wybrane ogłoszenia:</h2>
                    <div className={styles.sortSection}>
                        Sortuj:
                        <select className="sort-select">
                            <option>Odległość</option>
                            <option>Ocena</option>
                        </select>
                    </div>
                    <div className={styles.adsList}>
                        {ads.map((ad) => (
                            <div key={ad.id} className={styles.adCard}>
                                <img src={ad.avatar} alt={ad.name} className={styles.avatar} />
                                <p>{ad.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Footer */}
            <footer className={styles.footer}>
                <p>&copy; </p>
            </footer>
        </div>
    );
};

export default MainPage;
