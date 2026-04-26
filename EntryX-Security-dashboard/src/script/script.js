/**
 * EntryX Security Management - Core Logic
 * Handles View switching, Registration, Simulation, and Data Rendering
 */

// --- Initial State ---
// --- Application Core Functions ---

/**
 * Switches between different application views (Dashboard, Visitors, etc.)
 * @param {string} viewId - The ID of the view to display
 */
function switchView(viewId) {
    // Hide all views
    document.querySelectorAll('[id^="view-"]').forEach(v => v.classList.add('view-hidden'));
    
    // Show target view with animation
    const target = document.getElementById(`view-${viewId}`);
    target.classList.remove('view-hidden');
    target.classList.add('animate-view');
    
    // Update Sidebar Navigation States
    document.querySelectorAll('.nav-item').forEach(btn => {
        btn.classList.remove('nav-item-active');
        btn.classList.add('nav-item-inactive');
        const icon = btn.querySelector('i');
        if (icon) icon.classList.remove('text-blue-400');
    });
    
    const activeBtn = document.getElementById(`nav-${viewId}`);
    activeBtn.classList.add('nav-item-active');
    activeBtn.classList.remove('nav-item-inactive');
    const activeIcon = activeBtn.querySelector('i');
    if (activeIcon) activeIcon.classList.add('text-blue-400');

    renderCurrentView();
}

/**
 * Controls the visibility of the Visitor Registration Modal
 * @param {boolean} show - True to show, False to hide
 */
function toggleModal(show) {
    const modal = document.getElementById('reg-modal');
    const inner = modal.querySelector('div');
    if (show) {
        modal.classList.remove('pointer-events-none', 'opacity-0');
        modal.classList.add('opacity-100');
        inner.classList.remove('scale-95');
        inner.classList.add('scale-100');
    } else {
        modal.classList.add('opacity-0', 'pointer-events-none');
        modal.classList.remove('opacity-100');
        inner.classList.add('scale-95');
        inner.classList.remove('scale-100');
    }
}

/**
 * Handles the submission of a new visitor registration
 */
function handleRegister() {
    const name = document.getElementById('v-name').value;
    const host = document.getElementById('v-host').value;
    const rfid = document.getElementById('v-rfid').value;
    const purpose = document.getElementById('v-purpose').value;

    if (!name || !rfid) return alert('Name and RFID are required');

    const newVisitor = {
        id: Date.now().toString(),
        name, host, rfid, purpose,
        entry: new Date().toISOString(),
        status: 'active'
    };

    visitors.unshift(newVisitor);
    
    // Auto-log the entry at registration
    logs.unshift({
        id: 'L'+Date.now(),
        rfid,
        name,
        location: 'Main Entrance',
        type: 'entry',
        time: new Date().toISOString()
    });

    toggleModal(false);
    renderCurrentView();
    
    // Reset Form
    ['v-name', 'v-host', 'v-rfid', 'v-purpose'].forEach(id => document.getElementById(id).value = '');
}

/**
 * Pushes a new security alert to the system
 */
function pushAlert(location, msg, severity = 'high') {
    alerts.unshift({
        id: 'A'+Date.now(),
        location, msg, severity,
        resolved: false,
        time: new Date().toISOString()
    });
    renderCurrentView();
}

/**
 * Simulates a card scan at the currently selected reader location
 */
function handleSimScan() {
    const input = document.getElementById('sim-input');
    const rfid = input.value.trim();
    if(!rfid) return;

    const visitor = visitors.find(v => v.rfid === rfid && v.status === 'active');
    const feedback = document.getElementById('sim-feedback');
    feedback.classList.remove('hidden');

    if(visitor) {
        logs.unshift({
            id: 'L'+Date.now(),
            rfid,
            name: visitor.name,
            location: selectedSimLoc,
            type: Math.random() > 0.5 ? 'exit' : 'entry',
            time: new Date().toISOString()
        });
        feedback.className = "p-4 bg-emerald-50 text-emerald-700 rounded-2xl border border-emerald-100 font-bold text-sm block";
        feedback.innerHTML = `<i data-lucide="check-circle" class="w-4 h-4 inline mr-2 text-emerald-600"></i> Access Authorized: ${visitor.name}`;
    } else {
        logs.unshift({
            id: 'L'+Date.now(),
            rfid,
            name: 'DENIED',
            location: selectedSimLoc,
            type: 'denied',
            time: new Date().toISOString()
        });
        pushAlert(selectedSimLoc, `Intrusion detection: Unknown RFID Access Attempt (${rfid})`);
        feedback.className = "p-4 bg-rose-50 text-rose-700 rounded-2xl border border-rose-100 font-bold text-sm block";
        feedback.innerHTML = `<i data-lucide="shield-x" class="w-4 h-4 inline mr-2 text-rose-600"></i> INTRUSION DETECTED: UNRECOGNIZED CARD`;
    }

    input.value = '';
    lucide.createIcons();
    renderCurrentView();
    setTimeout(() => {
        feedback.classList.remove('block');
        feedback.classList.add('hidden');
    }, 3000);
}

