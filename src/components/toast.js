let timeoutId = null;

export function showToast(message, type = 'success') {
  let el = document.getElementById('toast');

  if (!el) {
    el = document.createElement('div');
    el.id = 'toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }

  el.textContent = message;
  el.className = `toast toast--${type} toast--visible`;

  clearTimeout(timeoutId);
  timeoutId = setTimeout(() => {
    el.classList.remove('toast--visible');
  }, 2800);
}
