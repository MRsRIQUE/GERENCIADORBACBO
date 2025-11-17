// Application State
let appState = {
    balance: 0,
    initialBalance: 0,
    bets: [],
    stopLoss: {
        enabled: false,
        maxLoss: 100,
        maxProfit: 200
    },
    currentBetAmount: 0,
    currentBetType: '',
    currentMultiplier: 8,
    progressionType: 'fixed',
    initialized: false,
    sessionStart: null,
    historyFilter: 'all'
};

// Initialize App
function initApp() {
    loadData();
    if (!appState.initialized) {
        showInitialSetup();
    } else {
        updateUI();
    }
    updateStopLossUI();
}

// Show Initial Setup
function showInitialSetup() {
    document.getElementById('initialSetup').style.display = 'block';
    document.querySelector('.balance-card').style.opacity = '0.5';
}

// Setup Bankroll
function setupBankroll() {
    const initial = parseFloat(document.getElementById('initialBankroll').value);

    if (!initial || initial <= 0) {
        showToast('Por favor, digite uma banca inicial válida!', 'error');
        return;
    }

    appState.balance = initial;
    appState.initialBalance = initial;
    appState.initialized = true;
    appState.sessionStart = new Date().toISOString();

    saveData();
    document.getElementById('initialSetup').style.display = 'none';
    document.querySelector('.balance-card').style.opacity = '1';
    updateUI();
    showToast('Banca configurada com sucesso! 🎉', 'success');
}

// Toggle Settings
function toggleSettings() {
    const panel = document.getElementById('settingsPanel');
    panel.classList.toggle('active');
    
    if (panel.classList.contains('active')) {
        document.getElementById('settingsInitialBalance').value = appState.initialBalance;
    }
}

// Update Initial Balance
function updateInitialBalance() {
    const newBalance = parseFloat(document.getElementById('settingsInitialBalance').value);
    
    if (!newBalance || newBalance <= 0) {
        showToast('Digite um valor válido!', 'error');
        return;
    }

    appState.initialBalance = newBalance;
    appState.balance = newBalance;
    appState.bets = [];
    
    saveData();
    updateUI();
    toggleSettings();
    showToast('Banca inicial atualizada!', 'success');
}

// Set Quick Bet Percentage
function setQuickBetPercentage(percentage) {
    const amount = (appState.balance * percentage).toFixed(2);
    document.getElementById('betAmount').value = amount;
    appState.currentBetAmount = parseFloat(amount);
}

// Select Bet Type
function selectBetType(type) {
    // Remove all selected classes
    document.querySelectorAll('.bet-type-card').forEach(card => {
        card.classList.remove('selected');
        card.querySelector('.bet-type-check').style.display = 'none';
    });

    // Add selected class to clicked card
    const card = event.currentTarget;
    card.classList.add('selected');
    card.querySelector('.bet-type-check').style.display = 'block';
    
    appState.currentBetType = type;

    // Show/hide TIE multipliers
    const tieMultipliers = document.getElementById('tieMultipliers');
    if (type === 'TIE') {
        tieMultipliers.style.display = 'grid';
    } else {
        tieMultipliers.style.display = 'none';
    }

    // Show result buttons if amount is valid
    const amount = parseFloat(document.getElementById('betAmount').value);
    if (amount > 0 && amount <= appState.balance) {
        document.getElementById('resultButtons').style.display = 'block';
    }
}

