import { render } from 'solid-js/web';
import App from './App.jsx';
// The whole kit, once. Swap for per-component imports:
// import '@digiup/native-base/components/tokens.css';
// import '@digiup/native-base/components/button.css';
import '@digiup/native-base/native-base.css';
import './app.css';

render(() => <App />, document.querySelector('#app'));
