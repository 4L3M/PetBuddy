import React, { useContext } from 'react';
import { GlobalContext } from '../../GlobalContext';
import styles from './Kontrolka.module.css';
import Slider from './Slider';
import { EventListener } from './EventListener';  // Import EventListener

const Kontrolka = () => {
    const { supabase } = useContext(GlobalContext);

    const sliderListener = new EventListener();

    // Event handler, which will handle events triggered from UIControl
    const handleEvent = (event) => {
        console.log(`Event received: ${event.type}`);
        // You can add more logic to handle the event, for example:
        if (event.type === 'click') {
            // Handle click event
        }
    };

    const handleSliderChange = (value) => {
        console.log(`Slider value: ${value}`);
    };

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <h3>Przykład Slidera</h3>
            </header>

            <div className={styles.mainContent}>
                {/* Pass handleEvent as prop to Slider */}
                <Slider onChange={handleSliderChange} onEvent={handleEvent} />
            </div>

            <footer className={styles.footer}>
                <p>&copy; Inżynieria oprogramowania</p>
            </footer>
        </div>
    );
};

export default Kontrolka;
