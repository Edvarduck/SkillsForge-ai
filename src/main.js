import './styles/variables.css';
import './styles/base.css';
import './styles/layout.css';
import './styles/components.css';
import { initAuth } from './state/auth-state.js';
import { initApp } from './app.js';

async function bootstrap() {
  await initAuth();
  initApp();
}

bootstrap();
