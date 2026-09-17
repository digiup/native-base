import { render } from 'solid-js/web';
import App from './App.jsx';
// The whole kit, once. Swap for per-component imports:
// import '@native-base/css/components/tokens.css';
// import '@native-base/css/components/button.css';
import '@native-base/css/native-base.css';
import './app.css';

render(() => <App />, document.querySelector('#app'));
