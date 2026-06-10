// System State & Variables
let audioEnabled = true;
let audioCtx = null;
let localServerOnline = false;
let checkInterval = null;

// Initialize Elements
document.addEventListener('DOMContentLoaded', () => {
  initSoundSystem();
  initNavigation();
  initProgressTracker(); // Must run after navigation to set checkboxes states
  initTerminalSimulator();
  initMetaphorSimulator();
  initClipboardCopier();
  initLocalServerChecker();
  initSandboxCrud();
  
  // Audio activation helper on first user click
  document.addEventListener('click', initAudioContext, { once: true });
});

// Lazy-load AudioContext (Browser policies require user interaction)
function initAudioContext() {
  if (!audioCtx) {
    audioCtx = new (window.AudioContext || window.webkitAudioContext)();
  }
}

// -------------------------------------------------------------
// SOUND SYSTEM (Web Audio API Synthesizer)
// -------------------------------------------------------------
function initSoundSystem() {
  const audioToggle = document.getElementById('audio-toggle');
  
  audioToggle.addEventListener('click', () => {
    audioEnabled = !audioEnabled;
    audioToggle.classList.toggle('muted', !audioEnabled);
    
    // Update SVG icon based on state
    if (audioEnabled) {
      audioToggle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07"></path>
        </svg>
      `;
      playBeep('success');
    } else {
      audioToggle.innerHTML = `
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"></polygon>
          <line x1="23" y1="9" x2="17" y2="15"></line>
          <line x1="17" y1="9" x2="23" y2="15"></line>
        </svg>
      `;
    }
  });
}

function playBeep(type) {
  if (!audioEnabled) return;
  
  // Ensure context is running
  initAudioContext();
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  
  if (!audioCtx) return;
  
  const osc = audioCtx.createOscillator();
  const gain = audioCtx.createGain();
  
  osc.connect(gain);
  gain.connect(audioCtx.destination);
  
  const now = audioCtx.currentTime;
  
  switch(type) {
    case 'click':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(900, now);
      gain.gain.setValueAtTime(0.04, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
      osc.start(now);
      osc.stop(now + 0.05);
      break;
      
    case 'tab':
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(440, now);
      osc.frequency.exponentialRampToValueAtTime(660, now + 0.08);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
      osc.start(now);
      osc.stop(now + 0.08);
      break;
      
    case 'success':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(523.25, now); // C5
      osc.frequency.setValueAtTime(783.99, now + 0.07); // G5
      gain.gain.setValueAtTime(0.05, now);
      gain.gain.setValueAtTime(0.05, now + 0.07);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
      osc.start(now);
      osc.stop(now + 0.2);
      break;
      
    case 'complete':
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      notes.forEach((freq, i) => {
        const toneOsc = audioCtx.createOscillator();
        const toneGain = audioCtx.createGain();
        toneOsc.connect(toneGain);
        toneGain.connect(audioCtx.destination);
        
        toneOsc.type = 'sine';
        toneOsc.frequency.setValueAtTime(freq, now + i * 0.08);
        toneGain.gain.setValueAtTime(0.04, now + i * 0.08);
        toneGain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.08 + 0.15);
        toneOsc.start(now + i * 0.08);
        toneOsc.stop(now + i * 0.08 + 0.15);
      });
      break;
      
    case 'packet':
      osc.type = 'sine';
      osc.frequency.setValueAtTime(800, now);
      osc.frequency.exponentialRampToValueAtTime(200, now + 0.25);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.25);
      osc.start(now);
      osc.stop(now + 0.25);
      break;
      
    case 'error':
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, now);
      gain.gain.setValueAtTime(0.06, now);
      gain.gain.exponentialRampToValueAtTime(0.001, now + 0.18);
      osc.start(now);
      osc.stop(now + 0.18);
      break;
  }
}

// -------------------------------------------------------------
// NAVIGATION PANEL WITH LOCAL STORAGE STATE PERSISTENCE
// -------------------------------------------------------------
function initNavigation() {
  const buttons = document.querySelectorAll('.mission-btn');
  const sections = document.querySelectorAll('.content-section');
  
  // Load saved tab from localStorage or default to sec1
  const savedTab = localStorage.getItem('activeTab') || 'sec1';
  
  function activateTab(sectionId) {
    buttons.forEach(b => {
      b.classList.remove('active');
      if (b.getAttribute('data-section') === sectionId) {
        b.classList.add('active');
      }
    });
    
    sections.forEach(sec => {
      sec.classList.remove('active');
      if (sec.id === sectionId) {
        sec.classList.add('active');
      }
    });
    
    // Save state to localStorage
    localStorage.setItem('activeTab', sectionId);
    
    // Update labels inside the buttons
    buttons.forEach(b => {
      const label = b.querySelector('.mission-status-label');
      if (b.classList.contains('completed')) {
        label.textContent = 'Concluído';
      } else if (b.classList.contains('active')) {
        label.textContent = 'Em andamento';
      } else {
        label.textContent = 'Pendente';
      }
    });
  }
  
  buttons.forEach(btn => {
    btn.addEventListener('click', () => {
      const sectionId = btn.getAttribute('data-section');
      activateTab(sectionId);
      playBeep('tab');
    });
  });
  
  // Restore initial active tab on page load
  activateTab(savedTab);
}

// -------------------------------------------------------------
// MASTER PROGRESS TRACKER WITH CHECKBOX LOCAL STORAGE CACHING
// -------------------------------------------------------------
function initProgressTracker() {
  const checkboxes = document.querySelectorAll('.checklist-checkbox');
  const progressBar = document.getElementById('mission-progress-bar');
  const progressPercentText = document.getElementById('mission-progress-percent');
  
  // Load checked states from localStorage
  checkboxes.forEach((cb, index) => {
    const isChecked = localStorage.getItem(`checkbox_${index}`) === 'true';
    cb.checked = isChecked;
  });
  
  function updateProgress() {
    const total = checkboxes.length;
    const checked = Array.from(checkboxes).filter(cb => cb.checked).length;
    const percentage = Math.round((checked / total) * 100) || 0;
    
    // Update top progress HUD
    progressBar.style.width = `${percentage}%`;
    progressPercentText.textContent = `${percentage}% CONCLUÍDO`;
    
    // Update individual section buttons status
    const sections = ['sec1', 'sec2', 'sec3', 'sec4', 'sec5'];
    
    sections.forEach(secId => {
      const secCheckboxes = document.querySelectorAll(`.checklist-checkbox[data-section="${secId}"]`);
      const secChecked = Array.from(secCheckboxes).filter(cb => cb.checked).length;
      const secTotal = secCheckboxes.length;
      const btn = document.getElementById(`btn-${secId}`);
      const statusLabel = btn.querySelector('.mission-status-label');
      
      if (secChecked === secTotal && secTotal > 0) {
        btn.classList.add('completed');
        statusLabel.textContent = 'Concluído';
      } else {
        btn.classList.remove('completed');
        if (btn.classList.contains('active')) {
          statusLabel.textContent = 'Em andamento';
        } else {
          statusLabel.textContent = 'Pendente';
        }
      }
    });
  }
  
  checkboxes.forEach((cb, index) => {
    cb.addEventListener('change', () => {
      // Save state on modification
      localStorage.setItem(`checkbox_${index}`, cb.checked.toString());
      updateProgress();
      
      if (cb.checked) {
        // Trigger completion check sound
        const allChecked = Array.from(checkboxes).filter(c => c.checked).length;
        if (allChecked === checkboxes.length) {
          playBeep('complete');
        } else {
          playBeep('success');
        }
      } else {
        playBeep('click');
      }
    });
  });
  
  // Run initial call to configure styles
  updateProgress();
}

// -------------------------------------------------------------
// TERMINAL SIMULATOR (Sanity Check in Module 2)
// -------------------------------------------------------------
function initTerminalSimulator() {
  const btnNode = document.getElementById('btn-sim-node');
  const btnNpm = document.getElementById('btn-sim-npm');
  const btnClear = document.getElementById('btn-sim-clear');
  const outputArea = document.getElementById('sanity-terminal-output');
  
  let typingInProgress = false;
  
  const commands = {
    'node -v': 'v20.11.0',
    'npm -v': '10.2.4'
  };
  
  function printCommand(commandText, outputText) {
    if (typingInProgress) return;
    typingInProgress = true;
    
    playBeep('click');
    
    // Append prompt line
    const commandLine = document.createElement('div');
    commandLine.className = 'sim-line';
    commandLine.innerHTML = `
      <span class="sim-prompt">$</span>
      <span class="sim-input"></span>
    `;
    outputArea.appendChild(commandLine);
    
    const inputSpan = commandLine.querySelector('.sim-input');
    let index = 0;
    
    // Type writer effect for command text
    const typingTimer = setInterval(() => {
      if (index < commandText.length) {
        inputSpan.textContent += commandText.charAt(index);
        index++;
        playBeep('click');
      } else {
        clearInterval(typingTimer);
        
        // Print output line after typing is done
        setTimeout(() => {
          const outputLine = document.createElement('div');
          outputLine.className = 'sim-output';
          outputLine.textContent = outputText;
          outputArea.appendChild(outputLine);
          
          // Print next prompt line
          const readyLine = document.createElement('div');
          readyLine.className = 'sim-line';
          readyLine.innerHTML = `<span class="sim-prompt">$</span>`;
          outputArea.appendChild(readyLine);
          
          // Auto scroll terminal to bottom
          outputArea.scrollTop = outputArea.scrollHeight;
          
          playBeep('success');
          typingInProgress = false;
        }, 150);
      }
    }, 60);
  }
  
  btnNode.addEventListener('click', () => {
    printCommand('node -v', commands['node -v']);
  });
  
  btnNpm.addEventListener('click', () => {
    printCommand('npm -v', commands['npm -v']);
  });
  
  btnClear.addEventListener('click', () => {
    if (typingInProgress) return;
    playBeep('click');
    outputArea.innerHTML = `
      <div class="sim-line">
        <span class="sim-prompt">$</span>
        <span class="sim-input"></span>
      </div>
    `;
  });
}

// -------------------------------------------------------------
// INTERACTIVE METAPHOR (Flow Diagram)
// -------------------------------------------------------------
function initMetaphorSimulator() {
  const nodes = {
    salon: document.getElementById('node-salon'),
    waiter: document.getElementById('node-waiter'),
    kitchen: document.getElementById('node-kitchen')
  };
  const descBox = document.getElementById('metaphor-desc');
  const packet1 = document.getElementById('packet-1');
  const packet2 = document.getElementById('packet-2');
  
  const descriptions = {
    frontend: "O CLIENTE (Frontend): Abre a página web e envia um pacote HTTP (Request) contendo dados estruturados em formato JSON ao clicar em algum botão de envio.",
    api: "A REQUISIÇÃO (Mensagem HTTP): Traciona os dados (Cabeçalhos e Payload) de forma assíncrona usando a Fetch API através de rotas/endpoints liberados pelo CORS.",
    backend: "O SERVIDOR (Backend): Processa a mensagem de rede recebida na porta 3000, valida a ação e salva as alterações em tempo real no arquivo de banco de dados JSON."
  };
  
  function clearHighlights() {
    Object.values(nodes).forEach(n => n.classList.remove('highlighted'));
    packet1.style.animation = 'none';
    packet2.style.animation = 'none';
  }
  
  nodes.salon.addEventListener('click', () => {
    clearHighlights();
    nodes.salon.classList.add('highlighted');
    descBox.textContent = descriptions.frontend;
    playBeep('packet');
    
    // Animate packet Salon -> Waiter (Forward)
    packet1.style.animation = 'flowForward 0.6s linear forwards';
    
    setTimeout(() => {
      nodes.waiter.classList.add('highlighted');
      playBeep('click');
    }, 600);
  });
  
  nodes.waiter.addEventListener('click', () => {
    clearHighlights();
    nodes.waiter.classList.add('highlighted');
    descBox.textContent = descriptions.api;
    playBeep('packet');
    
    // Animate packet Salon -> Waiter -> Kitchen and back
    packet1.style.animation = 'flowForward 0.4s linear forwards';
    setTimeout(() => {
      packet2.style.animation = 'flowForward 0.4s linear forwards';
      nodes.kitchen.classList.add('highlighted');
      playBeep('click');
      
      // Response cycle back
      setTimeout(() => {
        packet2.style.animation = 'flowBackward 0.4s linear forwards';
        playBeep('packet');
        setTimeout(() => {
          packet1.style.animation = 'flowBackward 0.4s linear forwards';
          nodes.salon.classList.add('highlighted');
          playBeep('success');
        }, 400);
      }, 600);
    }, 400);
  });
  
  nodes.kitchen.addEventListener('click', () => {
    clearHighlights();
    nodes.kitchen.classList.add('highlighted');
    descBox.textContent = descriptions.backend;
    playBeep('packet');
    
    // Animate response Kitchen -> Waiter
    packet2.style.animation = 'flowBackward 0.6s linear forwards';
    
    setTimeout(() => {
      nodes.waiter.classList.add('highlighted');
      playBeep('click');
    }, 600);
  });
}

// -------------------------------------------------------------
// CLIPBOARD COPIER
// -------------------------------------------------------------
function initClipboardCopier() {
  const copyButtons = document.querySelectorAll('.btn-copy');
  
  copyButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const codeId = btn.getAttribute('data-clipboard');
      const codeElement = document.getElementById(codeId);
      
      if (codeElement) {
        navigator.clipboard.writeText(codeElement.innerText).then(() => {
          playBeep('success');
          
          // Visual Feedback inside button
          const originalText = btn.querySelector('span').textContent;
          btn.querySelector('span').textContent = 'Copiado!';
          btn.style.color = 'var(--neon-green)';
          
          setTimeout(() => {
            btn.querySelector('span').textContent = originalText;
            btn.style.color = '';
          }, 1500);
        }).catch(err => {
          console.error("Erro ao copiar: ", err);
          playBeep('error');
        });
      }
    });
  });
}

// -------------------------------------------------------------
// LIVE SERVER HEALTH CHECKER (Port 3000)
// -------------------------------------------------------------
function initLocalServerChecker() {
  const indicator = document.getElementById('status-indicator');
  const statusText = document.getElementById('status-text');
  const badge = document.getElementById('live-status-badge');
  const footerVal = document.getElementById('footer-connection-val');
  
  async function pingServer() {
    indicator.className = 'status-dot checking';
    
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 2000);
      
      const response = await fetch('http://localhost:3000/agentes', {
        signal: controller.signal
      });
      
      clearTimeout(timeoutId);
      
      if (response.ok) {
        const data = await response.json();
        
        if (!localServerOnline) {
          playBeep('success');
        }
        localServerOnline = true;
        
        // Update HUD UI
        indicator.className = 'status-dot online';
        statusText.textContent = 'API LOCAL ONLINE (PORTA 3000)';
        
        // Update Section 3 Live Panel
        badge.textContent = 'CONECTADO';
        badge.className = 'live-panel-status connected';
        
        // Update Sidebar Footer
        footerVal.textContent = 'ONLINE';
        footerVal.style.color = 'var(--neon-green)';
        
        renderAgents(data);
      } else {
        throw new Error("Bad response");
      }
    } catch(err) {
      if (localServerOnline) {
        playBeep('error');
      }
      localServerOnline = false;
      
      // Update HUD UI
      indicator.className = 'status-dot';
      statusText.textContent = 'API LOCAL OFFLINE';
      
      // Update Section 3 Live Panel
      badge.textContent = 'DESCONECTADO';
      badge.className = 'live-panel-status';
      
      // Update Sidebar Footer
      footerVal.textContent = 'OFFLINE';
      footerVal.style.color = '';
      
      resetAgentsContainer();
    }
  }
  
  pingServer();
  checkInterval = setInterval(pingServer, 5000);
}

function renderAgents(agents) {
  const container = document.getElementById('live-agents-container');
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

function resetAgentsContainer() {
  const container = document.getElementById('live-agents-container');
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

// -------------------------------------------------------------
// SANDBOX FORM CONTROLLER (POST, PUT, DELETE Client Operations)
// -------------------------------------------------------------
function initSandboxCrud() {
  const form = document.getElementById('sandbox-post-form');
  const btnPost = document.getElementById('btn-submit-post');
  const btnPut = document.getElementById('btn-submit-put');
  const btnDelete = document.getElementById('btn-submit-delete');
  
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
    if (!localServerOnline) {
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
  
  // POST Request Action
  btnPost.addEventListener('click', async () => {
    if (checkOffline()) return;
    const { id, nome, status } = getInputs();
    
    if (!id || !nome) {
      alert('⚠️ Preencha os campos ID e Nome para efetuar a inclusão.');
      return;
    }
    
    try {
      const res = await fetch('http://localhost:3000/agentes', {
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
      const res = await fetch(`http://localhost:3000/agentes/${id}`, {
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

  // DELETE Request Action
  btnDelete.addEventListener('click', async () => {
    if (checkOffline()) return;
    const { id } = getInputs();
    
    if (!id) {
      alert('⚠️ Preencha o campo ID do Agente para excluí-lo.');
      return;
    }
    
    try {
      const res = await fetch(`http://localhost:3000/agentes/${id}`, {
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
}
