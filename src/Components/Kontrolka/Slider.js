import React, { useState } from 'react';
import SliderKnob from './SliderKnob';
import { UIEvent } from './UIEvent'; // Import UIEvent class
import styles from './Slider.module.css';

const Slider = ({
    minValue = 0,
    maxValue = 100,
    initialValue = 50,
    step = 1,
    onChange = () => {},
    onEvent = () => {}, // Receive event handler as prop
    customStyles = {},
    showValue = true,
    valueFormatter = (value) => value,
}) => {
    const [value, setValue] = useState(initialValue);

    const handleDrag = (delta) => {
        const newValue = Math.min(
            maxValue,
            Math.max(minValue, value + Math.round(delta / 2) * step)
        );
        setValue(newValue);
        onChange(newValue);
        onEvent(new UIEvent('drag', { delta, newValue })); // Emit drag event
    };

    const handleInputChange = (e) => {
        const newValue = Math.min(
            maxValue,
            Math.max(minValue, Number(e.target.value) || minValue)
        );
        setValue(newValue);
        onChange(newValue);
        onEvent(new UIEvent('inputChange', { newValue })); // Emit input change event
    };

    const sliderPercentage = ((value - minValue) / (maxValue - minValue)) * 100;

    const handleSliderClick = (e) => {
        const sliderRect = e.target.getBoundingClientRect();
        const clickPosition = e.clientX - sliderRect.left;
        const newSliderPercentage = (clickPosition / sliderRect.width) * 100;
        const newValue = Math.round(((newSliderPercentage / 100) * (maxValue - minValue)) + minValue);
        setValue(Math.min(maxValue, Math.max(minValue, newValue)));
        onChange(newValue);
        onEvent(new UIEvent('click', { clickPosition, newValue }));
    };

    return (
        <div className={styles.main}>
            <div className={styles.slider} onClick={handleSliderClick}>
                {showValue && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '-40px',
                            left: `${sliderPercentage}%`,
                            transform: 'translateX(-50%)',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            width: '40px',
                            height: '40px',
                            backgroundColor: '#ff5c8d',
                            clipPath:
                                'path("M20 0C31.0457 0 40 8.95431 40 20C40 26.6274 35.4789 32.2137 29.064 36.2701C26.2084 38.0371 23.0828 39.4922 20.3477 40.6805C20.1911 40.7468 20.0938 40.7801 20 40.8221C19.9062 40.7801 19.8089 40.7468 19.6523 40.6805C16.9172 39.4922 13.7916 38.0371 10.936 36.2701C4.52113 32.2137 0 26.6274 0 20C0 8.95431 8.95431 0 20 0Z")',
                            ...customStyles.valueHeart,
                        }}
                    >
                        <span style={{ color: '#fff', fontSize: '12px', fontWeight: 'bold' }}>
                            {valueFormatter(value)}
                        </span>
                    </div>
                )}
                <div
                    style={{
                        position: 'absolute',
                        height: '100%',
                        width: `${sliderPercentage}%`,
                        backgroundColor: '#6cd1d8',
                        borderRadius: '5px',
                        ...customStyles.sliderProgress,
                    }}
                ></div>
                <SliderKnob position={sliderPercentage} onDrag={handleDrag} />
            </div>
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                <input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    minValue={minValue}
                    maxValue={maxValue}
                    step={step}
                    style={{
                        width: '60px',
                        padding: '5px',
                        fontSize: '14px',
                        textAlign: 'center',
                        border: '1px solid #ccc',
                        borderRadius: '5px',
                        marginRight: '10px',
                    }}
                />
                <span>Value</span>
            </div>
        </div>
    );
};

export default Slider;
