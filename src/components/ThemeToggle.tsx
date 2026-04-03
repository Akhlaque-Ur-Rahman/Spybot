'use client';
import { useRef, useEffect, useState } from 'react';
import { useTheme, type Theme } from '@/context/ThemeContext';
import styles from './ThemeToggle.module.css';
import { Sun, Moon, Monitor, Check } from 'lucide-react';

const OPTIONS: { value: Theme; Icon: any; label: string }[] = [
  { value: 'light',  Icon: Sun,     label: 'Light'  },
  { value: 'dark',   Icon: Moon,    label: 'Dark'   },
  { value: 'system', Icon: Monitor, label: 'System' },
];

export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const current = OPTIONS.find((o) => o.value === theme) ?? OPTIONS[0];

  return (
    <div className={styles.wrapper} ref={ref}>
      <button
        className={styles.trigger}
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Switch theme"
        title={`Theme: ${current.label}`}
        id="theme-toggle-btn"
      >
        <current.Icon size={16} strokeWidth={2} />
      </button>

      {open && (
        <div className={styles.dropdown} role="listbox" aria-label="Theme options">
          {OPTIONS.map(({ value, Icon, label }) => (
            <button
              key={value}
              role="option"
              aria-selected={theme === value}
              className={`${styles.option} ${theme === value ? styles.active : ''}`}
              onClick={() => { setTheme(value); setOpen(false); }}
              id={`theme-opt-${value}`}
            >
              <span className={styles.optIcon}><Icon size={14} strokeWidth={2} /></span>
              <span>{label}</span>
              {theme === value && (
                <span className={styles.check}><Check size={14} strokeWidth={3} /></span>
              )}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
