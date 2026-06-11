import { playBeep } from './sound.js';
import { API_URL } from './config.js';
import { isLocalServerOnline } from './checker.js';

export function initSandboxCrud() {
  const btnGet = document.getElementById('btn-submit-get');
  const btnPost = document.getElementById('btn-submit-post');
  const btnPut = document.getElementById('btn-submit-put');
  const btnPatch = document.getElementById('btn-submit-patch');
  const btnDelete = document.getElementById('btn-submit-delete');
  
  if (!btnPost) return; // Only bind if dashboard form elements exist in current DOM view
  
  function getInputs() {
    const id = document.getElementById('sandbox-agent-id').value.trim();
    const nome = document.getElementById('sandbox-agent-name').value.trim();
    const status = document.getElementById('sandbox-agent-status').value;
    return { id, nome, status };
  }
  
  function clearFields() {
    document.getElementById('sandbox-agent-id').value = '';
    document.getElementById('sandbox-agent-name').value = '';
  }
  
  function checkOffline() {
    if (!isLocalServerOnline()) {
      playBeep('error');
      alert('⚠️ Erro de Rota! Não é possível disparar ações com o servidor offline.\nInicie o servidor (npx json-server db.json) no VS Code primeiro.');
      return true;
    }
    return false;
  }
  
  function triggerButtonSuccess(btn, successMsg) {
    playBeep('success');
    const originalText = btn.textContent;
    btn.textContent = successMsg;
    btn.disabled = true;
    
    setTimeout(() => {
      btn.textContent = originalText;
      btn.disabled = false;
    }, 1800);
  }

  // GET Request Action (Consultar)
  if (btnGet) {
    btnGet.addEventListener('click', async () => {
      if (checkOffline()) return;
      const { id } = getInputs();
      
      try {
        if (id) {
          const res = await fetch(`${API_URL}/agentes/${id}`);
          if (res.ok) {
            const agent = await res.json();
            renderAgents([agent]); // render single agent as an array
            triggerButtonSuccess(btnGet, 'GET: ENCONTRADO!');
            clearFields();
          } else {
            throw new Error();
          }
        } else {
          const res = await fetch(`${API_URL}/agentes`);
          if (res.ok) {
            const data = await res.json();
            renderAgents(data);
            triggerButtonSuccess(btnGet, 'GET: CARREGADOS!');
            clearFields();
          } else {
            throw new Error();
          }
        }
      } catch(err) {
        playBeep('error');
        alert(id ? `❌ Falha no GET!\nO Agente com ID ${id} não existe no banco de dados local.` : '❌ Falha no GET!\nNão foi possível carregar os agentes.');
      }
    });
  }
  
  // POST Request Action
  btnPost.addEventListener('click', async () => {
    if (checkOffline()) return;
    const { id, nome, status } = getInputs();
    
    if (!id || !nome) {
      alert('⚠️ Preencha os campos ID e Nome para efetuar a inclusão.');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/agentes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, nome, status })
      });
      
      if (res.ok) {
        triggerButtonSuccess(btnPost, 'POST: CRIADO COM SUCESSO!');
        clearFields();
      } else {
        throw new Error();
      }
    } catch(err) {
      playBeep('error');
      alert('❌ Falha no POST!\nCertifique-se de que o ID informado não seja duplicado.');
    }
  });

  // PUT Request Action
  btnPut.addEventListener('click', async () => {
    if (checkOffline()) return;
    const { id, nome, status } = getInputs();
    
    if (!id || !nome) {
      alert('⚠️ Preencha os campos ID e Nome para atualizar o registro.');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/agentes/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome, status })
      });
      
      if (res.ok) {
        triggerButtonSuccess(btnPut, 'PUT: REGISTRO ATUALIZADO!');
        clearFields();
      } else {
        throw new Error();
      }
    } catch(err) {
      playBeep('error');
      alert(`❌ Falha no PUT!\nO Agente com ID ${id} existe no banco de dados local?`);
    }
  });

  // PATCH Request Action
  if (btnPatch) {
    btnPatch.addEventListener('click', async () => {
      if (checkOffline()) return;
      const { id, status } = getInputs();
      
      if (!id) {
        alert('⚠️ Preencha o campo ID para atualizar o status parcialmente.');
        return;
      }
      
      try {
        const res = await fetch(`${API_URL}/agentes/${id}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status })
        });
        
        if (res.ok) {
          triggerButtonSuccess(btnPatch, 'PATCH: STATUS ATUALIZADO!');
          clearFields();
        } else {
          throw new Error();
        }
      } catch(err) {
        playBeep('error');
        alert(`❌ Falha no PATCH!\nO Agente com ID ${id} existe no banco de dados local?`);
      }
    });
  }

  // DELETE Request Action
  btnDelete.addEventListener('click', async () => {
    if (checkOffline()) return;
    const { id } = getInputs();
    
    if (!id) {
      alert('⚠️ Preencha o campo ID do Agente para excluí-lo.');
      return;
    }
    
    try {
      const res = await fetch(`${API_URL}/agentes/${id}`, {
        method: 'DELETE'
      });
      
      if (res.ok) {
        triggerButtonSuccess(btnDelete, 'DELETE: EXCLUÍDO!');
        clearFields();
      } else {
        throw new Error();
      }
    } catch(err) {
      playBeep('error');
      alert(`❌ Falha no DELETE!\nO Agente com ID ${id} existe no banco de dados local?`);
    }
  });

  // Set up event listeners for server connectivity status
  window.addEventListener('server-data', (e) => {
    renderAgents(e.detail);
  });

  window.addEventListener('server-offline', () => {
    resetAgentsContainer();
  });
}

export function renderAgents(agents) {
  const container = document.getElementById('live-agents-container');
  if (!container) return;
  container.innerHTML = '';
  
  if (agents.length === 0) {
    container.innerHTML = `
      <div class="agent-tag-card" style="border-color: var(--neon-yellow); width: 100%; grid-column: 1 / -1;">
        <span class="agent-name" style="color: var(--neon-yellow);">Nenhum agente cadastrado no banco de dados.</span>
      </div>
    `;
    return;
  }
  
  agents.forEach(agent => {
    const card = document.createElement('div');
    card.className = 'agent-tag-card';
    
    let statusClass = 'other';
    if (agent.status === 'Ativo') statusClass = 'active';
    else if (agent.status === 'Oculto') statusClass = 'hidden';
    else if (agent.status === 'Procurado') statusClass = 'wanted';
    
    card.innerHTML = `
      <div class="agent-info">
        <span class="agent-name">${escapeHTML(agent.nome)}</span>
        <span class="agent-id">ID: ${escapeHTML(agent.id)}</span>
      </div>
      <span class="agent-status-badge ${statusClass}">${escapeHTML(agent.status)}</span>
    `;
    
    container.appendChild(card);
  });
}

export function resetAgentsContainer() {
  const container = document.getElementById('live-agents-container');
  if (!container) return;
  container.innerHTML = `
    <div class="agent-tag-card" style="border-color: rgba(255, 56, 96, 0.15); opacity: 0.7; grid-column: 1 / -1;">
      <div class="agent-info">
        <span class="agent-name" style="color: var(--neon-red);">Aguardando Conexão do Servidor...</span>
        <span class="agent-id">Abra o terminal na pasta e execute: npx json-server db.json</span>
      </div>
      <span class="agent-status-badge other">OFFLINE</span>
    </div>
  `;
}

function escapeHTML(str) {
  if (!str) return '';
  return str.replace(/[&<>'"]/g, 
    tag => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      "'": '&#39;',
      '"': '&quot;'
    }[tag] || tag)
  );
}