// --- Dynamic Rendering Logic ---

function renderCurrentView() {
    updateStats();
    renderDashLogs();
    renderVisitorList();
    renderFullLogs();
    renderAlerts();
    renderSimControls();
    lucide.createIcons();
}

function updateStats() {
    document.getElementById('stat-active').innerText = visitors.filter(v => v.status === 'active').length;
    document.getElementById('stat-entries').innerText = logs.filter(l => l.type === 'entry').length;
    const activeAlertsCount = alerts.filter(a => !a.resolved).length;
    document.getElementById('stat-alerts').innerText = activeAlertsCount;
    
    const badge = document.getElementById('alert-badge');
    if(activeAlertsCount > 0) {
        badge.innerText = activeAlertsCount;
        badge.classList.remove('hidden');
    } else {
        badge.classList.add('hidden');
    }
}

function renderDashLogs() {
    const container = document.getElementById('dashboard-logs');
    if (!container) return;
    container.innerHTML = logs.slice(0, 5).map(l => `
        <tr class="hover:bg-slate-50 transition-colors">
            <td class="px-8 py-4 font-mono text-xs font-bold text-slate-500">${l.rfid}</td>
            <td class="px-8 py-4 font-bold text-sm">${l.name}</td>
            <td class="px-8 py-4 text-xs text-slate-500 font-medium">${l.location}</td>
            <td class="px-8 py-4">
                <span class="px-2 py-1 rounded text-[10px] font-black uppercase ${l.type === 'entry' ? 'bg-emerald-100 text-emerald-700' : l.type === 'exit' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}">${l.type}</span>
            </td>
            <td class="px-8 py-4 text-[10px] font-bold text-slate-400">${new Date(l.time).toLocaleTimeString()}</td>
        </tr>
    `).join('');
}

function renderVisitorList() {
    const container = document.getElementById('visitor-list');
    if (!container) return;
    container.innerHTML = visitors.map(v => `
        <div class="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm flex items-center gap-6 group hover:border-blue-300 transition-all">
            <div class="w-16 h-16 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300">
                <i data-lucide="user" class="w-8 h-8"></i>
            </div>
            <div class="flex-1">
                <div class="flex items-center gap-3 mb-2">
                    <h4 class="font-bold text-lg">${v.name}</h4>
                    <span class="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest ${v.status === 'active' ? 'bg-emerald-100 text-emerald-700' : 'bg-slate-100 text-slate-500'}">${v.status}</span>
                </div>
                <div class="grid grid-cols-2 lg:grid-cols-4 gap-6 text-sm">
                    <div><p class="text-[10px] font-black text-slate-400 uppercase mb-0.5">Host Dept</p><p class="font-bold text-slate-700">${v.host}</p></div>
                    <div><p class="text-[10px] font-black text-slate-400 uppercase mb-0.5">Assigned RFID</p><p class="font-mono text-xs font-bold bg-slate-50 px-2 py-0.5 rounded">${v.rfid}</p></div>
                    <div><p class="text-[10px] font-black text-slate-400 uppercase mb-0.5">Access Logged</p><p class="font-medium text-slate-500">${new Date(v.entry).toLocaleString()}</p></div>
                    <div><p class="text-[10px] font-black text-slate-400 uppercase mb-0.5">Scope</p><p class="font-bold text-blue-600 truncate">${v.purpose}</p></div>
                </div>
            </div>
        </div>
    `).join('');
}

function renderFullLogs() {
    const container = document.getElementById('full-log-list');
    if (!container) return;
    container.innerHTML = logs.map(l => `
        <div class="px-8 py-5 grid grid-cols-5 items-center hover:bg-slate-50 transition-colors">
            <span class="font-mono text-xs font-bold text-slate-500 text-left">${l.rfid}</span>
            <span class="font-bold text-sm text-slate-900">${l.name}</span>
            <span class="text-sm text-slate-600 font-medium">${l.location}</span>
            <div><span class="px-2 py-1 rounded text-[10px] font-black uppercase ${l.type === 'entry' ? 'bg-emerald-100 text-emerald-700' : l.type === 'exit' ? 'bg-blue-100 text-blue-700' : 'bg-rose-100 text-rose-700'}">${l.type}</span></div>
            <span class="text-xs font-bold text-slate-400 text-right">${new Date(l.time).toLocaleTimeString()}, ${new Date(l.time).toLocaleDateString()}</span>
        </div>
    `).join('');
}