// Select Multiplier
function selectMultiplier(multiplier, event) {
    event.stopPropagation();
    
    // Remove selected from all multiplier buttons
    document.querySelectorAll('.multiplier-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
    
    // Add selected to clicked button
    event.target.classList.add('selected');
    appState.currentMultiplier = multiplier;
}

// Record Bet
function recordBet(result) {
    const amount = parseFloat(document.getElementById('betAmount').value);
    const betType = appState.currentBetType;

    if (!amount || amount <= 0) {
        showToast('Selecione um valor válido!', 'error');
        return;
    }

    if (!betType) {
        showToast('Selecione o tipo de aposta!', 'error');
        return;
    }

    if (amount > appState.balance) {
        showToast(`❌ Saldo insuficiente! Banca: R$ ${appState.balance.toFixed(2)}`, 'error');
        document.getElementById('betAmount').style.borderColor = 'var(--danger)';
        setTimeout(() => {
            document.getElementById('betAmount').style.borderColor = 'var(--primary-gold)';
        }, 2000);
        return;
    }

    // Check Stop Loss before bet
    const currentProfit = appState.balance - appState.initialBalance;
    if (appState.stopLoss.enabled) {
        if (currentProfit <= -appState.stopLoss.maxLoss) {
            showToast('⚠️ STOP LOSS ATINGIDO! Limite de perda alcançado.', 'error');
            return;
        }
        if (currentProfit >= appState.stopLoss.maxProfit) {
            showToast('🎯 STOP GAIN ATINGIDO! Meta de lucro alcançada.', 'success');
            return;
        }
    }

    // Calculate profit
    let profit = 0;
    if (result === 'WIN') {
        if (betType === 'TIE') {
            profit = amount * appState.currentMultiplier;
        } else {
            profit = amount; // 1:1 for PLAYER and BANKER
        }
    } else {
        profit = -amount;
    }

    // Record bet
    const bet = {
        id: Date.now(),
        timestamp: new Date().toISOString(),
        type: betType,
        amount: amount,
        result: result,
        profit: profit,
        multiplier: betType === 'TIE' ? appState.currentMultiplier : null,
        balance: appState.balance + profit
    };

    appState.bets.unshift(bet);
    appState.balance += profit;
    
    saveData();
    updateUI();
    resetBetForm(amount); // Passa o valor da aposta para manter

    // Show toast
    if (result === 'WIN') {
        const multiplierText = betType === 'TIE' ? ` (${appState.currentMultiplier}x)` : '';
        showToast(`Vitória! +R$ ${profit.toFixed(2)}${multiplierText}`, 'success');
    } else {
        showToast(`Derrota: -R$ ${amount.toFixed(2)}`, 'error');
    }

    // Check alerts after bet
    checkStopLossAlerts();
}

// Reset Bet Form
function resetBetForm(keepAmount = null) {
    // Mantém o valor da aposta se foi passado
    if (keepAmount !== null) {
        document.getElementById('betAmount').value = keepAmount.toFixed(2);
    } else {
        document.getElementById('betAmount').value = '';
    }
    
    document.querySelectorAll('.bet-type-card').forEach(card => {
        card.classList.remove('selected');
        card.querySelector('.bet-type-check').style.display = 'none';
    });
    document.getElementById('tieMultipliers').style.display = 'none';
    document.getElementById('resultButtons').style.display = 'none';
    
    appState.currentBetAmount = keepAmount !== null ? keepAmount : 0;
    appState.currentBetType = '';
    appState.currentMultiplier = 8;
    
    // Reset multiplier selection
    document.querySelectorAll('.multiplier-btn').forEach(btn => {
        btn.classList.remove('selected');
    });
}

// Update UI
function updateUI() {
    updateBalance();
    updateStats();
    updateHistory();
    updateChart();
}

// Update Balance
function updateBalance() {
    const profit = appState.balance - appState.initialBalance;
    const profitPercent = ((profit / appState.initialBalance) * 100).toFixed(2);
    
    document.getElementById('currentBalance').textContent = `R$ ${appState.balance.toFixed(2)}`;
    
    const profitDisplay = document.getElementById('profitDisplay');
    const icon = profit >= 0 ? '📈' : '📉';
    const className = profit >= 0 ? 'profit-positive' : 'profit-negative';
    const sign = profit >= 0 ? '+' : '';
    
    profitDisplay.innerHTML = `
        <span class="${className}">
            ${icon} ${sign}R$ ${profit.toFixed(2)} (${sign}${profitPercent}%)
        </span>
    `;
}

// Update Stats
function updateStats() {
    const totalBets = appState.bets.length;
    const wins = appState.bets.filter(b => b.result === 'WIN').length;
    const losses = appState.bets.filter(b => b.result === 'LOSS').length;
    const winRate = totalBets > 0 ? (wins / totalBets * 100).toFixed(1) : 0;
    const avgBet = totalBets > 0 ? (appState.bets.reduce((sum, b) => sum + b.amount, 0) / totalBets).toFixed(2) : 0;
    const totalProfit = appState.balance - appState.initialBalance;

    document.getElementById('totalBets').textContent = totalBets;
    document.getElementById('totalWins').textContent = wins;
    document.getElementById('totalLosses').textContent = losses;
    document.getElementById('winRate').textContent = `${winRate}%`;
    document.getElementById('avgBet').textContent = `R$ ${avgBet}`;
    
    const profitEl = document.getElementById('totalProfit');
    profitEl.textContent = `R$ ${totalProfit.toFixed(2)}`;
    profitEl.style.color = totalProfit >= 0 ? 'var(--success)' : 'var(--danger)';

    // Calculate ROI
    const roi = appState.initialBalance > 0 ? ((totalProfit / appState.initialBalance) * 100).toFixed(1) : 0;
    const roiEl = document.getElementById('roi');
    if (roiEl) {
        roiEl.textContent = `${roi}%`;
        roiEl.style.color = roi >= 0 ? 'var(--success)' : 'var(--danger)';
    }

    // Update session time
    updateSessionTime();

    // Calculate streaks
    let currentStreak = 0;
    let bestStreak = 0;
    let tempStreak = 0;
    let lastResult = '';

    for (let bet of appState.bets) {
        if (bet.result === lastResult) {
            tempStreak++;
        } else {
            if (tempStreak > bestStreak) {
                bestStreak = tempStreak;
            }
            tempStreak = 1;
            lastResult = bet.result;
        }
    }

    if (tempStreak > bestStreak) {
        bestStreak = tempStreak;
    }
    currentStreak = tempStreak;

    document.getElementById('currentStreak').textContent = currentStreak;
    document.getElementById('bestStreak').textContent = bestStreak;
}

// Update Session Time
function updateSessionTime() {
    if (!appState.sessionStart) return;
    
    const now = Date.now();
    const elapsed = now - appState.sessionStart;
    const hours = Math.floor(elapsed / (1000 * 60 * 60));
    const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
    
    const sessionTimeEl = document.getElementById('sessionTime');
    if (sessionTimeEl) {
        sessionTimeEl.textContent = `${hours}h ${minutes}m`;
    }
}

// Update History
function updateHistory() {
    const historyList = document.getElementById('historyList');
    
    // Apply filter
    let filteredBets = appState.bets;
    if (appState.historyFilter && appState.historyFilter !== 'all') {
        filteredBets = appState.bets.filter(bet => {
            if (appState.historyFilter === 'WIN' || appState.historyFilter === 'LOSS') {
                return bet.result === appState.historyFilter;
            } else {
                return bet.type === appState.historyFilter;
            }
        });
    }
    
    if (filteredBets.length === 0) {
        historyList.innerHTML = '<p style="text-align: center; color: var(--light-gold);">Nenhuma aposta registrada.</p>';
        return;
    }

    historyList.innerHTML = filteredBets.map(bet => {
        const date = new Date(bet.timestamp);
        const formattedDate = date.toLocaleDateString('pt-BR');
        const formattedTime = date.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
        const multiplierText = bet.multiplier ? ` (${bet.multiplier}x)` : '';
        
        return `
            <div class="history-item ${bet.result.toLowerCase()}">
                <div class="history-header">
                    <span class="history-bet-type">${bet.type}${multiplierText}</span>
                    <span class="history-result ${bet.result.toLowerCase()}">
                        ${bet.result === 'WIN' ? '✅ VITÓRIA' : '❌ DERROTA'}
                    </span>
                </div>
                <div class="history-details">
                    <span>Valor: R$ ${bet.amount.toFixed(2)}</span>
                    <span style="color: ${bet.profit >= 0 ? 'var(--success)' : 'var(--danger)'};">
                        ${bet.profit >= 0 ? '+' : ''}R$ ${bet.profit.toFixed(2)}
                    </span>
                </div>
                <div class="history-details">
                    <span>${formattedDate} ${formattedTime}</span>
                    <span>Saldo: R$ ${bet.balance.toFixed(2)}</span>
                </div>
                <div style="text-align: right; margin-top: 10px;">
                    <button class="history-delete" onclick="deleteBet(${bet.id})" style="position: static;">🗑️ Excluir</button>
                </div>
            </div>
        `;
    }).join('');
}

// Filter History
function filterHistory(filter) {
    appState.historyFilter = filter;
    saveState();
    updateHistory();
    
    // Update active button
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.classList.remove('active');
        if (btn.getAttribute('data-filter') === filter) {
            btn.classList.add('active');
        }
    });
}

