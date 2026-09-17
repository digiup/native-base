import { mount } from 'svelte';
import App from './App.svelte';
// The whole kit, once. Swap for per-component imports:
// import '@digiup/native-base/components/tokens.css';
// import '@digiup/native-base/components/button.css';
import '@digiup/native-base/native-base.css';
import './app.css';

mount(App, { target: document.querySelector('#app') });
