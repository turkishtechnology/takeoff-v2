import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@takeoff-design/tokens/css/default/theme.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
