import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.jsx';
// The whole kit, once. Swap for per-component imports:
// import '@native-base/css/components/tokens.css';
// import '@native-base/css/components/button.css';
import '@native-base/css/native-base.css';
import './app.css';

createRoot(document.getElementById('root')).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
