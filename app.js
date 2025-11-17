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
    } else if (currentProfit >= appState.stopLoss.maxProfit) {
        alertsDiv.innerHTML = `
            <div class="alert-box success">
                🎯 META DE LUCRO ATINGIDA!
            </div>
        `;
    }
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
    let totalProfit = 0;
    
    for (let day = 1; day <= 30; day++) {
        // Arredonda ou mantém decimais
        const dayAmount = roundValues ? Math.round(amount) : parseFloat(amount.toFixed(2));
        
        plan.push({
            day,
            amount: dayAmount
        });
        
        totalProfit += dayAmount;
        
        if (appState.progressionType === 'fixed') {
            amount += progressionValue;
        } else {
            amount *= (1 + (progressionValue / 100));
        }
    }
    
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
            <span style="font-size: 1.1em;"><strong>💰 Lucro Total Projetado (30 dias):</strong></span>
            <span style="color: var(--success); font-weight: bold; font-size: 1.3em;">R$ ${roundValues ? Math.round(totalProfit) : totalProfit.toFixed(2)}</span>
        </div>
    `;
    summaryDiv.style.display = 'block';
    
    preview.style.display = 'block';
    
    // Store plan for export
    window.currentPlan = plan;
    window.planTotalProfit = totalProfit;
    window.planRounded = roundValues;
    
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
    
    let csv = 'REI DO BACBO - PLANO DE GESTÃO 30 DIAS\n\n';
    csv += 'Dia,Data,Valor Base (R$)\n';

    const today = new Date();
    
    plan.forEach(item => {
        const date = new Date(today);
        date.setDate(today.getDate() + item.day);
        const formattedDate = date.toLocaleDateString('pt-BR');
        const value = rounded ? item.amount : item.amount.toFixed(2);
        
        csv += `${item.day},${formattedDate},R$ ${value}\n`;
    });

    csv += '\n';
    csv += '\nRESUMO\n';
    csv += `Valor Inicial (Dia 1),R$ ${rounded ? plan[0].amount : plan[0].amount.toFixed(2)}\n`;
    csv += `Valor Final (Dia 30),R$ ${rounded ? plan[29].amount : plan[29].amount.toFixed(2)}\n`;
    csv += `LUCRO TOTAL PROJETADO (30 DIAS),R$ ${rounded ? Math.round(totalProfit) : totalProfit.toFixed(2)}\n`;
    csv += `ROI Projetado,${((totalProfit / plan[0].amount) * 100).toFixed(1)}%\n`;
    
    csv += '\nCONFIGURAÇÃO\n';
    csv += `Tipo de Progressão,${appState.progressionType === 'fixed' ? 'Fixa (R$)' : 'Percentual (%)'}\n`;
    csv += `Valor Base Inicial,R$ ${document.getElementById('planBaseAmount').value}\n`;
    csv += `Incremento,${document.getElementById('progressionValue').value}${appState.progressionType === 'fixed' ? ' R$' : '%'}\n`;
    csv += `Valores Arredondados,${rounded ? 'Sim' : 'Não'}\n`;

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
