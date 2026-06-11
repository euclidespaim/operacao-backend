import { playBeep } from './sound.js';
import { API_URL, PING_INTERVAL } from './config.js';

let localServerOnline = false;
let checkInterval = null;

export function isLocalServerOnline() {
  return localServerOnline;
}

export function initLocalServerChecker() {
  const indicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const badge = document.getElementById('live-status-badge');
  const footerVal = document.getElementById('footer-connection-val');
  
  async function pingServer() {
    if (!indicator) return;
    indicator.className = 'status-dot checking';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch(`${API_URL}/agentes`, {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        if (!localServerOnline) {
          playBeep('success');
        }
        localServerOnline = true;
        
        indicator.className = 'status-dot online';
        statusText.textContent = 'API LOCAL ONLINE (PORTA 3000)';
        
        if (badge) {
          badge.textContent = 'CONECTADO';
          badge.className = 'live-panel-status connected';
        }
        
        if (footerVal) {
          footerVal.textContent = 'ONLINE';
          footerVal.style.color = 'var(--neon-green)';
        }
        
        // Dispatch data to sandbox component
        window.dispatchEvent(new CustomEvent('server-data', { detail: data }));
      } else {
        throw new Error("Bad response");
      }
    } catch(err) {
      if (localServerOnline) {
        playBeep('error');
      }
      localServerOnline = false;
      
      indicator.className = 'status-dot';
      statusText.textContent = 'API LOCAL OFFLINE';
      
      if (badge) {
        badge.textContent = 'DESCONECTADO';
        badge.className = 'live-panel-status';
      }
      
      if (footerVal) {
        footerVal.textContent = 'OFFLINE';
        footerVal.style.color = '';
      }
      
      // Dispatch offline status to sandbox component
      window.dispatchEvent(new CustomEvent('server-offline'));
    }
  }
  
  pingServer();
  if (checkInterval) clearInterval(checkInterval);
  checkInterval = setInterval(pingServer, PING_INTERVAL);
}
