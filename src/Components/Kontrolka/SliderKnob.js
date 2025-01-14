import { on } from 'events';
import React from 'react';
import { useState } from 'react';
import styles from './SliderKnob.module.css';

const SliderKnob = ({ position, onDrag }) => {
    const [dragging, setDragging] = useState(false);

    const handleMouseDown = (e) => {
        e.preventDefault();
        setDragging(true);
        const startX = e.clientX;

        const handleMouseMove = (moveEvent) => {
            const delta = moveEvent.clientX - startX;
            onDrag(delta);
        
            const slowDownFactor = 2;
            onDrag(delta / slowDownFactor);
        };


        const handleMouseUp = () => {
            document.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseup', handleMouseUp);
        };

        document.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseup', handleMouseUp);
    };

    return (
        <div 
            className = {styles.sliderKnob}
            style = {{
                position: 'absolute',
                left: `${position}%`,
                backgroundColor: dragging ? '#ff5c8d' : '#333',
            }}
            onMouseDown={handleMouseDown}

        />
    );
};

export default SliderKnob;
