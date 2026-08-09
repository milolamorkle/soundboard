import './app.css';
import App from './App.svelte';
import { loadCatalog } from './lib/catalog';
import { registerSW } from 'virtual:pwa-register';

registerSW({ immediate: true });
void loadCatalog();

const app = new App({
  target: document.getElementById('app')!
});

export default app;
