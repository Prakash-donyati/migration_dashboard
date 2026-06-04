/* =============================================
   DATA MIGRATION DASHBOARD - APPLICATION LOGIC
   ============================================= */

document.addEventListener('DOMContentLoaded', () => {
    // --- DOM References ---
    const migrationToggleBtns = document.querySelectorAll('.toggle-btn');
    const maskRadios = document.querySelectorAll('input[name="mask-data"]');
    const passwordToggle = document.getElementById('password-toggle');
    const passwordInput = document.getElementById('password');

    // Form inputs
    const targetUrlInput = document.getElementById('target-url');
    const usernameInput = document.getElementById('username');
    const appNameInput = document.getElementById('app-name');
    
    // Application Tiles
    const appTiles = document.querySelectorAll('.app-tile');

    // Submit & Live Status Panel
    const liveLogOutput = document.getElementById('live-log-output');
    const liveProgressBar = document.getElementById('live-progress-bar');
    const liveProgressPercent = document.getElementById('live-progress-percent');
    const liveStatusBadge = document.getElementById('live-status-badge');
    const liveStatusTitle = document.getElementById('status-title');
    const liveStatusIcon = document.getElementById('status-icon');
    const startTimeDisplay = document.getElementById('start-time-display');
    const endTimeDisplay = document.getElementById('end-time-display');
    const durationDisplay = document.getElementById('duration-display');
    const liveStepItems = document.querySelectorAll('.live-step-item');
    const liveStepLines = document.querySelectorAll('.live-step-line');

    // Wizard Navigation
    const btnBack = document.getElementById('btn-back');
    const btnNext = document.getElementById('btn-next');
    const btnSubmit = document.getElementById('btn-submit');
    const wizardSteps = document.querySelectorAll('.wizard-step');
    const stepItems = document.querySelectorAll('.step-item');
    const stepLines = document.querySelectorAll('.step-line');

    // --- State ---
    let currentStep = 1;
    let selectedMigrationType = 'Both';
    let isMaskDataEnabled = true;

    // --- Wizard Navigation Handler ---
    function goToStep(step) {
        currentStep = step;

        // Toggle active classes on steps
        wizardSteps.forEach((stepEl, idx) => {
            if (idx + 1 === step) {
                stepEl.classList.add('active');
            } else {
                stepEl.classList.remove('active');
            }
        });

        // Update Nav Buttons visibility
        if (currentStep === 1) {
            btnBack.style.visibility = 'hidden';
            btnNext.style.display = 'inline-flex';
            btnSubmit.style.display = 'none';
        } else if (currentStep === 2) {
            btnBack.style.visibility = 'visible';
            btnNext.style.display = 'inline-flex';
            btnSubmit.style.display = 'none';
        } else if (currentStep === 3) {
            btnBack.style.visibility = 'visible';
            btnNext.style.display = 'none';
            btnSubmit.style.display = 'inline-flex';
        }

        // Update Step Indicators
        stepItems.forEach((item, idx) => {
            const stepNum = idx + 1;
            if (stepNum < currentStep) {
                item.classList.add('completed');
                item.classList.remove('active');
            } else if (stepNum === currentStep) {
                item.classList.add('active');
                item.classList.remove('completed');
            } else {
                item.classList.remove('active', 'completed');
            }
        });

        // Update Step Connecting Lines
        stepLines.forEach((line, idx) => {
            const lineNum = idx + 1;
            if (lineNum < currentStep) {
                line.classList.add('active');
            } else {
                line.classList.remove('active');
            }
        });
    }

    function validateStep(step) {
        if (step === 1) {
            // Validate Target URL
            if (!targetUrlInput.value.trim()) {
                targetUrlInput.reportValidity();
                targetUrlInput.focus();
                // Add visual error cue
                targetUrlInput.style.borderColor = 'var(--error)';
                setTimeout(() => {
                    targetUrlInput.style.borderColor = '';
                }, 2000);
                return false;
            }
            try {
                // Quick validation of URL format
                new URL(targetUrlInput.value);
            } catch (e) {
                // If it's a valid host but not starting with http/https, auto-prefix
                if (!targetUrlInput.value.startsWith('http://') && !targetUrlInput.value.startsWith('https://')) {
                    targetUrlInput.value = 'https://' + targetUrlInput.value;
                }
            }

            // Validate Username
            if (!usernameInput.value.trim()) {
                usernameInput.reportValidity();
                usernameInput.focus();
                usernameInput.style.borderColor = 'var(--error)';
                setTimeout(() => {
                    usernameInput.style.borderColor = '';
                }, 2000);
                return false;
            }

            // Validate Password
            if (passwordInput.value.length === 0) {
                passwordInput.reportValidity();
                passwordInput.focus();
                passwordInput.style.borderColor = 'var(--error)';
                setTimeout(() => {
                    passwordInput.style.borderColor = '';
                }, 2000);
                return false;
            }
        }
        return true;
    }

    // --- Wire navigation events ---
    btnNext.addEventListener('click', () => {
        if (validateStep(currentStep)) {
            goToStep(currentStep + 1);
        }
    });

    btnBack.addEventListener('click', () => {
        if (currentStep > 1) {
            goToStep(currentStep - 1);
        }
    });

    // Make Step indicators clickable to jump between steps (if valid)
    stepItems.forEach((item, idx) => {
        item.addEventListener('click', () => {
            const targetStep = idx + 1;
            if (targetStep < currentStep) {
                goToStep(targetStep);
            } else if (targetStep > currentStep) {
                let valid = true;
                for (let s = currentStep; s < targetStep; s++) {
                    if (!validateStep(s)) {
                        valid = false;
                        break;
                    }
                }
                if (valid) {
                    goToStep(targetStep);
                }
            }
        });
    });

    // Initialize first step
    goToStep(1);

    // --- Application Tiles Click Handler ---
    appTiles.forEach(tile => {
        tile.addEventListener('click', () => {
            appTiles.forEach(t => t.classList.remove('active'));
            tile.classList.add('active');
            const val = tile.dataset.value;
            appNameInput.value = val;
        });
    });

    // --- Migration Type Toggle ---
    migrationToggleBtns.forEach(btn => {
        btn.addEventListener('click', () => {
            migrationToggleBtns.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            selectedMigrationType = btn.dataset.value;
        });
    });

    // --- Mask Data Radio ---
    maskRadios.forEach(radio => {
        radio.addEventListener('change', () => {
            isMaskDataEnabled = radio.value === 'yes';
        });
    });

    // --- Password Toggle ---
    passwordToggle.addEventListener('click', () => {
        const isPassword = passwordInput.type === 'password';
        passwordInput.type = isPassword ? 'text' : 'password';
        passwordToggle.querySelector('i').className = isPassword ? 'fas fa-eye-slash' : 'fas fa-eye';
    });

    // --- Live Status Stepper Update ---
    function updateLiveStep(stepNum, status = 'active') {
        const percentMap = {
            1: 14,
            2: 28,
            3: 42,
            4: 57,
            5: 71,
            6: 85,
            7: 100
        };
        const pct = percentMap[stepNum] || 0;
        liveProgressBar.style.width = pct + '%';
        liveProgressPercent.textContent = pct + '%';

        liveStepItems.forEach((item, idx) => {
            const currentItemNum = idx + 1;
            if (currentItemNum < stepNum) {
                item.className = 'live-step-item completed';
                item.querySelector('.live-step-circle').innerHTML = '<i class="fas fa-check"></i>';
            } else if (currentItemNum === stepNum) {
                if (status === 'error') {
                    item.className = 'live-step-item error';
                    item.querySelector('.live-step-circle').innerHTML = '<i class="fas fa-times"></i>';
                } else if (status === 'completed') {
                    item.className = 'live-step-item completed';
                    item.querySelector('.live-step-circle').innerHTML = '<i class="fas fa-check"></i>';
                } else {
                    item.className = 'live-step-item active';
                    item.querySelector('.live-step-circle').textContent = currentItemNum;
                }
            } else {
                item.className = 'live-step-item';
                item.querySelector('.live-step-circle').textContent = currentItemNum;
            }
        });

        liveStepLines.forEach((line, idx) => {
            const currentLineNum = idx + 1;
            if (currentLineNum < stepNum) {
                line.className = 'live-step-line active';
            } else {
                line.className = 'live-step-line';
            }
        });
    }

    // --- Live Timer ---
    let durationTimer = null;
    let durationSeconds = 0;

    function startTimer() {
        clearInterval(durationTimer);
        durationSeconds = 0;
        durationDisplay.innerHTML = `<i class="fas fa-hourglass-half" style="font-size: 0.75rem; margin-right: 4px;"></i> Duration: 0s`;
        durationTimer = setInterval(() => {
            durationSeconds++;
            durationDisplay.innerHTML = `<i class="fas fa-hourglass-half" style="font-size: 0.75rem; margin-right: 4px;"></i> Duration: ${durationSeconds}s`;
        }, 1000);
    }

    function stopTimer() {
        clearInterval(durationTimer);
    }

    // --- Capture Source URL from parent message origin ---
    let sourceUrl = 'https://epm31-test-a635047.epm.us-ashburn-1.ocs.oraclecloud.com';
    window.addEventListener('message', (event) => {
        if (event.data && event.data.type === 'EPM_SET_PARAMS') {
            if (event.origin) {
                sourceUrl = event.origin;
            }
        }
    });

    // --- Submit Button (Run Migration) ---
    btnSubmit.addEventListener('click', async () => {
        if (!validateStep(1)) {
            goToStep(1);
            return;
        }

        // Disable buttons & navigation to prevent double click / changes
        btnSubmit.disabled = true;
        btnBack.disabled = true;
        btnSubmit.style.opacity = '0.5';
        btnSubmit.style.cursor = 'not-allowed';
        btnBack.style.opacity = '0.5';
        btnBack.style.cursor = 'not-allowed';

        // Clear UI states
        liveLogOutput.value = '';
        liveStatusBadge.textContent = 'Running';
        liveStatusBadge.style.background = 'rgba(59, 130, 246, 0.08)';
        liveStatusBadge.style.color = 'var(--info)';
        liveStatusBadge.style.borderColor = 'rgba(59, 130, 246, 0.15)';
        
        liveStatusTitle.textContent = 'Migration In Progress';
        liveStatusIcon.className = 'fas fa-sync fa-spin';
        liveStatusIcon.style.color = 'var(--info)';
        
        endTimeDisplay.innerHTML = `<i class="fas fa-stop" style="font-size: 0.75rem; margin-right: 4px;"></i> End: --:--:--`;
        
        // Show panel
        const liveStatusPanel = document.getElementById('live-status-panel');
        liveStatusPanel.style.display = 'block';
        setTimeout(() => {
            liveStatusPanel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
        }, 50);

        // Reset stepper
        updateLiveStep(1, 'active');

        const payload = {
            sourceUrl: sourceUrl,
            targetUrl: targetUrlInput.value.trim(),
            username: usernameInput.value.trim(),
            password: passwordInput.value
        };

        try {
            startTimer();
            
            const response = await fetch('http://localhost:3000/api/migrate', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const errData = await response.json();
                throw new Error(errData.error || 'Server error');
            }

            const reader = response.body.getReader();
            const decoder = new TextDecoder('utf-8');
            let chunkBuffer = '';

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunkBuffer += decoder.decode(value, { stream: true });
                const lines = chunkBuffer.split('\n');
                chunkBuffer = lines.pop(); // Keep last partial line

                for (const line of lines) {
                    if (!line.trim()) continue;

                    try {
                        const event = JSON.parse(line);
                        
                        if (event.type === 'start') {
                            startTimeDisplay.innerHTML = `<i class="fas fa-play" style="font-size: 0.75rem; margin-right: 4px;"></i> Start: ${event.startTime}`;
                        } else if (event.type === 'step') {
                            updateLiveStep(event.step, 'active');
                        } else if (event.type === 'log') {
                            liveLogOutput.value += event.text + '\n';
                            liveLogOutput.scrollTop = liveLogOutput.scrollHeight;
                        } else if (event.type === 'success') {
                            stopTimer();
                            updateLiveStep(7, 'completed');
                            endTimeDisplay.innerHTML = `<i class="fas fa-stop" style="font-size: 0.75rem; margin-right: 4px;"></i> End: ${event.endTime}`;
                            durationDisplay.innerHTML = `<i class="fas fa-hourglass-half" style="font-size: 0.75rem; margin-right: 4px;"></i> Duration: ${event.duration}`;
                            
                            liveStatusTitle.textContent = 'Migration Complete';
                            liveStatusIcon.className = 'fas fa-check-circle';
                            liveStatusIcon.style.color = 'var(--success)';
                            
                            liveStatusBadge.textContent = 'Success';
                            liveStatusBadge.style.background = 'rgba(16, 185, 129, 0.1)';
                            liveStatusBadge.style.color = 'var(--success)';
                            liveStatusBadge.style.borderColor = 'rgba(16, 185, 129, 0.15)';
                        } else if (event.type === 'error') {
                            stopTimer();
                            
                            const activeStepEl = document.querySelector('.live-step-item.active');
                            if (activeStepEl) {
                                const stepNum = parseInt(activeStepEl.id.replace('live-step-', ''), 10);
                                updateLiveStep(stepNum, 'error');
                            }
                            
                            endTimeDisplay.innerHTML = `<i class="fas fa-stop" style="font-size: 0.75rem; margin-right: 4px;"></i> End: ${event.endTime}`;
                            durationDisplay.innerHTML = `<i class="fas fa-hourglass-half" style="font-size: 0.75rem; margin-right: 4px;"></i> Duration: ${event.duration}`;
                            
                            liveStatusTitle.textContent = 'Migration Failed';
                            liveStatusIcon.className = 'fas fa-exclamation-circle';
                            liveStatusIcon.style.color = 'var(--error)';
                            
                            liveStatusBadge.textContent = 'Failed';
                            liveStatusBadge.style.background = 'rgba(239, 68, 68, 0.1)';
                            liveStatusBadge.style.color = 'var(--error)';
                            liveStatusBadge.style.borderColor = 'rgba(239, 68, 68, 0.15)';
                            
                            liveLogOutput.value += `\n[ERROR] ${event.message}\n`;
                            liveLogOutput.scrollTop = liveLogOutput.scrollHeight;
                        }
                    } catch (e) {
                        console.error('Failed to parse streaming line:', e, line);
                    }
                }
            }
        } catch (err) {
            stopTimer();
            liveStatusTitle.textContent = 'Connection Error';
            liveStatusIcon.className = 'fas fa-exclamation-triangle';
            liveStatusIcon.style.color = 'var(--error)';
            
            liveStatusBadge.textContent = 'Offline';
            liveStatusBadge.style.background = 'rgba(239, 68, 68, 0.1)';
            liveStatusBadge.style.color = 'var(--error)';
            liveStatusBadge.style.borderColor = 'rgba(239, 68, 68, 0.15)';
            
            liveLogOutput.value += `\n[CONNECTION ERROR] ${err.message}\nEnsure backend server is running on http://localhost:3000\n`;
            liveLogOutput.scrollTop = liveLogOutput.scrollHeight;
            
            // If we failed early, mark step 1 as error
            updateLiveStep(1, 'error');
        } finally {
            // Re-enable buttons
            btnSubmit.disabled = false;
            btnBack.disabled = false;
            btnSubmit.style.opacity = '1';
            btnSubmit.style.cursor = 'pointer';
            btnBack.style.opacity = '1';
            btnBack.style.cursor = 'pointer';
        }
    });
});