// Update Chart
function updateChart() {
    const canvas = document.getElementById('performanceChart');
    const ctx = canvas.getContext('2d');
    
    canvas.width = canvas.offsetWidth;
    canvas.height = 250;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (appState.bets.length === 0) {
        ctx.fillStyle = '#F4E4B5';
        ctx.font = '16px Arial';
        ctx.textAlign = 'center';
        ctx.fillText('Nenhum dado disponível', canvas.width / 2, canvas.height / 2);
        return;
    }

    const data = [appState.initialBalance, ...appState.bets.slice().reverse().map(b => b.balance)];
    
    const padding = 40;
    const chartWidth = canvas.width - padding * 2;
    const chartHeight = canvas.height - padding * 2;
    
    const maxValue = Math.max(...data);
    const minValue = Math.min(...data);
    const valueRange = maxValue - minValue || 1;
    
    const stepX = chartWidth / (data.length - 1 || 1);

    // Draw grid
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.2)';
    ctx.lineWidth = 1;
    for (let i = 0; i <= 5; i++) {
        const y = padding + (chartHeight / 5) * i;
        ctx.beginPath();
        ctx.moveTo(padding, y);
        ctx.lineTo(canvas.width - padding, y);
        ctx.stroke();
    }

    // Draw line
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 3;
    ctx.beginPath();
    
    data.forEach((value, index) => {
        const x = padding + stepX * index;
        const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        
        if (index === 0) {
            ctx.moveTo(x, y);
        } else {
            ctx.lineTo(x, y);
        }
    });
    
    ctx.stroke();

    // Draw points
    ctx.fillStyle = '#D4AF37';
    data.forEach((value, index) => {
        const x = padding + stepX * index;
        const y = padding + chartHeight - ((value - minValue) / valueRange) * chartHeight;
        
        ctx.beginPath();
        ctx.arc(x, y, 4, 0, Math.PI * 2);
        ctx.fill();
    });

    // Draw labels
    ctx.fillStyle = '#F4E4B5';
    ctx.font = '12px Arial';
    ctx.textAlign = 'right';
    
    for (let i = 0; i <= 5; i++) {
        const value = maxValue - (valueRange / 5) * i;
        const y = padding + (chartHeight / 5) * i;
        ctx.fillText(`R$ ${value.toFixed(0)}`, padding - 10, y + 4);
    }
}

// Delete Bet
function deleteBet(id) {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = 'Confirmar Exclusão';
    document.getElementById('modalMessage').innerHTML = 'Tem certeza que deseja excluir esta aposta?<br><strong>Esta ação não pode ser desfeita!</strong>';
    
    const confirmBtn = document.getElementById('modalConfirm');
    confirmBtn.onclick = () => {
        const index = appState.bets.findIndex(b => b.id === id);
        if (index > -1) {
            const bet = appState.bets[index];
            appState.bets.splice(index, 1);
            
            // Recalculate balance
            appState.balance = appState.initialBalance;
            appState.bets.slice().reverse().forEach(b => {
                appState.balance = b.balance;
            });

            saveData();
            updateUI();
            showToast('Aposta excluída com sucesso!', 'info');
        }
        closeModal();
    };

    modal.classList.add('active');
}