function renderAlerts() {
    const container = document.getElementById('alert-list');
    if (!container) return;
    if(alerts.length === 0) {
        container.innerHTML = '<div class="p-12 text-center text-slate-400 font-bold border-2 border-dashed border-slate-100 rounded-3xl">No historical alerts recorded in cycle.</div>';
        return;
    }
    container.innerHTML = alerts.map(a => `
        <div class="p-6 rounded-3xl border-l-[8px] bg-white shadow-sm flex items-center gap-6 ${a.resolved ? 'border-slate-300 opacity-50' : 'border-rose-500 bg-rose-50/10'}">
            <div class="w-12 h-12 rounded-full ${a.severity === 'high' ? 'bg-rose-100 text-rose-600' : 'bg-blue-100 text-blue-600'} flex items-center justify-center shrink-0">
                <i data-lucide="alert-circle" class="w-6 h-6"></i>
            </div>
            <div class="flex-1 text-left">
                <div class="flex items-center gap-3 mb-1">
                    <span class="px-2 py-0.5 rounded font-black text-[10px] uppercase ${a.severity === 'high' ? 'bg-rose-600 text-white' : 'bg-blue-600 text-white'}">${a.severity} Criticality</span>
                    <span class="text-[10px] font-mono font-bold text-slate-400">${new Date(a.time).toLocaleTimeString()}</span>
                </div>
                <h4 class="font-extrabold text-slate-900">${a.msg}</h4>
                <div class="flex items-center gap-2 text-slate-500 text-xs mt-1">
                    <i data-lucide="map-pin" class="w-3.5 h-3.5"></i>
                    <span class="font-bold">${a.location}</span>
                </div>
            </div>
            ${!a.resolved ? `<button onclick="resolveAlert('${a.id}')" class="bg-slate-900 text-white px-5 py-2.5 rounded-xl font-bold text-sm hover:bg-slate-800 transition-all">Resolve Case</button>` : `<span class="text-emerald-600 font-bold text-xs"><i data-lucide="check" class="w-4 h-4 inline mr-1"></i>Investigated</span>`}
        </div>
    `).join('');
}

function resolveAlert(id) {
    const a = alerts.find(x => x.id === id);
    if(a) a.resolved = true;
    renderCurrentView();
}

function resolveAllAlerts() {
    alerts.forEach(a => a.resolved = true);
    renderCurrentView();
}

function renderSimControls() {
    const locContainer = document.getElementById('sim-locations');
    if (!locContainer) return;
    locContainer.innerHTML = locations.map(l => `
        <button onclick="selectedSimLoc='${l}'; renderSimControls()" class="p-4 rounded-2xl flex items-center gap-3 transition-all text-left border-2 ${selectedSimLoc === l ? 'bg-blue-50 border-blue-500 text-blue-700 shadow-lg scale-[1.02]' : 'bg-slate-50 border-slate-50 text-slate-500 hover:border-slate-200'}">
            <i data-lucide="map-pin" class="w-4 h-4"></i>
            <span class="font-extrabold text-sm">${l}</span>
        </button>
    `).join('');

    const profContainer = document.getElementById('sim-profiles');
    if (!profContainer) return;
    profContainer.innerHTML = visitors.slice(0, 3).map(v => `
        <button onclick="document.getElementById('sim-input').value='${v.rfid}'; handleSimScan()" class="w-full p-4 bg-white/5 hover:bg-white/10 rounded-2xl flex items-center justify-between group transition-all text-left">
            <div>
                <p class="font-bold text-sm text-white">${v.name}</p>
                <p class="text-[10px] text-slate-400 font-mono">${v.rfid}</p>
            </div>
            <i data-lucide="chevron-right" class="w-4 h-4 text-slate-500 group-hover:text-blue-400 transition-all"></i>
        </button>
    `).join('');

    lucide.createIcons();
}

// --- Initialization ---

document.addEventListener('DOMContentLoaded', () => {
    // Start Ticking Clock
    setInterval(() => {
        const now = new Date();
        const dateEl = document.getElementById('date-display');
        const timeEl = document.getElementById('time-display');
        if (dateEl) dateEl.innerText = now.toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' });
        if (timeEl) timeEl.innerText = now.toLocaleTimeString('en-US', { hour12: false });
    }, 1000);

    // Initial Render
    renderCurrentView();
});

