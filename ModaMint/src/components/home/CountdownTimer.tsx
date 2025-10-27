import React, { useState, useEffect } from 'react';
import styles from './styles.module.css'; 

interface CountdownTimerProps {

  durationInSeconds: number;
}

const formatTime = (totalSeconds: number): string => {

  const clampedSeconds = Math.max(0, totalSeconds);

  const hours = Math.floor(clampedSeconds / 3600);
  const minutes = Math.floor((clampedSeconds % 3600) / 60);
  const seconds = clampedSeconds % 60;

  const pad = (num: number) => num.toString().padStart(2, '0');

  return `${pad(hours)}:${pad(minutes)}:${pad(seconds)}`;
};


export const CountdownTimer: React.FC<CountdownTimerProps> = ({ durationInSeconds }) => {

  const [remainingTime, setRemainingTime] = useState(durationInSeconds);

  useEffect(() => {
    setRemainingTime(durationInSeconds);
  }, [durationInSeconds]);

  useEffect(() => {

    if (remainingTime <= 0) {
      return;
    }

    const intervalId = setInterval(() => {
      setRemainingTime(prevTime => prevTime - 1);
    }, 1000);

    return () => clearInterval(intervalId);

  }, [remainingTime]); 

  return (
    <h2 className={styles.time_count_text}>
      {formatTime(remainingTime)}
    </h2>
  );
};