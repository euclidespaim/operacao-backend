import { playBeep } from './sound.js';
import { TEACHER_DATA, PASSWORDS } from './config.js';

let teacherActive = false;

export function initTeacherMode() {
  const logo = document.querySelector('.logo-icon');
  const modal = document.getElementById('teacher-modal');
  const passwordInput = document.getElementById('teacher-password-input');
  const authError = document.getElementById('teacher-auth-error');
  const btnSubmit = document.getElementById('btn-teacher-auth-submit');
  const btnCancel = document.getElementById('btn-teacher-auth-cancel');
  
  const panel = document.getElementById('teacher-panel');
  const btnMinimize = document.getElementById('btn-teacher-minimize');
  const btnLogout = document.getElementById('btn-teacher-logout');
  
  // Listen for Ctrl+Alt+P keybind
  document.addEventListener('keydown', (e) => {
    if (e.ctrlKey && e.altKey && e.key.toLowerCase() === 'p') {
      e.preventDefault();
      showLoginModal();
    }
  });
  
  // Listen for logo double click
  if (logo) {
    logo.addEventListener('dblclick', showLoginModal);
  }
  
  function showLoginModal() {
    if (!modal || !passwordInput) return;
    modal.style.display = 'flex';
    passwordInput.value = '';
    passwordInput.focus();
    if (authError) authError.style.display = 'none';
    playBeep('click');
  }
  
  function hideLoginModal() {
    if (modal) modal.style.display = 'none';
    playBeep('click');
  }
  
  if (btnCancel) {
    btnCancel.addEventListener('click', hideLoginModal);
  }
  
  if (btnSubmit) {
    btnSubmit.addEventListener('click', authenticate);
  }
  
  if (passwordInput) {
    passwordInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        authenticate();
      }
    });
  }
  
  function authenticate() {
    if (passwordInput.value === PASSWORDS.teacher) {
      if (modal) modal.style.display = 'none';
      activateTeacherMode();
    } else {
      if (authError) authError.style.display = 'block';
      passwordInput.value = '';
      passwordInput.focus();
      playBeep('error');
    }
  }
  
  function activateTeacherMode() {
    teacherActive = true;
    if (panel) panel.style.display = 'flex';
    localStorage.setItem('teacherModeActive', 'true');
    playBeep('complete');
    updateTeacherPanel();
  }
  
  function deactivateTeacherMode() {
    teacherActive = false;
    if (panel) panel.style.display = 'none';
    localStorage.removeItem('teacherModeActive');
    playBeep('click');
  }
  
  if (btnLogout) {
    btnLogout.addEventListener('click', deactivateTeacherMode);
  }
  
  if (btnMinimize) {
    btnMinimize.addEventListener('click', () => {
      if (panel) panel.classList.toggle('minimized');
      playBeep('click');
    });
  }
  
  // Tab control inside floating panel
  const tabs = document.querySelectorAll('.teacher-tab-btn');
  tabs.forEach(t => {
    t.addEventListener('click', () => {
      tabs.forEach(btn => btn.classList.remove('active'));
      t.classList.add('active');
      
      const tabId = t.getAttribute('data-tab');
      document.querySelectorAll('.teacher-tab-content').forEach(c => c.classList.remove('active'));
      const targetContent = document.getElementById(tabId);
      if (targetContent) targetContent.classList.add('active');
      playBeep('tab');
    });
  });
  
  // Window Draggability
  if (panel) {
    makeElementDraggable(panel, document.getElementById('teacher-panel-drag'));
  }
  
  // Export progress reports
  const btnExport = document.getElementById('btn-teacher-export-report');
  if (btnExport) {
    btnExport.addEventListener('click', exportStudentReport);
  }
  
  // Restore state on load
  if (localStorage.getItem('teacherModeActive') === 'true') {
    activateTeacherMode();
  }

  // Hook state-changed events to auto-update teacher panel
  window.addEventListener('state-changed', updateTeacherPanel);
}