// Export History
function exportHistory() {
    if (appState.bets.length === 0) {
        showToast('Nenhum histórico para exportar!', 'error');
        return;
    }

    let csv = 'REI DO BACBO - HISTÓRICO DE APOSTAS\n\n';
    csv += 'Data,Hora,Tipo,Valor,Resultado,Multiplicador,Lucro/Prejuízo,Saldo\n';

    appState.bets.slice().reverse().forEach(bet => {
        const date = new Date(bet.timestamp);
        const formattedDate = date.toLocaleDateString('pt-BR');
        const formattedTime = date.toLocaleTimeString('pt-BR');
        
        csv += `${formattedDate},${formattedTime},${bet.type},R$ ${bet.amount.toFixed(2)},${bet.result},${bet.multiplier || '-'},R$ ${bet.profit.toFixed(2)},R$ ${bet.balance.toFixed(2)}\n`;
    });

    // Calculate statistics
    const totalProfit = appState.balance - appState.initialBalance;
    const roi = appState.initialBalance > 0 ? ((totalProfit / appState.initialBalance) * 100).toFixed(1) : 0;
    const wins = appState.bets.filter(b => b.result === 'WIN').length;
    const losses = appState.bets.filter(b => b.result === 'LOSS').length;
    const winRate = appState.bets.length > 0 ? ((wins / appState.bets.length) * 100).toFixed(1) : 0;
    
    // Session duration
    let sessionDuration = '-';
    if (appState.sessionStart) {
        const elapsed = Date.now() - appState.sessionStart;
        const hours = Math.floor(elapsed / (1000 * 60 * 60));
        const minutes = Math.floor((elapsed % (1000 * 60 * 60)) / (1000 * 60));
        sessionDuration = `${hours}h ${minutes}m`;
    }

    csv += '\nRESUMO\n';
    csv += `Banca Inicial,R$ ${appState.initialBalance.toFixed(2)}\n`;
    csv += `Banca Atual,R$ ${appState.balance.toFixed(2)}\n`;
    csv += `Lucro/Prejuízo,R$ ${totalProfit.toFixed(2)}\n`;
    csv += `ROI,${roi}%\n`;
    csv += `Win Rate,${winRate}%\n`;
    csv += `Tempo de Sessão,${sessionDuration}\n`;
    csv += `Total de Apostas,${appState.bets.length}\n`;

    downloadCSV(csv, `rei_do_bacbo_historico_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Histórico exportado com sucesso! 📥', 'success');
}

// Stop Loss Functions
function toggleStopLoss() {
    const enabled = document.getElementById('stopLossEnabled').checked;
    const settings = document.getElementById('stopLossSettings');
    
    appState.stopLoss.enabled = enabled;
    settings.style.display = enabled ? 'block' : 'none';
    
    saveData();
    updateStopLossUI();
}

function updateStopLossUI() {
    document.getElementById('stopLossEnabled').checked = appState.stopLoss.enabled;
    document.getElementById('maxLoss').value = appState.stopLoss.maxLoss;
    document.getElementById('maxProfit').value = appState.stopLoss.maxProfit;
    
    const settings = document.getElementById('stopLossSettings');
    settings.style.display = appState.stopLoss.enabled ? 'block' : 'none';
    
    updateStopLossPercentages();
    checkStopLossAlerts();
}

function updateStopLossPercentages() {
    const maxLoss = parseFloat(document.getElementById('maxLoss').value) || 0;
    const maxProfit = parseFloat(document.getElementById('maxProfit').value) || 0;
    
    const lossPercent = appState.initialBalance > 0 ? ((maxLoss / appState.initialBalance) * 100).toFixed(1) : 0;
    const profitPercent = appState.initialBalance > 0 ? ((maxProfit / appState.initialBalance) * 100).toFixed(1) : 0;
    
    document.getElementById('maxLossPercent').textContent = `${lossPercent}% da banca inicial`;
    document.getElementById('maxProfitPercent').textContent = `${profitPercent}% da banca inicial`;
}

function saveStopLoss() {
    const maxLoss = parseFloat(document.getElementById('maxLoss').value) || 0;
    const maxProfit = parseFloat(document.getElementById('maxProfit').value) || 0;
    
    if (maxLoss < 0 || maxProfit < 0) {
        showToast('Valores devem ser positivos!', 'error');
        return;
    }
    
    appState.stopLoss.maxLoss = maxLoss;
    appState.stopLoss.maxProfit = maxProfit;
    
    saveData();
    updateStopLossPercentages();
    checkStopLossAlerts();
    showToast('Stop Loss configurado!', 'success');
}

function checkStopLossAlerts() {
    const alertsDiv = document.getElementById('stopLossAlerts');
    if (!alertsDiv) return;
    
    alertsDiv.innerHTML = '';
    
    if (!appState.stopLoss.enabled) return;
    
    const currentProfit = appState.balance - appState.initialBalance;
    
    if (currentProfit <= -appState.stopLoss.maxLoss) {
        alertsDiv.innerHTML = `
            <div class="alert-box danger">
                ⚠️ LIMITE DE PERDA ATINGIDO!
            </div>
        `;
        showStopLossModal('STOP LOSS', currentProfit);
    } else if (currentProfit >= appState.stopLoss.maxProfit) {
        alertsDiv.innerHTML = `
            <div class="alert-box success">
                🎯 META DE LUCRO ATINGIDA!
            </div>
        `;
        showStopWinModal('STOP WIN', currentProfit);
    }
}

// Show Stop Loss Modal
function showStopLossModal(title, profit) {
    const existingModal = document.querySelector('.stop-modal');
    if (existingModal) return; // Don't show multiple times
    
    const modal = document.createElement('div');
    modal.className = 'stop-modal stop-loss-modal';
    modal.innerHTML = `
        <div class="stop-modal-content">
            <div class="stop-modal-icon">⚠️</div>
            <h2>${title} ATINGIDO!</h2>
            <p class="stop-modal-value">Prejuízo: R$ ${Math.abs(profit).toFixed(2)}</p>
            <p class="stop-modal-message">Recomendamos encerrar a sessão para proteger sua banca.</p>
            <button onclick="closeStopModal()" class="stop-modal-btn">Entendi</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Play alert sound
    playAlertSound('loss');
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (document.body.contains(modal)) {
            closeStopModal();
        }
    }, 10000);
}

