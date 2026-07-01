const display    = document.getElementById('time-display');
const statusLabel= document.getElementById('status-label');
const startBtn   = document.getElementById('startBtn');
const resetBtn   = document.getElementById('resetBtn');
const lapBtn     = document.getElementById('lapBtn');
const lapsList   = document.getElementById('laps-list');
const lapCount   = document.getElementById('lap-count');
const ring       = document.getElementById('ring-progress');
const startIcon  = document.getElementById('start-icon');
const startLabel = document.getElementById('start-label');

const RING_CIRCUM = 2 * Math.PI * 120; // ~753.98
const RING_CYCLE  = 60000; // ring completes one full rotation per 60s

let startTime = 0, elapsed = 0, intervalId = null;
let running = false;
let lapNum = 0, lapTimes = [], lastLapElapsed = 0;
let bestLap = null, worstLap = null;

function formatTime(ms) {
    const h   = Math.floor(ms / 3600000);
    const m   = Math.floor((ms % 3600000) / 60000);
    const s   = Math.floor((ms % 60000) / 1000);
    const cs  = Math.floor((ms % 1000) / 10);
    const pad = n => String(n).padStart(2, '0');
    return `${pad(h)}:${pad(m)}:${pad(s)}<span class="ms">.${pad(cs)}</span>`;
}

function updateRing(ms) {
    const progress = (ms % RING_CYCLE) / RING_CYCLE;
    const offset   = RING_CIRCUM - progress * RING_CIRCUM;
    ring.style.strokeDashoffset = offset;
}

function tick() {
    elapsed = Date.now() - startTime;
    display.innerHTML = formatTime(elapsed);
    updateRing(elapsed);
}

startBtn.addEventListener('click', () => {
    if (!running) {
        // Start or resume
        startTime = Date.now() - elapsed;
        intervalId = setInterval(tick, 30);
        running = true;
        startIcon.textContent  = '⏸';
        startLabel.textContent = 'Pause';
        statusLabel.textContent = 'Running';
        statusLabel.className = 'running';
        display.classList.add('running');
        lapBtn.disabled = false;
    } else {
        // Pause
        clearInterval(intervalId);
        running = false;
        startIcon.textContent  = '▶';
        startLabel.textContent = 'Resume';
        statusLabel.textContent = 'Paused';
        statusLabel.className = 'paused';
        display.classList.remove('running');
    }
});

resetBtn.addEventListener('click', () => {
    clearInterval(intervalId);
    running = false;
    elapsed = 0;
    startTime = 0;
    lapNum = 0; lapTimes = []; lastLapElapsed = 0;
    bestLap = null; worstLap = null;

    display.innerHTML = '00:00:00<span class="ms">.00</span>';
    display.classList.remove('running');
    statusLabel.textContent = 'Ready';
    statusLabel.className   = '';
    startIcon.textContent   = '▶';
    startLabel.textContent  = 'Start';
    ring.style.strokeDashoffset = RING_CIRCUM;
    lapBtn.disabled = true;
    lapsList.innerHTML = '<li class="no-laps">No laps recorded yet.</li>';
    lapCount.textContent = '0 laps';
});

lapBtn.addEventListener('click', () => {
    if (!running) return;
    const lapElapsed = elapsed - lastLapElapsed;
    lastLapElapsed = elapsed;
    lapNum++;
    lapTimes.push(lapElapsed);

    // Track best & worst
    if (bestLap === null || lapElapsed < lapTimes[bestLap]) bestLap = lapNum - 1;
    if (worstLap === null || lapElapsed > lapTimes[worstLap]) worstLap = lapNum - 1;

    renderLaps();
});

function renderLaps() {
    lapsList.innerHTML = '';
    lapCount.textContent = `${lapTimes.length} lap${lapTimes.length !== 1 ? 's' : ''}`;

    const reversed = [...lapTimes].map((t, i) => ({ t, i })).reverse();

    reversed.forEach(({ t, i }) => {
        const li = document.createElement('li');
        li.className = 'lap-item';

        const isBest  = i === bestLap;
        const isWorst = i === worstLap && lapTimes.length > 1;
        if (isBest)  li.classList.add('best');
        if (isWorst) li.classList.add('worst');

        const delta = i > 0 ? t - lapTimes[i - 1] : null;
        const deltaStr = delta !== null
            ? `${delta >= 0 ? '+' : ''}${formatPlain(Math.abs(delta))}`
            : '—';

        const badge = (isBest || isWorst)
            ? `<span class="lap-badge">${isBest ? 'Best' : 'Worst'}</span>`
            : '';

        li.innerHTML = `
            <span class="lap-num">LAP ${i + 1}</span>
            <span class="lap-time">${formatPlain(t)}</span>
            <span class="lap-delta">${deltaStr}</span>
            ${badge}
        `;
        lapsList.appendChild(li);
    });
}

function formatPlain(ms) {
    const m  = Math.floor(ms / 60000);
    const s  = Math.floor((ms % 60000) / 1000);
    const cs = Math.floor((ms % 1000) / 10);
    return `${String(m).padStart(2,'0')}:${String(s).padStart(2,'0')}.${String(cs).padStart(2,'0')}`;
}
