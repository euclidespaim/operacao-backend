import { playBeep } from './sound.js';

export function initProgressTracker() {
  const checkboxes = document.querySelectorAll('.checklist-checkbox');
  const progressBar = document.getElementById('mission-progress-bar');
  const progressPercentText = document.getElementById('mission-progress-percent');
  const buttons = document.querySelectorAll('.mission-btn');
  
  if (checkboxes.length === 0) return;
  
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
    if (progressBar) progressBar.style.width = `${percentage}%`;
    if (progressPercentText) progressPercentText.textContent = `${percentage}% CONCLUÍDO`;
    
    // Update completion indicators for all 25 modules
    buttons.forEach(btn => {
      const sectionId = btn.getAttribute('data-section');
      const secCheckboxes = document.querySelectorAll(`.checklist-checkbox[data-section="${sectionId}"]`);
      const secChecked = Array.from(secCheckboxes).filter(cb => cb.checked).length;
      const secTotal = secCheckboxes.length;
      const statusLabel = btn.querySelector('.mission-status-label');
      
      if (secChecked === secTotal && secTotal > 0) {
        btn.classList.add('completed');
        if (statusLabel) statusLabel.textContent = 'Concluído';
      } else {
        btn.classList.remove('completed');
        if (statusLabel) {
          if (btn.classList.contains('active')) {
            statusLabel.textContent = 'Em andamento';
          } else {
            statusLabel.textContent = 'Pendente';
          }
        }
      }
    });

    // Notify other components (like teacher panel) that progress state has updated
    window.dispatchEvent(new CustomEvent('state-changed'));
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

export function initStudentProfile() {
  const nameInput = document.getElementById('student-name-input');
  if (!nameInput) return;
  
  // Load cache name
  const savedName = localStorage.getItem('studentName') || '';
  nameInput.value = savedName;
  
  nameInput.addEventListener('input', () => {
    localStorage.setItem('studentName', nameInput.value);
    window.dispatchEvent(new CustomEvent('state-changed'));
  });
}
