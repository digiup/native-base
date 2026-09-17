import { mount } from 'svelte';
import App from './App.svelte';
// The whole kit, once. Swap for per-component imports:
// import '@native-base/css/components/tokens.css';
// import '@native-base/css/components/button.css';
import '@native-base/css/native-base.css';
import './app.css';

mount(App, { target: document.querySelector('#app') });
