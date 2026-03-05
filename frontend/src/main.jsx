import { StrictMode, useEffect, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { gsap } from 'gsap';
import './index.css';
import App from './App.jsx';

function AnimatedApp() {
  const appRef = useRef(null);

  useEffect(() => {
    if (appRef.current) {
      gsap.fromTo(
        appRef.current,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.6, ease: 'power2.out' }
      );

      gsap.from('.form-control, .form-select', {
        opacity: 0,
        y: 8,
        duration: 0.4,
        ease: 'power2.out',
        stagger: 0.03,
        delay: 0.1
      });
    }
  }, []);

  return (
    <div ref={appRef}>
      <App />
    </div>
  );
}

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <AnimatedApp />
  </StrictMode>
);
