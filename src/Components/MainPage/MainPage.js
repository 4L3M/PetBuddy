import styles from './MainPage.module.css';
import { React, useState } from 'react';
import logo from '../Assets/logo.png';
import { Button } from 'react-bootstrap';

const MainPage = () => {
    const [selectedRole, setSelectedRole] = useState('1'); // Default selected role

    const ads = [
        { id: 1, name: "Anna", avatar: "https://example.com/avatar1.png" },
        { id: 2, name: "Jan", avatar: "https://example.com/avatar2.png" },
        { id: 3, name: "Brak zdjęcia", avatar: "" },
    ];

    const filters = [
        { id: 1, label: 'Tylko z oceną powyżej 4.0', checked: false },
        { id: 2, label: 'Tylko w promieniu 10 km', checked: false },
        { id: 3, label: 'Tylko dostępne teraz', checked: false },
    ];

    const [selectedFilters, setSelectedFilters] = useState(
        filters.map((filter) => ({ ...filter }))
    );

    const handleFilterChange = (id) => {
        setSelectedFilters((prevFilters) =>
            prevFilters.map((filter) =>
                filter.id === id ? { ...filter, checked: !filter.checked } : filter
            )
        );
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <img src={logo} className={styles.logo} alt="logo" />
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <div className={styles.buttonGroup}>
                        <Button
                            variant={selectedRole === '2' ? 'primary' : 'secondary'}
                            onClick={() => setSelectedRole('2')}
                            className={styles.roleButton}
                        >
                            Chcę się opiekować zwierzętami
                        </Button>
                        <Button
                            variant={selectedRole === '3' ? 'primary' : 'secondary'}
                            onClick={() => setSelectedRole('3')}
                            className={styles.roleButton}
                        >
                            Szukam opieki dla swojego zwierzęcia
                        </Button>
                    </div>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column' }}>
                    <button>Zaloguj się</button>
                    <button>Zarejestruj się</button>
                </div>
            </header>

            <div className={styles.mainContent}>
                {/* Sekcja filtrów */}
                <div className={styles.sideFilters}>
                    <h3>Filtry</h3>
                    {selectedFilters.map((filter) => (
                        <label key={filter.id} className={styles.filterOption}>
                            <input
                                type="checkbox"
                                checked={filter.checked}
                                onChange={() => handleFilterChange(filter.id)}
                            />
                            {filter.label}
                        </label>
                    ))}
                </div>

                {/* Sekcja ogłoszeń */}
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
                                <img
                                    src={ad.avatar}
                                    alt={ad.name}
                                    className={styles.avatar}
                                />
                                <p>{ad.name}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <footer className={styles.footer}>
                <p>&copy; Amelka</p>
            </footer>
        </div>
    );
};

export default MainPage;
