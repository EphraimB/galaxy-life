import { useState } from 'react';
import { motion } from 'framer-motion';
import styles from './OnboardingForm.module.css';

export interface UserData {
  birthdate: string;
  weight: number;
  height: number;
  unit: 'metric' | 'imperial';
}

interface Props {
  onSubmit: (data: UserData) => void;
}

export default function OnboardingForm({ onSubmit }: Props) {
  const [unit, setUnit] = useState<'metric' | 'imperial'>('metric');
  const [birthdate, setBirthdate] = useState('');
  const [weight, setWeight] = useState('');
  const [height, setHeight] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit({
      birthdate,
      weight: parseFloat(weight),
      height: parseFloat(height),
      unit
    });
  };

  return (
    <motion.div 
      className={`glass-panel ${styles.container}`}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.5 }}
    >
      <h1 className={styles.title}>Galaxy Life</h1>
      <p className={styles.subtitle}>Begin your cosmic journey on Earth.</p>

      <div className={styles.unitToggle}>
        <button 
          className={`${styles.toggleBtn} ${unit === 'metric' ? styles.active : ''}`}
          onClick={() => setUnit('metric')}
          type="button"
        >
          Metric
        </button>
        <button 
          className={`${styles.toggleBtn} ${unit === 'imperial' ? styles.active : ''}`}
          onClick={() => setUnit('imperial')}
          type="button"
        >
          Imperial
        </button>
      </div>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.inputGroup}>
          <label>Birthdate</label>
          <input 
            type="date" 
            className="input-field" 
            value={birthdate}
            onChange={(e) => setBirthdate(e.target.value)}
            required 
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Weight ({unit === 'metric' ? 'kg' : 'lbs'})</label>
          <input 
            type="number" 
            step="0.1"
            className="input-field" 
            placeholder={unit === 'metric' ? "e.g., 70" : "e.g., 150"}
            value={weight}
            onChange={(e) => setWeight(e.target.value)}
            required 
          />
        </div>

        <div className={styles.inputGroup}>
          <label>Height ({unit === 'metric' ? 'cm' : 'inches'})</label>
          <input 
            type="number" 
            step="0.1"
            className="input-field" 
            placeholder={unit === 'metric' ? "e.g., 175" : "e.g., 68"}
            value={height}
            onChange={(e) => setHeight(e.target.value)}
            required 
          />
        </div>

        <button type="submit" className="btn-primary">
          Launch Journey
        </button>
      </form>
    </motion.div>
  );
}
