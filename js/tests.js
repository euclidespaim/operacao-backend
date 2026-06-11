import { playBeep } from './sound.js';
import { API_URL, PASSWORDS } from './config.js';

export function initEvaluationSystem() {
  const btnUnlock = document.getElementById('btn-unlock-avaliacao');
  const keyInput = document.getElementById('avaliacao-key-input');
  const gateError = document.getElementById('avaliacao-gate-error');
  const lockedView = document.getElementById('avaliacao-locked-view');
  const unlockedView = document.getElementById('avaliacao-unlocked-view');
  
  if (!btnUnlock) return;
  
  const folder = document.getElementById('folder-avaliacao');
  const folderTitle = document.getElementById('accordion-title-avaliacao');
  const folderBtnLabel = document.querySelector('#btn-avaliacao1 .mission-status-label');
  
  btnUnlock.addEventListener('click', attemptUnlock);
  if (keyInput) {
    keyInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') attemptUnlock();
    });
  }
  
  function attemptUnlock() {
    const key = keyInput.value.trim().toUpperCase();
    if (key === PASSWORDS.exam) {
      unlockEvaluation();
    } else {
      if (gateError) gateError.style.display = 'block';
      keyInput.value = '';
      keyInput.focus();
      playBeep('error');
    }
  }
  
  function unlockEvaluation() {
    if (lockedView) lockedView.style.display = 'none';
    if (unlockedView) unlockedView.style.display = 'block';
    
    if (folder) folder.classList.remove('locked');
    if (folderTitle) folderTitle.textContent = '🔓 Avaliação 01: Prova Prática';
    if (folderBtnLabel) folderBtnLabel.textContent = 'Pendente';
    
    localStorage.setItem('avaliacaoUnlocked', 'true');
    playBeep('success');
    
    window.dispatchEvent(new CustomEvent('state-changed'));
  }
  
  // Restore unlock state on load
  if (localStorage.getItem('avaliacaoUnlocked') === 'true') {
    if (lockedView) lockedView.style.display = 'none';
    if (unlockedView) unlockedView.style.display = 'block';
    if (folder) folder.classList.remove('locked');
    if (folderTitle) folderTitle.textContent = '🔓 Avaliação 01: Prova Prática';
    if (folderBtnLabel) folderBtnLabel.textContent = 'Pendente';
  }
  
  // Test suite execution
  const btnRun = document.getElementById('btn-run-tests');
  const terminal = document.getElementById('validation-terminal-output');
  
  if (btnRun) {
    btnRun.addEventListener('click', runValidationTests);
  }
  
  async function runValidationTests() {
    if (btnRun.disabled) return;
    btnRun.disabled = true;
    playBeep('click');
    
    if (terminal) {
      terminal.innerHTML = `<div class="val-log-info">&gt; Iniciando bateria de testes em ${API_URL}...</div>`;
    }
    
    const check1 = document.getElementById('check-test-1');
    const check2 = document.getElementById('check-test-2');
    const check3 = document.getElementById('check-test-3');
    const check4 = document.getElementById('check-test-4');
    
    if (check1) check1.checked = false;
    if (check2) check2.checked = false;
    if (check3) check3.checked = false;
    if (check4) check4.checked = false;
    
    if (check1) check1.dispatchEvent(new Event('change'));
    if (check2) check2.dispatchEvent(new Event('change'));
    if (check3) check3.dispatchEvent(new Event('change'));
    if (check4) check4.dispatchEvent(new Event('change'));
    
    let passedCount = 0;
    
    // Test 1: GET /agentes
    appendLog('&gt; [TESTE 1] Testando conexão e leitura (GET /agentes)...');
    try {
      const res = await fetch(`${API_URL}/agentes`);
      if (res.status === 200) {
        const data = await res.json();
        if (Array.isArray(data) && data.length >= 2) {
          const hasNeo = data.some(ag => ag.nome === 'Neo');
          const hasTrinity = data.some(ag => ag.nome === 'Trinity');
          if (hasNeo && hasTrinity) {
            appendLog('  ↳ Resposta: HTTP 200 OK. Registros "Neo" e "Trinity" encontrados!', 'success');
            if (check1) {
              check1.checked = true;
              check1.dispatchEvent(new Event('change'));
            }
            passedCount++;
            playBeep('success');
          } else {
            appendLog('  ↳ FALHA: Registros padrão "Neo" e "Trinity" não foram retornados.', 'fail');
          }
        } else {
          appendLog('  ↳ FALHA: A rota GET não retornou um array com pelo menos 2 registros.', 'fail');
        }
      } else {
        appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}. Esperava 200.`, 'fail');
      }
    } catch(err) {
      appendLog('  ↳ ERRO DE CONEXÃO: Certifique-se de que o json-server está rodando na porta 3000.', 'fail');
    }
    
    await sleep(600);
    
    // Test 2: POST /agentes
    appendLog('&gt; [TESTE 2] Enviando chamada de cadastro (POST /agentes)...');
    try {
      const res = await fetch(`${API_URL}/agentes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: "3", nome: "Morpheus", status: "Procurado" })
      });
      
      if (res.status === 201 || res.status === 200) {
        appendLog(`  ↳ Resposta: HTTP ${res.status} Created/OK. Registro inserido!`, 'success');
        if (check2) {
          check2.checked = true;
          check2.dispatchEvent(new Event('change'));
        }
        passedCount++;
        playBeep('success');
      } else {
        appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}. Esperava 201.`, 'fail');
      }
    } catch(err) {
      appendLog('  ↳ ERRO DE CONEXÃO: Falha ao alcançar a rota POST.', 'fail');
    }
    
    await sleep(600);
    
    // Test 3: PUT /agentes/2
    appendLog('&gt; [TESTE 3] Atualizando dados da Trinity (PUT /agentes/2)...');
    try {
      const res = await fetch(`${API_URL}/agentes/2`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ nome: "Trinity", status: "Ativo" })
      });
      
      if (res.status === 200) {
        appendLog('  ↳ Resposta: HTTP 200 OK. Trinity atualizada para "Ativo"!', 'success');
        if (check3) {
          check3.checked = true;
          check3.dispatchEvent(new Event('change'));
        }
        passedCount++;
        playBeep('success');
      } else {
        appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}. Esperava 200.`, 'fail');
      }
    } catch(err) {
      appendLog('  ↳ ERRO DE CONEXÃO: Falha ao enviar requisição PUT.', 'fail');
    }
    
    await sleep(600);
    
    // Test 4: DELETE /agentes/3
    appendLog('&gt; [TESTE 4] Limpando dados excluindo Morpheus (DELETE /agentes/3)...');
    try {
      const res = await fetch(`${API_URL}/agentes/3`, {
        method: 'DELETE'
      });
      
      if (res.status === 200 || res.status === 204) {
        appendLog(`  ↳ Resposta: HTTP ${res.status}. Registro de testes removido.`, 'success');
        if (check4) {
          check4.checked = true;
          check4.dispatchEvent(new Event('change'));
        }
        passedCount++;
        playBeep('success');
      } else {
        appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status} no DELETE.`, 'fail');
      }
    } catch(err) {
      appendLog('  ↳ ERRO DE CONEXÃO: Falha ao conectar ao DELETE.', 'fail');
    }
    
    await sleep(500);
    
    // Summary
    localStorage.setItem('avaliacaoGrade', `${passedCount}/4`);
    if (passedCount === 4) {
      appendLog('\n🎉 EXCELENTE! TODOS OS TESTES PASSARAM COM SUCESSO (4/4).', 'success');
      if (folderBtnLabel) folderBtnLabel.textContent = 'Concluído';
      const btnEval = document.getElementById('btn-avaliacao1');
      if (btnEval) btnEval.classList.add('completed');
      playBeep('complete');
    } else {
      appendLog(`\n❌ FALHA: ${4 - passedCount} teste(s) não passaram. Ajuste seu servidor local.`, 'fail');
      if (folderBtnLabel) folderBtnLabel.textContent = 'Pendente';
      const btnEval = document.getElementById('btn-avaliacao1');
      if (btnEval) btnEval.classList.remove('completed');
      playBeep('error');
    }
    
    window.dispatchEvent(new CustomEvent('state-changed'));
    btnRun.disabled = false;
  }
  
  function appendLog(text, type = 'info') {
    if (!terminal) return;
    const line = document.createElement('div');
    if (type === 'success') line.className = 'val-log-success';
    else if (type === 'fail') line.className = 'val-log-fail';
    else line.className = 'val-log-info';
    
    line.innerHTML = text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }
}

export function initReviewSystem() {
  const btnRun = document.getElementById('btn-run-revisao-tests');
  const terminal = document.getElementById('revisao-terminal-output');
  const folderBtnLabel = document.querySelector('#btn-revisao-simulado .mission-status-label');
  
  if (!btnRun) return;
  
  const check1 = document.getElementById('check-rev-1');
  const check2 = document.getElementById('check-rev-2');
  const check3 = document.getElementById('check-rev-3');
  const check4 = document.getElementById('check-rev-4');
  
  btnRun.addEventListener('click', async () => {
    if (btnRun.disabled) return;
    btnRun.disabled = true;
    playBeep('click');
    
    if (terminal) {
      terminal.innerHTML = `<div class="val-log-info">&gt; Iniciando simulado de CRUD em ${API_URL}...</div>`;
    }
    
    if (check1) check1.checked = false;
    if (check2) check2.checked = false;
    if (check3) check3.checked = false;
    if (check4) check4.checked = false;
    
    if (check1) check1.dispatchEvent(new Event('change'));
    if (check2) check2.dispatchEvent(new Event('change'));
    if (check3) check3.dispatchEvent(new Event('change'));
    if (check4) check4.dispatchEvent(new Event('change'));
    
    let passedCount = 0;
    
    // Test A: GET /agentes
    appendLog('&gt; [TESTE A] Testando leitura (GET /agentes)...');
    try {
      const res = await fetch(`${API_URL}/agentes`);
      if (res.status === 200) {
        const data = await res.json();
        if (Array.isArray(data) && data.length >= 2) {
          const hasNeo = data.some(ag => ag.nome === 'Neo');
          const hasTrinity = data.some(ag => ag.nome === 'Trinity');
          if (hasNeo && hasTrinity) {
            appendLog('  ↳ Resposta: HTTP 200 OK. Registros "Neo" e "Trinity" encontrados!', 'success');
            if (check1) {
              check1.checked = true;
              check1.dispatchEvent(new Event('change'));
            }
            passedCount++;
            playBeep('success');
          } else {
            appendLog('  ↳ FALHA: Registros padrão "Neo" e "Trinity" não foram retornados.', 'fail');
          }
        } else {
          appendLog('  ↳ FALHA: A rota GET não retornou um array de agentes.', 'fail');
        }
      } else {
        appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}.`, 'fail');
      }
    } catch(err) {
      appendLog('  ↳ ERRO DE CONEXÃO: Certifique-se de que o json-server está rodando na porta 3000.', 'fail');
    }
    
    await sleep(600);
    
    // Test B: POST /agentes
    appendLog('&gt; [TESTE B] Testando cadastro (POST /agentes)...');
    if (passedCount === 1) {
      try {
        const res = await fetch(`${API_URL}/agentes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: "9", nome: "Cypher", status: "Ativo" })
        });
        
        if (res.status === 201 || res.status === 200) {
          appendLog(`  ↳ Resposta: HTTP ${res.status} OK/Created. Registro cadastrado!`, 'success');
          if (check2) {
            check2.checked = true;
            check2.dispatchEvent(new Event('change'));
          }
          passedCount++;
          playBeep('success');
        } else {
          appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}.`, 'fail');
        }
      } catch(err) {
        appendLog('  ↳ ERRO DE CONEXÃO: Falha ao alcançar a rota POST.', 'fail');
      }
    } else {
      appendLog('  ↳ PULADO: Teste A falhou.', 'fail');
    }
    
    await sleep(600);
    
    // Test C: PUT /agentes/9
    appendLog('&gt; [TESTE C] Testando edição (PUT /agentes/9)...');
    if (passedCount === 2) {
      try {
        const res = await fetch(`${API_URL}/agentes/9`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ nome: "Cypher", status: "Procurado" })
        });
        
        if (res.status === 200) {
          appendLog('  ↳ Resposta: HTTP 200 OK. Registro atualizado para "Procurado"!', 'success');
          if (check3) {
            check3.checked = true;
            check3.dispatchEvent(new Event('change'));
          }
          passedCount++;
          playBeep('success');
        } else {
          appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}.`, 'fail');
        }
      } catch(err) {
        appendLog('  ↳ ERRO DE CONEXÃO: Falha ao enviar requisição PUT.', 'fail');
      }
    } else {
      appendLog('  ↳ PULADO: Teste B falhou.', 'fail');
    }
    
    await sleep(600);
    
    // Test D: DELETE /agentes/9
    appendLog('&gt; [TESTE D] Testando remoção (DELETE /agentes/9)...');
    if (passedCount === 3) {
      try {
        const res = await fetch(`${API_URL}/agentes/9`, {
          method: 'DELETE'
        });
        
        if (res.status === 200 || res.status === 204) {
          appendLog(`  ↳ Resposta: HTTP ${res.status}. Registro temporário deletado.`, 'success');
          if (check4) {
            check4.checked = true;
            check4.dispatchEvent(new Event('change'));
          }
          passedCount++;
          playBeep('success');
        } else {
          appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}.`, 'fail');
        }
      } catch(err) {
        appendLog('  ↳ ERRO DE CONEXÃO: Falha ao enviar requisição DELETE.', 'fail');
      }
    } else {
      appendLog('  ↳ PULADO: Teste C falhou.', 'fail');
    }
    
    await sleep(500);
    
    if (passedCount === 4) {
      appendLog('\n🎉 SUCESSO! Simulado de CRUD homologado com sucesso.', 'success');
      if (folderBtnLabel) folderBtnLabel.textContent = 'Concluído';
      const btnRev = document.getElementById('btn-revisao-simulado');
      if (btnRev) btnRev.classList.add('completed');
      playBeep('complete');
    } else {
      appendLog('\n❌ FALHA: Alguns testes do simulado falharam. Depure seu json-server.', 'fail');
      if (folderBtnLabel) folderBtnLabel.textContent = 'Pendente';
      const btnRev = document.getElementById('btn-revisao-simulado');
      if (btnRev) btnRev.classList.remove('completed');
      playBeep('error');
    }
    
    window.dispatchEvent(new CustomEvent('state-changed'));
    btnRun.disabled = false;
  });
  
  function appendLog(text, type = 'info') {
    if (!terminal) return;
    const line = document.createElement('div');
    if (type === 'success') line.className = 'val-log-success';
    else if (type === 'fail') line.className = 'val-log-fail';
    else line.className = 'val-log-info';
    
    line.innerHTML = text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }
}

