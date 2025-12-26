// import React, { useState, useEffect } from 'react';

// const Timer = ({ duration, onTimeUp }) => {
//     const [timeLeft, setTimeLeft] = useState(duration * 60); // duration in minutes

//     useEffect(() => {
//         if (timeLeft <= 0) {
//             onTimeUp();
//             return;
//         }
//         const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
//         return () => clearTimeout(timer);
//     }, [timeLeft, onTimeUp]);

//     const formatTime = (seconds) => {
//         const mins = Math.floor(seconds / 60);
//         const secs = seconds % 60;
//         return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
//     };

//     return (
//         <div className="text-right text-lg font-bold text-red-600">
//             Time Left: {formatTime(timeLeft)}
//         </div>
//     );
// };

// export default Timer;



import React, { useState, useEffect, useCallback } from 'react';
import { Clock, AlertCircle } from 'lucide-react';

const Timer = ({ duration, onTimeUp, onTick }) => {
  const [timeLeft, setTimeLeft] = useState(duration * 60); // Convert minutes to seconds
  const [isRunning, setIsRunning] = useState(true);

  const formatTime = useCallback((seconds) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    
    if (hours > 0) {
      return `${hours}:${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
    }
    return `${minutes}:${secs.toString().padStart(2, '0')}`;
  }, []);

  useEffect(() => {
    let interval;
    
    if (isRunning && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          const newTime = prev - 1;
          
          // Call onTick callback with remaining time
          if (onTick) {
            onTick(newTime);
          }
          
          // Warning at 5 minutes and 1 minute
          if (newTime === 300 || newTime === 60) {
            // You can add toast notifications here
            console.log(`Warning: ${Math.floor(newTime / 60)} minutes remaining`);
          }
          
          return newTime;
        });
      }, 1000);
    } else if (timeLeft === 0 && isRunning) {
      setIsRunning(false);
      if (onTimeUp) {
        onTimeUp();
      }
    }
    
    return () => {
      if (interval) clearInterval(interval);
    };
  }, [isRunning, timeLeft, onTimeUp, onTick]);

  const pauseTimer = () => {
    setIsRunning(false);
  };

  const resumeTimer = () => {
    setIsRunning(true);
  };

  const addTime = (minutes) => {
    setTimeLeft(prev => prev + (minutes * 60));
  };

  const timePercentage = (timeLeft / (duration * 60)) * 100;
  const isWarning = timeLeft <= 300; // 5 minutes or less
  const isCritical = timeLeft <= 60; // 1 minute or less

  return (
    <div className={`p-4 rounded-lg ${isCritical ? 'bg-red-50 border border-red-200' : isWarning ? 'bg-yellow-50 border border-yellow-200' : 'bg-green-50 border border-green-200'}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center">
          <Clock className={`w-5 h-5 mr-2 ${isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'}`} />
          <span className="text-sm font-medium">
            {isCritical ? 'Time Critical!' : isWarning ? 'Time Running Out!' : 'Time Remaining'}
          </span>
        </div>
        
        <div className="flex space-x-2">
          <button
            onClick={isRunning ? pauseTimer : resumeTimer}
            className="text-xs px-2 py-1 bg-gray-100 hover:bg-gray-200 rounded"
          >
            {isRunning ? 'Pause' : 'Resume'}
          </button>
          <button
            onClick={() => addTime(5)}
            className="text-xs px-2 py-1 bg-blue-100 text-blue-700 hover:bg-blue-200 rounded"
          >
            +5 min
          </button>
        </div>
      </div>
      
      <div className="text-center mb-3">
        <div className={`text-3xl md:text-4xl font-bold ${isCritical ? 'text-red-600' : isWarning ? 'text-yellow-600' : 'text-green-600'}`}>
          {formatTime(timeLeft)}
        </div>
        <div className="text-xs text-gray-500 mt-1">
          Total duration: {duration} minutes
        </div>
      </div>
      
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className={`h-2 rounded-full transition-all duration-1000 ${isCritical ? 'bg-red-500' : isWarning ? 'bg-yellow-500' : 'bg-green-500'}`}
          style={{ width: `${timePercentage}%` }}
        ></div>
      </div>
      
      {isWarning && (
        <div className="flex items-center mt-3 text-sm">
          <AlertCircle className="w-4 h-4 mr-2 text-yellow-600" />
          <span className="text-yellow-700">
            {isCritical ? 'Less than 1 minute remaining!' : 'Less than 5 minutes remaining!'}
          </span>
        </div>
      )}
    </div>
  );
};

export default Timer;
