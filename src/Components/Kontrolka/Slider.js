import React, { useState } from 'react';
import SliderKnob from './SliderKnob';

const Slider = ({
    min = 0,
    max = 100,
    initialValue = 50,
    step = 1,
    onChange = () => {},
    customStyles = {},
    showValue = true, // new prop to control the display of the value
    valueFormatter = (value) => value, // function to format the displayed value
}) => {
    const [value, setValue] = useState(initialValue);
    const [isFocused, setIsFocused] = useState(false);

    const handleDrag = (delta) => {
        const newValue = Math.min(
            max,
            Math.max(min, value + Math.round(delta / 2) * step)
        );
        setValue(newValue);
        onChange(newValue);
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    const handleInputChange = (e) => {
        const newValue = Math.min(max, Math.max(min, Number(e.target.value) || min));
        setValue(newValue);
        onChange(newValue);
    };

    const sliderPercentage = ((value - min) / (max - min)) * 100;

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            {/* Slider */}
            <div
                tabIndex={0} // Make the slider focusable
                onFocus={handleFocus} // Handle focus event
                onBlur={handleBlur} // Handle blur event
                style={{
                    position: 'relative',
                    width: '300px', // Adjust width as needed
                    height: '20px',
                    backgroundColor: '#ddd',
                    borderRadius: '5px',
                    ...customStyles.sliderTrack,
                }}
            >
                {/* Display value in a heart above the knob */}
                {showValue && (
                    <div
                        style={{
                            position: 'absolute',
                            top: '-35px', // Position the heart above the knob
                            left: `${sliderPercentage}%`,
                            transform: 'translateX(-50%)',
                            fontSize: '14px',
                            fontWeight: 'bold',
                            color: '#fff',
                            backgroundColor: '#ff5c8d', // Heart color
                            borderRadius: '50px 50px 0 0',
                            width: '30px',
                            height: '30px',
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            boxShadow: '0 2px 10px rgba(0, 0, 0, 0.3)',
                            ...customStyles.valueText,
                        }}
                        className="slider-value-heart"
                    >
                        {valueFormatter(value)}
                    </div>
                )}

                {/* Active track */}
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

                {/* Slider knob */}
                <SliderKnob position={sliderPercentage} onDrag={handleDrag} />
            </div>

            {/* Numeric input */}
            <div style={{ marginTop: '10px', display: 'flex', alignItems: 'center' }}>
                <input
                    type="number"
                    value={value}
                    onChange={handleInputChange}
                    min={min}
                    max={max}
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
