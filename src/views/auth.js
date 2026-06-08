import { signIn, signUp } from '../services/auth.js';
import { handleSignedIn } from '../state/auth-state.js';
import { navigate } from '../router/router.js';
import { showToast } from '../components/toast.js';
import { escapeHtml } from '../utils/formatters.js';

let mode = 'login';

export function renderAuth() {
  const isLogin = mode === 'login';

  return `
    <section class="view auth-view">
      <div class="auth-card card">
        <div class="auth-card__header">
          <span class="navbar__logo">⚡</span>
          <h2>SkillForge AI</h2>
          <p class="text-muted">${isLogin ? 'Prisijunk prie savo paskyros' : 'Sukurk naują paskyrą'}</p>
        </div>

        <form class="form" id="auth-form">
          ${!isLogin ? `
            <div class="form-group">
              <label for="auth-name">Vardas</label>
              <input type="text" id="auth-name" placeholder="Tavo vardas" required />
            </div>
          ` : ''}
          <div class="form-group">
            <label for="auth-email">El. paštas</label>
            <input type="email" id="auth-email" placeholder="vardas@example.com" required />
          </div>
          <div class="form-group">
            <label for="auth-password">Slaptažodis</label>
            <input type="password" id="auth-password" minlength="6" placeholder="min. 6 simboliai" required />
          </div>
          <button type="submit" class="btn btn--primary btn--full" id="auth-submit">
            ${isLogin ? 'Prisijungti' : 'Registruotis'}
          </button>
        </form>

        <p class="auth-switch text-muted">
          ${isLogin ? 'Neturi paskyros?' : 'Jau turi paskyrą?'}
          <button type="button" class="btn-link" id="auth-toggle-mode">
            ${isLogin ? 'Registruokis' : 'Prisijunk'}
          </button>
        </p>
      </div>
    </section>
  `;
}

export function bindAuth(root) {
  root.querySelector('#auth-toggle-mode')?.addEventListener('click', () => {
    mode = mode === 'login' ? 'register' : 'login';
    window.dispatchEvent(new CustomEvent('skillforge:rerender'));
  });

  root.querySelector('#auth-form')?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const btn = root.querySelector('#auth-submit');
    const email = root.querySelector('#auth-email').value.trim();
    const password = root.querySelector('#auth-password').value;

    btn.disabled = true;
    btn.textContent = 'Kraunama...';

    try {
      if (mode === 'login') {
        const { user } = await signIn({ email, password });
        if (!user) throw new Error('Prisijungimas nepavyko');
        await handleSignedIn(user);
        showToast('Sėkmingai prisijungta');
        navigate('/dashboard');
      } else {
        const displayName = root.querySelector('#auth-name')?.value.trim() || email.split('@')[0];
        const { user, session } = await signUp({ email, password, displayName });

        if (user && session) {
          await handleSignedIn(user);
          showToast('Paskyra sukurta');
          navigate('/dashboard');
        } else {
          showToast('Patikrink el. paštą ir patvirtink registraciją');
        }
      }
    } catch (err) {
      showToast(err.message || 'Autentifikacijos klaida', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = mode === 'login' ? 'Prisijungti' : 'Registruotis';
    }
  });
}