function makeElementDraggable(elmnt, dragAnchor) {
  let pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
  if (dragAnchor) {
    dragAnchor.onmousedown = dragMouseDown;
  } else {
    elmnt.onmousedown = dragMouseDown;
  }

  function dragMouseDown(e) {
    e = e || window.event;
    if (e.target.closest('.panel-controls')) return;
    
    e.preventDefault();
    pos3 = e.clientX;
    pos4 = e.clientY;
    document.onmouseup = closeDragElement;
    document.onmousemove = elementDrag;
  }

  function elementDrag(e) {
    e = e || window.event;
    e.preventDefault();
    pos1 = pos3 - e.clientX;
    pos2 = pos4 - e.clientY;
    pos3 = e.clientX;
    pos4 = e.clientY;
    
    let topVal = elmnt.offsetTop - pos2;
    let leftVal = elmnt.offsetLeft - pos1;
    
    if (topVal < 0) topVal = 0;
    if (leftVal < 0) leftVal = 0;
    if (topVal > window.innerHeight - 45) topVal = window.innerHeight - 45;
    if (leftVal > window.innerWidth - elmnt.offsetWidth) leftVal = window.innerWidth - elmnt.offsetWidth;
    
    elmnt.style.top = topVal + "px";
    elmnt.style.left = leftVal + "px";
    elmnt.style.bottom = "auto";
    elmnt.style.right = "auto";
  }

  function closeDragElement() {
    document.onmouseup = null;
    document.onmousemove = null;
  }
}

export function updateTeacherPanel() {
  if (!teacherActive) return;
  
  const currentSection = localStorage.getItem('activeTab') || 'aula1-mod1';
  const data = TEACHER_DATA[currentSection] || TEACHER_DATA['aula1-mod1'];
  
  const guidelinesBox = document.getElementById('teacher-guidelines-box');
  const solutionsBox = document.getElementById('teacher-solution-code');
  const solutionTitle = document.getElementById('solution-title');
  
  if (guidelinesBox) {
    guidelinesBox.innerHTML = `
      <h4 style="font-family: var(--font-mono); color: var(--neon-cyan); margin-bottom: 12px; font-size: 0.9rem;">${data.title}</h4>
      ${data.guideline}
    `;
  }
  
  if (solutionsBox) {
    solutionsBox.textContent = data.solution;
  }
  
  if (solutionTitle) {
    solutionTitle.textContent = `Gabarito: ${currentSection}`;
  }
  
  // Update reports tab details
  const reportName = document.getElementById('teacher-report-name');
  const reportProgress = document.getElementById('teacher-report-progress');
  const reportSimulado = document.getElementById('teacher-report-simulado');
  const reportExam = document.getElementById('teacher-report-exam');
  
  const studentNameVal = localStorage.getItem('studentName') || 'NÃO PREENCHIDO';
  if (reportName) {
    reportName.textContent = studentNameVal.toUpperCase();
  }
  
  const totalCheckboxes = document.querySelectorAll('.checklist-checkbox').length;
  const checkedCheckboxes = Array.from(document.querySelectorAll('.checklist-checkbox')).filter(cb => cb.checked).length;
  const percent = Math.round((checkedCheckboxes / totalCheckboxes) * 100) || 0;
  
  if (reportProgress) {
    reportProgress.textContent = `${percent}% (${checkedCheckboxes}/${totalCheckboxes})`;
  }
  
  const checkRev1 = document.getElementById('check-rev-1');
  const checkRev2 = document.getElementById('check-rev-2');
  const checkRev3 = document.getElementById('check-rev-3');
  const checkRev4 = document.getElementById('check-rev-4');
  const simuladoCompleted = checkRev1 && checkRev2 && checkRev3 && checkRev4 &&
                            checkRev1.checked && checkRev2.checked && checkRev3.checked && checkRev4.checked;
  
  if (reportSimulado) {
    if (simuladoCompleted) {
      reportSimulado.textContent = 'Concluído';
      reportSimulado.style.color = 'var(--neon-green)';
    } else {
      reportSimulado.textContent = 'Pendente';
      reportSimulado.style.color = 'var(--neon-red)';
    }
  }

  const checkRev2_1 = document.getElementById('check-rev2-1');
  const checkRev2_2 = document.getElementById('check-rev2-2');
  const checkRev2_3 = document.getElementById('check-rev2-3');
  const checkRev2_4 = document.getElementById('check-rev2-4');
  const simulado2Completed = checkRev2_1 && checkRev2_2 && checkRev2_3 && checkRev2_4 &&
                             checkRev2_1.checked && checkRev2_2.checked && checkRev2_3.checked && checkRev2_4.checked;
  
  const reportSimulado2 = document.getElementById('teacher-report-simulado2');
  if (reportSimulado2) {
    if (simulado2Completed) {
      reportSimulado2.textContent = 'Concluído';
      reportSimulado2.style.color = 'var(--neon-green)';
    } else {
      reportSimulado2.textContent = 'Pendente';
      reportSimulado2.style.color = 'var(--neon-red)';
    }
  }
  
  const examUnlocked = localStorage.getItem('avaliacaoUnlocked') === 'true';
  const examGrade = localStorage.getItem('avaliacaoGrade') || 'Pendente';
  
  if (reportExam) {
    if (examUnlocked) {
      if (examGrade === '4/4') {
        reportExam.textContent = 'Aprovado (4/4)';
        reportExam.style.color = 'var(--neon-green)';
      } else if (examGrade !== 'Pendente') {
        reportExam.textContent = `Falhou (${examGrade})`;
        reportExam.style.color = 'var(--neon-yellow)';
      } else {
        reportExam.textContent = 'Iniciada/Desbloqueada';
        reportExam.style.color = 'var(--neon-cyan)';
      }
    } else {
      reportExam.textContent = 'Bloqueada';
      reportExam.style.color = 'var(--neon-red)';
    }
  }
}

