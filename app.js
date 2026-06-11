import { initSoundSystem, initAudioContext } from './js/sound.js';
import { 
  initAccordion, 
  initNavigation, 
  initTerminalSimulator, 
  initMetaphorSimulator, 
  initClipboardCopier 
} from './js/ui.js';
import { initProgressTracker, initStudentProfile } from './js/state.js';
import { initLocalServerChecker } from './js/checker.js';
import { initSandboxCrud } from './js/sandbox.js';
import { initTeacherMode } from './js/teacher.js';
import { 
  initEvaluationSystem, 
  initReviewSystem, 
  initReview2System 
} from './js/tests.js';

// Initialize Elements on DOMContentLoaded
document.addEventListener('DOMContentLoaded', () => {
  initSoundSystem();
  initAccordion();
  initNavigation();
  initProgressTracker(); // Must run after navigation to restore checklist states
  initTerminalSimulator();
  initMetaphorSimulator();
  initClipboardCopier();
  initLocalServerChecker();
  initSandboxCrud();
  initTeacherMode();
  initEvaluationSystem();
  initStudentProfile();
  initReviewSystem();
  initReview2System();
  
  // Audio activation helper on first user click
  document.addEventListener('click', initAudioContext, { once: true });
});