// Show Stop Win Modal
function showStopWinModal(title, profit) {
    const existingModal = document.querySelector('.stop-modal');
    if (existingModal) return; // Don't show multiple times
    
    const modal = document.createElement('div');
    modal.className = 'stop-modal stop-win-modal';
    modal.innerHTML = `
        <div class="stop-modal-content">
            <div class="stop-modal-icon">🎯</div>
            <h2>${title} ATINGIDO!</h2>
            <p class="stop-modal-value">Lucro: R$ ${profit.toFixed(2)}</p>
            <p class="stop-modal-message">Parabéns! Você atingiu sua meta de lucro.</p>
            <button onclick="closeStopModal()" class="stop-modal-btn">Entendi</button>
        </div>
    `;
    document.body.appendChild(modal);
    
    // Play alert sound
    playAlertSound('win');
    
    // Auto-close after 10 seconds
    setTimeout(() => {
        if (document.body.contains(modal)) {
            closeStopModal();
        }
    }, 10000);
}

// Close Stop Modal
function closeStopModal() {
    const modal = document.querySelector('.stop-modal');
    if (modal) {
        modal.style.opacity = '0';
        setTimeout(() => modal.remove(), 300);
    }
}

// Play Alert Sound
function playAlertSound(type) {
    const audioContext = new (window.AudioContext || window.webkitAudioContext)();
    const oscillator = audioContext.createOscillator();
    const gainNode = audioContext.createGain();
    
    oscillator.connect(gainNode);
    gainNode.connect(audioContext.destination);
    
    if (type === 'loss') {
        // Descending tone for loss
        oscillator.frequency.setValueAtTime(600, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(300, audioContext.currentTime + 0.3);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.3);
    } else {
        // Ascending tone for win
        oscillator.frequency.setValueAtTime(400, audioContext.currentTime);
        oscillator.frequency.exponentialRampToValueAtTime(800, audioContext.currentTime + 0.2);
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);
    }
    
    oscillator.start(audioContext.currentTime);
    oscillator.stop(audioContext.currentTime + 0.3);
}

// 30-Day Plan Functions
function selectProgressionType(type) {
    appState.progressionType = type;
    
    // Update button styles
    const buttons = document.querySelectorAll('#planSection .quick-bet-btn');
    buttons.forEach(btn => btn.classList.remove('selected'));
    event.target.classList.add('selected');
    
    // Update label
    const label = document.getElementById('progressionValueLabel');
    if (type === 'fixed') {
        label.textContent = 'Aumento Diário (R$)';
        document.getElementById('progressionValue').step = '1';
    } else {
        label.textContent = 'Aumento Diário (%)';
        document.getElementById('progressionValue').step = '0.1';
    }
}

