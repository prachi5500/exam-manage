import React, { useState, useEffect } from 'react';

const Timer = ({ duration, onTimeUp }) => {
    const [timeLeft, setTimeLeft] = useState(duration * 60); // duration in minutes

    useEffect(() => {
        if (timeLeft <= 0) {
            onTimeUp();
            return;
        }
        const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
        return () => clearTimeout(timer);
    }, [timeLeft, onTimeUp]);

    const formatTime = (seconds) => {
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
    };

    return (
        <div className="text-right text-lg font-bold text-red-600">
            Time Left: {formatTime(timeLeft)}
        </div>
    );
};

export default Timer;