export function exportStudentReport() {
  const totalCheckboxes = document.querySelectorAll('.checklist-checkbox').length;
  const checkedCheckboxes = Array.from(document.querySelectorAll('.checklist-checkbox')).filter(cb => cb.checked).length;
  const percent = Math.round((checkedCheckboxes / totalCheckboxes) * 100) || 0;
  
  const examUnlocked = localStorage.getItem('avaliacaoUnlocked') === 'true';
  const examGrade = localStorage.getItem('avaliacaoGrade') || 'Pendente';
  const studentNameVal = localStorage.getItem('studentName') || 'NÃO PREENCHIDO';
  
  const checkRev1 = document.getElementById('check-rev-1');
  const checkRev2 = document.getElementById('check-rev-2');
  const checkRev3 = document.getElementById('check-rev-3');
  const checkRev4 = document.getElementById('check-rev-4');
  const simuladoCompleted = checkRev1 && checkRev2 && checkRev3 && checkRev4 &&
                            checkRev1.checked && checkRev2.checked && checkRev3.checked && checkRev4.checked;
  
  const checkRev2_1 = document.getElementById('check-rev2-1');
  const checkRev2_2 = document.getElementById('check-rev2-2');
  const checkRev2_3 = document.getElementById('check-rev2-3');
  const checkRev2_4 = document.getElementById('check-rev2-4');
  const simulado2Completed = checkRev2_1 && checkRev2_2 && checkRev2_3 && checkRev2_4 &&
                             checkRev2_1.checked && checkRev2_2.checked && checkRev2_3.checked && checkRev2_4.checked;
  
  const reportData = {
    disciplina: 'ECS-26 Desenvolvimento Web - Backend',
    trimestre: '2º Trimestre',
    dataAvaliacao: '25/06/2026',
    dataExportacao: new Date().toLocaleString('pt-BR'),
    progressoChecklists: `${percent}% (${checkedCheckboxes}/${totalCheckboxes} itens concluidos)`,
    statusSimulado: simuladoCompleted ? 'CONCLUÍDO / HOMOLOGADO' : 'PENDENTE',
    statusSimulado2: simulado2Completed ? 'CONCLUÍDO / HOMOLOGADO' : 'PENDENTE',
    avaliacao1Unlocked: examUnlocked,
    notaAvaliacao1: examGrade,
    statusEstudante: (checkedCheckboxes === totalCheckboxes && examGrade === '4/4') ? 'EXCELENTE (100% CONCLUIDO)' : 'EM ANDAMENTO'
  };
  
  const fileContent = `=============================================================
RELATÓRIO DE RENDIMENTO - BACKEND (MATRIX DASHBOARD)
=============================================================
Estudante: ${studentNameVal.toUpperCase()}
Gerado em: ${reportData.dataExportacao}
Curso: ${reportData.disciplina}
Avaliação: ${reportData.trimestre}

-------------------------------------------------------------
1. DADOS DE ATIVIDADES (CHECKLISTS DA EMENTA):
Módulos Concluídos: ${reportData.progressoChecklists}
Percentual de Conclusão: ${percent}%

-------------------------------------------------------------
2. STATUS DO SIMULADO 1 (REVISÃO 18/06):
Conectividade e CRUD Homologados: ${reportData.statusSimulado}

-------------------------------------------------------------
3. STATUS DO SIMULADO 2 (REVISÃO 20/06):
PATCH e CRUD Homologados: ${reportData.statusSimulado2}

-------------------------------------------------------------
4. STATUS DA AVALIAÇÃO 1 (PROVA PRÁTICA):
Chave de Acesso Liberada: ${reportData.avaliacao1Unlocked ? 'SIM' : 'NÃO'}
Resultado Validação API Local: ${reportData.notaAvaliacao1}

-------------------------------------------------------------
5. PARECER DO OPERADOR:
Status Geral: ${reportData.statusEstudante}
=============================================================
`;

  const blob = new Blob([fileContent], { type: 'text/plain;charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const sanitizedName = studentNameVal.trim().replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  a.download = `relatorio_aluno_${sanitizedName || 'sem_nome'}_${new Date().toISOString().slice(0,10)}.txt`;
  
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
  playBeep('success');
}
