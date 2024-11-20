import styles from './MainPage.module.css';
import { React, useState } from 'react';
import logo from '../Assets/logo.png';
import { Button } from 'react-bootstrap';  // Import Button component from react-bootstrap

const MainPage = () => {

    const RoleButton = () => {
        const roles = [
            { name: 'Srodek', value: '1' },
            { name: 'Chcę się opiekować zwierzętami', value: '2' },
            { name: 'Szukam opieki dla swojego zwierzęcia', value: '3' },
        ];

        return (
            <div className={styles.buttonGroup}>
                {roles.map((role) => (
                    <Button
                        key={role.value}
                        variant={selectedRole === role.value ? 'primary' : 'secondary'} // Highlight selected role
                        onClick={() => setSelectedRole(role.value)} // Update state on button click
                        className={styles.roleButton} // Custom styles for the button
                    >
                        {role.name}
                    </Button>
                ))}
            </div>
        );
    }

    const [selectedRole, setSelectedRole] = useState('1'); // Default selected role

    const ads = [
        { id: 1, name: "Anna", avatar: "https://example.com/avatar1.png" },
        { id: 2, name: "Jan", avatar: "https://example.com/avatar2.png" },
        { id: 3, name: "Brak zdjęcia", avatar: "" },
    ];

    return (
        <div className={styles.page}>
            <header className={styles.header}> 
                <img src={logo} className={styles.logo} alt="logo" />   
                <div style={{ display: 'flex', flexDirection: 'row' }}>
                    <RoleButton />
                    {/* <select className="goal-select">
                        <option>Wybierz swój cel</option>
                        <option>Szukanie opiekuna</option>
                        <option>Inne</option>
                    </select> */}
                </div>
                <div style={{display:'flex', flexDirection:'column'}}>
                    <button>Zaloguj się</button>
                    <button>Zarejestruj się</button>
                </div>
            </header>

            {/* Filtry i sortowanie */}
            <div className={styles.filters}>
                <button className="filter-button">Filtruj</button>
                Sortuj:
                <select className="sort-select">
                    <option>Odległość</option>
                    <option>Ocena</option>
                </select>
            </div>

            {/* Lista ogłoszeń */}
            <div className={styles.ads}>
                <h2>Wybrane ogłoszenia:</h2>
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

            <footer className={styles.footer}>
                <p>&copy; Amelka</p>
            </footer>
        </div>
    );
}

export default MainPage;