function generatePlan() {
    const baseAmount = parseFloat(document.getElementById('planBaseAmount').value) || 10;
    const progressionValue = parseFloat(document.getElementById('progressionValue').value) || 2;
    const roundValues = document.getElementById('roundPlanValues').checked;
    
    // Validação básica
    if (baseAmount <= 0) {
        showToast('Digite um valor base válido!', 'error');
        return;
    }
    
    // Aviso se não tiver apostas suficientes (mas gera mesmo assim)
    if (appState.bets.length < 5) {
        showToast('💡 Dica: Registre apostas para planos mais personalizados!', 'warning');
    }
    
    const plan = [];
    let amount = baseAmount;
    
    for (let day = 1; day <= 30; day++) {
        // Arredonda ou mantém decimais
        const dayAmount = roundValues ? Math.round(amount) : parseFloat(amount.toFixed(2));
        
        plan.push({
            day,
            amount: dayAmount
        });
        
        if (appState.progressionType === 'fixed') {
            amount += progressionValue;
        } else {
            amount *= (1 + (progressionValue / 100));
        }
    }
    
    // Calcular lucro total corretamente: diferença entre dia 30 e dia 1
    const totalProfit = plan[29].amount - plan[0].amount;
    
    // Show preview
    const preview = document.getElementById('planPreview');
    const daysList = document.getElementById('planDaysList');
    
    daysList.innerHTML = plan.slice(0, 7).map(item => `
        <div class="plan-day-card">
            <div style="display: flex; align-items: center; gap: 10px;">
                <div class="plan-day-number">${item.day}</div>
                <div>
                    <div style="font-weight: bold; color: var(--light-gold);">Dia ${item.day}</div>
                    <div style="font-size: 0.85em; color: var(--light-gold); opacity: 0.8;">Base</div>
                </div>
            </div>
            <div style="font-weight: bold; color: var(--primary-gold); font-size: 1.1em;">
                R$ ${roundValues ? item.amount : item.amount.toFixed(2)}
            </div>
        </div>
    `).join('');
    
    const day30Amount = roundValues ? plan[29].amount : plan[29].amount.toFixed(2);
    document.getElementById('day30Amount').textContent = `R$ ${day30Amount}`;
    
    // Calcular investimento total (soma de todos os dias)
    const totalInvestment = plan.reduce((sum, item) => sum + item.amount, 0);
    
    // Função para arredondar para valores de fichas (5, 10, 25, 50, 100, etc)
    function roundToChip(value) {
        const chips = [5, 10, 25, 50, 100, 250, 500, 1000];
        
        // Se valor menor que 5, retorna 5
        if (value < 5) return 5;
        
        // Encontra a ficha mais próxima
        for (let i = 0; i < chips.length - 1; i++) {
            if (value >= chips[i] && value < chips[i + 1]) {
                // Arredonda para a ficha mais próxima
                const diff1 = value - chips[i];
                const diff2 = chips[i + 1] - value;
                return diff1 <= diff2 ? chips[i] : chips[i + 1];
            }
        }
        
        // Se maior que 1000, arredonda para múltiplo de 100
        return Math.round(value / 100) * 100;
    }
    
    // Calcular recomendações de entrada (5% da banca)
    const recomendacaoEntrada = roundToChip(plan[0].amount * 0.05);
    const recomendacaoEmpate = recomendacaoEntrada <= 15 ? 0 : roundToChip(recomendacaoEntrada * 0.1);
    
    // Mostrar resumo com lucro total
    const summaryDiv = document.getElementById('planSummary');
    summaryDiv.innerHTML = `
        <div class="plan-row">
            <span style="color: var(--light-gold); font-weight: bold;">📊 Resumo do Plano</span>
        </div>
        <div class="plan-row">
            <span>Valor Inicial (Dia 1):</span>
            <span style="color: var(--primary-gold); font-weight: bold;">R$ ${roundValues ? plan[0].amount : plan[0].amount.toFixed(2)}</span>
        </div>
        <div class="plan-row">
            <span>Valor Final (Dia 30):</span>
            <span style="color: var(--primary-gold); font-weight: bold;">R$ ${day30Amount}</span>
        </div>
        <div class="plan-row" style="border-top: 2px solid var(--primary-gold); padding-top: 15px; margin-top: 10px;">
            <span style="font-size: 1.1em;"><strong>💰 Crescimento Projetado (Dia 30 - Dia 1):</strong></span>
            <span style="color: var(--success); font-weight: bold; font-size: 1.3em;">R$ ${roundValues ? Math.round(totalProfit) : totalProfit.toFixed(2)}</span>
        </div>
        <div style="border-top: 2px solid var(--blue); padding-top: 15px; margin-top: 15px;">
            <div class="plan-row">
                <span style="color: var(--blue); font-weight: bold; font-size: 1.1em;">🎯 Recomendação de Entradas (5% da Banca)</span>
            </div>
            <div class="plan-row" style="margin-top: 10px;">
                <span>💎 Entrada Principal (Player/Banker):</span>
                <span style="color: var(--primary-gold); font-weight: bold; font-size: 1.2em;">R$ ${recomendacaoEntrada}</span>
            </div>
            ${recomendacaoEmpate > 0 ? `
            <div class="plan-row">
                <span>🎲 Entrada Empate (TIE) - 10% da principal:</span>
                <span style="color: var(--warning); font-weight: bold; font-size: 1.2em;">R$ ${recomendacaoEmpate}</span>
            </div>
            ` : `
            <div class="plan-row">
                <span style="color: var(--warning);">🎲 Empate (TIE):</span>
                <span style="color: var(--danger); font-weight: bold;">Não recomendado (entrada ≤ R$ 15)</span>
            </div>
            `}
            <div style="margin-top: 10px; padding: 10px; background: rgba(59, 130, 246, 0.1); border-radius: 8px; border: 1px solid var(--blue);">
                <div style="color: var(--light-gold); font-size: 0.9em; line-height: 1.6;">
                    <strong>💡 Gestão Conservadora:</strong><br>
                    • Aposte <strong>R$ ${recomendacaoEntrada}</strong> em Player ou Banker<br>
                    ${recomendacaoEmpate > 0 ? 
                        `• Aposte <strong>R$ ${recomendacaoEmpate}</strong> no Empate (proteção)<br>
                        • Total por rodada: <strong>R$ ${recomendacaoEntrada + recomendacaoEmpate}</strong>` :
                        `• <strong>NÃO aposte</strong> no Empate (entrada muito baixa)<br>
                        • Total por rodada: <strong>R$ ${recomendacaoEntrada}</strong>`
                    }<br>
                    • Valores arredondados para fichas válidas
                </div>
            </div>
        </div>
    `;
    summaryDiv.style.display = 'block';
    
    preview.style.display = 'block';
    
    // Store plan for export
    window.currentPlan = plan;
    window.planTotalProfit = totalProfit;
    window.planRounded = roundValues;
    window.planRecomendacaoEntrada = recomendacaoEntrada;
    window.planRecomendacaoEmpate = recomendacaoEmpate;
    
    showToast('Plano gerado com sucesso! 📊', 'success');
}

