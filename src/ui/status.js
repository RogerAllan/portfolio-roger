/* Barra de status do centro de comando: progresso na página e horário local.
   O setor atual é atualizado por console.js. */
import { T } from './state.js';

let ac = null;

export function initStatus(root) {
  ac?.abort();
  ac = new AbortController();
  const { signal } = ac;
  const prog = root.querySelector('#ccProg'), clock = root.querySelector('#ccClock');
  const fmt = new Intl.DateTimeFormat(T().ui.htmlLang, { hour: '2-digit', minute: '2-digit', timeZone: 'America/Sao_Paulo' });
  const tick = () => { clock.textContent = `${fmt.format(new Date())} ${T().ui.dockTime}`; };
  const onScroll = () => {
    const max = document.documentElement.scrollHeight - innerHeight;
    prog.textContent = `${max > 0 ? Math.round(Math.min(1, scrollY / max) * 100) : 0}%`;
  };
  tick();
  onScroll();
  const timer = setInterval(tick, 20000);
  signal.addEventListener('abort', () => clearInterval(timer));
  addEventListener('scroll', onScroll, { passive: true, signal });
}
