import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App';
import '@takeoff-ui/react-spar/styles';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
