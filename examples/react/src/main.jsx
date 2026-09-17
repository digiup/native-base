import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// The whole kit, once. Swap for per-component imports:
// import '@digiup/native-base/components/tokens.css';
// import '@digiup/native-base/components/button.css';
import '@digiup/native-base/native-base.css';
import './app.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
