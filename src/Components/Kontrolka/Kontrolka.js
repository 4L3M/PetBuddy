import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { GlobalContext } from '../../GlobalContext';

import styles from './Kontrolka.module.css';
import Slider from './Slider';
import { EventListener } from './EventListener';

const Kontrolka = () => {
    const { supabase } = useContext(GlobalContext);
    const navigate = useNavigate();

    const sliderListener = new EventListener();

    const handleSliderChange = (value) => {
        console.log(`Slider value: ${value}`);
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h3>Przykład Slidera</h3>
            </header>

            <div className={styles.mainContent}>
                
                <Slider onChange={handleSliderChange} />
                

            </div>

            <footer className={styles.footer}>
                <p>&copy; Inżynieria oprogramowania</p>
            </footer>
        </div>
    );
};

export default Kontrolka;