export function initReview2System() {
  const btnRun = document.getElementById('btn-run-revisao2-tests');
  const terminal = document.getElementById('revisao2-terminal-output');
  const folderBtnLabel = document.querySelector('#btn-revisao-simulado2 .mission-status-label');
  
  if (!btnRun) return;
  
  const check1 = document.getElementById('check-rev2-1');
  const check2 = document.getElementById('check-rev2-2');
  const check3 = document.getElementById('check-rev2-3');
  const check4 = document.getElementById('check-rev2-4');
  
  btnRun.addEventListener('click', async () => {
    if (btnRun.disabled) return;
    btnRun.disabled = true;
    playBeep('click');
    
    if (terminal) {
      terminal.innerHTML = `<div class="val-log-info">&gt; Iniciando simulado 2 de PATCH em ${API_URL}...</div>`;
    }
    
    if (check1) check1.checked = false;
    if (check2) check2.checked = false;
    if (check3) check3.checked = false;
    if (check4) check4.checked = false;
    
    if (check1) check1.dispatchEvent(new Event('change'));
    if (check2) check2.dispatchEvent(new Event('change'));
    if (check3) check3.dispatchEvent(new Event('change'));
    if (check4) check4.dispatchEvent(new Event('change'));
    
    let passedCount = 0;
    
    // Test A: GET /agentes
    appendLog('&gt; [TESTE A] Testando leitura inicial (GET /agentes)...');
    try {
      const res = await fetch(`${API_URL}/agentes`);
      if (res.status === 200) {
        const data = await res.json();
        if (Array.isArray(data) && data.length >= 2) {
          const hasTrinity = data.some(ag => ag.id === "2" || ag.id === 2);
          if (hasTrinity) {
            appendLog('  ↳ Resposta: HTTP 200 OK. Trinity encontrada para teste de PATCH!', 'success');
            if (check1) {
              check1.checked = true;
              check1.dispatchEvent(new Event('change'));
            }
            passedCount++;
            playBeep('success');
          } else {
            appendLog('  ↳ FALHA: Agente Trinity (ID 2) não encontrado no banco local.', 'fail');
          }
        } else {
          appendLog('  ↳ FALHA: A rota GET não retornou um array de agentes válido.', 'fail');
        }
      } else {
        appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}.`, 'fail');
      }
    } catch(err) {
      appendLog('  ↳ ERRO DE CONEXÃO: Certifique-se de que o json-server está rodando.', 'fail');
    }
    
    await sleep(600);
    
    // Test B: PATCH /agentes/2 (partial status change to Oculto)
    appendLog('&gt; [TESTE B] Testando atualização parcial (PATCH /agentes/2)...');
    if (passedCount === 1) {
      try {
        const res = await fetch(`${API_URL}/agentes/2`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ status: "Oculto" })
        });
        
        if (res.status === 200) {
          const updated = await res.json();
          if (updated.status === 'Oculto' && updated.nome === 'Trinity') {
            appendLog('  ↳ Resposta: HTTP 200 OK. Status alterado preservando o nome original!', 'success');
            if (check2) {
              check2.checked = true;
              check2.dispatchEvent(new Event('change'));
            }
            passedCount++;
            playBeep('success');
          } else {
            appendLog('  ↳ FALHA: A modificação parcial corrompeu outros atributos ou falhou.', 'fail');
          }
        } else {
          appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}.`, 'fail');
        }
      } catch(err) {
        appendLog('  ↳ ERRO DE CONEXÃO: Falha ao enviar chamada PATCH.', 'fail');
      }
    } else {
      appendLog('  ↳ PULADO: Teste A falhou.', 'fail');
    }
    
    await sleep(600);
    
    // Test C: POST /agentes (Create Niobe ID 10)
    appendLog('&gt; [TESTE C] Testando cadastro complementar (POST /agentes)...');
    if (passedCount === 2) {
      try {
        const res = await fetch(`${API_URL}/agentes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id: "10", nome: "Niobe", status: "Ativo" })
        });
        
        if (res.status === 201 || res.status === 200) {
          appendLog(`  ↳ Resposta: HTTP ${res.status}. Niobe cadastrada com sucesso!`, 'success');
          if (check3) {
            check3.checked = true;
            check3.dispatchEvent(new Event('change'));
          }
          passedCount++;
          playBeep('success');
        } else {
          appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}.`, 'fail');
        }
      } catch(err) {
        appendLog('  ↳ ERRO DE CONEXÃO: Falha ao alcançar POST no teste C.', 'fail');
      }
    } else {
      appendLog('  ↳ PULADO: Teste B falhou.', 'fail');
    }
    
    await sleep(600);
    
    // Test D: DELETE /agentes/10 (Clean Niobe)
    appendLog('&gt; [TESTE D] Testando remoção complementar (DELETE /agentes/10)...');
    if (passedCount === 3) {
      try {
        const res = await fetch(`${API_URL}/agentes/10`, {
          method: 'DELETE'
        });
        
        if (res.status === 200 || res.status === 204) {
          appendLog(`  ↳ Resposta: HTTP ${res.status}. Registro Niobe removido.`, 'success');
          if (check4) {
            check4.checked = true;
            check4.dispatchEvent(new Event('change'));
          }
          passedCount++;
          playBeep('success');
        } else {
          appendLog(`  ↳ FALHA: Servidor respondeu com HTTP ${res.status}.`, 'fail');
        }
      } catch(err) {
        appendLog('  ↳ ERRO DE CONEXÃO: Falha ao enviar requisição DELETE.', 'fail');
      }
    } else {
      appendLog('  ↳ PULADO: Teste C falhou.', 'fail');
    }
    
    await sleep(500);
    
    if (passedCount === 4) {
      appendLog('\n🎉 SUCESSO! Simulado 2 de PATCH homologado com sucesso.', 'success');
      if (folderBtnLabel) folderBtnLabel.textContent = 'Concluído';
      const btnRev2 = document.getElementById('btn-revisao-simulado2');
      if (btnRev2) btnRev2.classList.add('completed');
      playBeep('complete');
    } else {
      appendLog('\n❌ FALHA: Alguns testes do simulado 2 falharam. Depure seu json-server.', 'fail');
      if (folderBtnLabel) folderBtnLabel.textContent = 'Pendente';
      const btnRev2 = document.getElementById('btn-revisao-simulado2');
      if (btnRev2) btnRev2.classList.remove('completed');
      playBeep('error');
    }
    
    window.dispatchEvent(new CustomEvent('state-changed'));
    btnRun.disabled = false;
  });
  
  function appendLog(text, type = 'info') {
    if (!terminal) return;
    const line = document.createElement('div');
    if (type === 'success') line.className = 'val-log-success';
    else if (type === 'fail') line.className = 'val-log-fail';
    else line.className = 'val-log-info';
    
    line.innerHTML = text;
    terminal.appendChild(line);
    terminal.scrollTop = terminal.scrollHeight;
  }
}

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