function exportPlan() {
    if (!window.currentPlan) {
        showToast('Gere o plano primeiro!', 'error');
        return;
    }

    const plan = window.currentPlan;
    const totalProfit = window.planTotalProfit || 0;
    const rounded = window.planRounded || false;
    const recomendacaoEntrada = window.planRecomendacaoEntrada || 0;
    const recomendacaoEmpate = window.planRecomendacaoEmpate || 0;
    
    const today = new Date();
    const totalInvestment = plan.reduce((sum, item) => sum + item.amount, 0);
    
    // Cabeçalho
    let csv = '========================================\n';
    csv += '   REI DO BACBO - PLANO DE GESTÃO 30 DIAS\n';
    csv += '   Gestão Profissional de Banca\n';
    csv += `   Gerado em: ${today.toLocaleDateString('pt-BR')} às ${today.toLocaleTimeString('pt-BR')}\n`;
    csv += '========================================\n\n';
    
    // Tabela de Configuração
    csv += '┌─────────────────────────────────────────────────────────┐\n';
    csv += '│              CONFIGURAÇÃO DO PLANO                      │\n';
    csv += '├─────────────────────────────────────────────────────────┤\n';
    csv += `│ Tipo de Progressão:    ${appState.progressionType === 'fixed' ? 'Fixa (R$)        ' : 'Percentual (%)   '}│\n`;
    csv += `│ Valor Base Inicial:    R$ ${String(rounded ? plan[0].amount : plan[0].amount.toFixed(2)).padEnd(21)}│\n`;
    csv += `│ Incremento:            ${String(document.getElementById('progressionValue').value + (appState.progressionType === 'fixed' ? ' R$' : '%')).padEnd(29)}│\n`;
    csv += `│ Valores Arredondados:  ${rounded ? 'Sim                 ' : 'Não                 '}│\n`;
    csv += '└─────────────────────────────────────────────────────────┘\n\n';
    
    // Tabela de Resumo Financeiro
    csv += '┌─────────────────────────────────────────────────────────┐\n';
    csv += '│              RESUMO FINANCEIRO                          │\n';
    csv += '├─────────────────────────────────────────────────────────┤\n';
    csv += `│ Valor Inicial (Dia 1):       R$ ${String(rounded ? plan[0].amount : plan[0].amount.toFixed(2)).padEnd(17)}│\n`;
    csv += `│ Valor Final (Dia 30):        R$ ${String(rounded ? plan[29].amount : plan[29].amount.toFixed(2)).padEnd(17)}│\n`;
    csv += `│ Crescimento Projetado:       R$ ${String(rounded ? Math.round(totalProfit) : totalProfit.toFixed(2)).padEnd(17)}│\n`;
    csv += `│ ROI Projetado:               ${String(((totalProfit / plan[0].amount) * 100).toFixed(1) + '%').padEnd(25)}│\n`;
    csv += '└─────────────────────────────────────────────────────────┘\n\n';
    
    // Tabela de Recomendação de Entradas
    csv += '┌─────────────────────────────────────────────────────────┐\n';
    csv += '│       RECOMENDAÇÃO DE ENTRADAS (5% da Banca)           │\n';
    csv += '├─────────────────────────────────────────────────────────┤\n';
    csv += `│ 💎 Entrada Principal:        R$ ${String(recomendacaoEntrada).padEnd(17)}│\n`;
    csv += `│    (Player ou Banker)                                   │\n`;
    if (recomendacaoEmpate > 0) {
        csv += `│ 🎲 Entrada Empate (TIE):     R$ ${String(recomendacaoEmpate).padEnd(17)}│\n`;
        csv += `│    (10% da entrada principal)                           │\n`;
        csv += `│ ─────────────────────────────────────────────────────── │\n`;
        csv += `│ 💰 Total por Rodada:         R$ ${String(recomendacaoEntrada + recomendacaoEmpate).padEnd(17)}│\n`;
    } else {
        csv += `│ 🎲 Entrada Empate (TIE):     NÃO RECOMENDADO           │\n`;
        csv += `│    (Entrada ≤ R$ 15)                                    │\n`;
        csv += `│ ─────────────────────────────────────────────────────── │\n`;
        csv += `│ 💰 Total por Rodada:         R$ ${String(recomendacaoEntrada).padEnd(17)}│\n`;
    }
    csv += '└─────────────────────────────────────────────────────────┘\n\n';
    
    // Tabela de Progressão Diária
    csv += '┌──────────────────────────────────────────────────────────────────┐\n';
    csv += '│              PROGRESSÃO DIÁRIA - 30 DIAS                         │\n';
    csv += '├──────┬─────────────┬──────────────┬──────────────┬──────────────┤\n';
    csv += '│ Dia  │    Data     │  Valor Base  │ Crescimento  │  % Inicial   │\n';
    csv += '├──────┼─────────────┼──────────────┼──────────────┼──────────────┤\n';
    
    plan.forEach((item, index) => {
        const date = new Date(today);
        date.setDate(today.getDate() + item.day);
        const formattedDate = date.toLocaleDateString('pt-BR');
        const value = rounded ? item.amount : item.amount.toFixed(2);
        const crescimento = rounded ? Math.round(item.amount - plan[0].amount) : (item.amount - plan[0].amount).toFixed(2);
        const percentual = (((item.amount - plan[0].amount) / plan[0].amount) * 100).toFixed(1);
        
        csv += `│  ${String(item.day).padStart(2)}  │ ${formattedDate} │  R$ ${String(value).padStart(8)} │  R$ ${String(crescimento).padStart(8)} │   ${String(percentual).padStart(6)}%  │\n`;
        
        // Separador a cada 5 dias (exceto no último)
        if ((index + 1) % 5 === 0 && index < plan.length - 1) {
            csv += '├──────┼─────────────┼──────────────┼──────────────┼──────────────┤\n';
        }
    });
    
    csv += '└──────┴─────────────┴──────────────┴──────────────┴──────────────┘\n\n';
    
    // Rodapé
    csv += '========================================\n';
    csv += '   INSTRUÇÕES DE USO:\n';
    csv += '   • Siga o valor base de cada dia\n';
    if (recomendacaoEmpate > 0) {
        csv += `   • Aposte R$ ${recomendacaoEntrada} no Player/Banker\n`;
        csv += `   • Aposte R$ ${recomendacaoEmpate} no Empate\n`;
    } else {
        csv += `   • Aposte R$ ${recomendacaoEntrada} no Player/Banker\n`;
        csv += '   • NÃO aposte no Empate (entrada baixa)\n';
    }
    csv += '   • Respeite o Stop Loss/Gain\n';
    csv += '   • Mantenha disciplina e controle\n';
    csv += '========================================\n';

    downloadCSV(csv, `rei_do_bacbo_plano_30dias_${new Date().toISOString().split('T')[0]}.csv`);
    showToast('Plano exportado com sucesso! 📥', 'success');
}

// Confirm Reset
function confirmReset() {
    const modal = document.getElementById('modal');
    document.getElementById('modalTitle').textContent = '⚠️ ATENÇÃO ⚠️';
    document.getElementById('modalMessage').innerHTML = 'Tem certeza que deseja <strong>RESETAR A BANCA</strong>?<br><br>Todas as apostas serão excluídas e a banca será resetada ao valor inicial.<br><br>Esta ação é <strong>IRREVERSÍVEL</strong>!';
    
    const confirmBtn = document.getElementById('modalConfirm');
    confirmBtn.onclick = () => {
        appState.balance = appState.initialBalance;
        appState.bets = [];
        saveData();
        updateUI();
        closeModal();
        toggleSettings();
        showToast('Banca resetada com sucesso!', 'success');
    };

    modal.classList.add('active');
}

// Close Modal
function closeModal() {
    document.getElementById('modal').classList.remove('active');
}

// Show Tab
function showTab(tabName) {
    // Update tab buttons
    document.querySelectorAll('.nav-tab').forEach(tab => tab.classList.remove('active'));
    event.target.classList.add('active');
    
    // Update sections
    document.querySelectorAll('.content-section').forEach(section => section.classList.remove('active'));
    document.getElementById(tabName + 'Section').classList.add('active');

    // Update chart if stats tab
    if (tabName === 'stats') {
        setTimeout(() => updateChart(), 100);
    }
}

// Show Toast
function showToast(message, type = 'success') {
    const container = document.getElementById('toastContainer');
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.textContent = message;
    
    container.appendChild(toast);
    
    setTimeout(() => {
        toast.remove();
    }, 3000);
}

// Download CSV
function downloadCSV(content, filename) {
    const blob = new Blob([content], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

// Save Data
function saveData() {
    localStorage.setItem('reiBacboData', JSON.stringify(appState));
}

// Load Data
function loadData() {
    const saved = localStorage.getItem('reiBacboData');
    if (saved) {
        const data = JSON.parse(saved);
        appState = { ...appState, ...data };
    }
}

// Update bet amount input listener
document.addEventListener('DOMContentLoaded', () => {
    const betAmountInput = document.getElementById('betAmount');
    if (betAmountInput) {
        betAmountInput.addEventListener('input', () => {
            const amount = parseFloat(betAmountInput.value);
            if (amount > 0 && amount <= appState.balance && appState.currentBetType) {
                document.getElementById('resultButtons').style.display = 'block';
            } else {
                document.getElementById('resultButtons').style.display = 'none';
            }
        });
    }
    
    // Update stop loss percentages on input
    const maxLossInput = document.getElementById('maxLoss');
    const maxProfitInput = document.getElementById('maxProfit');
    
    if (maxLossInput) {
        maxLossInput.addEventListener('input', updateStopLossPercentages);
    }
    if (maxProfitInput) {
        maxProfitInput.addEventListener('input', updateStopLossPercentages);
    }
});

// Keyboard shortcuts
document.addEventListener('keydown', (e) => {
    // Enter para confirmar aposta (se tipo selecionado e valor válido)
    if (e.key === 'Enter' && appState.currentBetType && parseFloat(document.getElementById('betAmount').value) > 0) {
        const resultButtons = document.getElementById('resultButtons');
        if (resultButtons && resultButtons.style.display !== 'none') {
            e.preventDefault();
        }
    }
    
    // ESC para limpar formulário
    if (e.key === 'Escape') {
        resetBetForm();
    }
});

// Initialize on load
window.addEventListener('load', initApp);

// Prevent zoom on double tap
let lastTouchEnd = 0;
document.addEventListener('touchend', (e) => {
    const now = Date.now();
    if (now - lastTouchEnd <= 300) {
        e.preventDefault();
    }
    lastTouchEnd = now;
}, false);
