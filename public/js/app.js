// public/js/app.js
const API_URL = '/api';

// Loading Control
const showLoading = () => document.getElementById('loadingOverlay').classList.remove('hidden');
const hideLoading = () => document.getElementById('loadingOverlay').classList.add('hidden');

// Modal Control
const showModal = (title, message, type = 'error') => {
    document.getElementById('modalTitle').innerText = title;
    document.getElementById('modalTitle').className = `text-xl font-bold mb-2 ${type === 'error' ? 'text-red-400' : 'text-emerald-400'}`;
    document.getElementById('modalMessage').innerText = message;
    document.getElementById('modalOverlay').classList.remove('hidden');
};
const hideModal = () => document.getElementById('modalOverlay').classList.add('hidden');

// Mengambil state secara sinkronus untuk menjamin UI langsung terupdate
async function fetchState() {
    try {
        const res = await fetch(`${API_URL}/state`);
        const state = await res.json();
        if(state && state.frames) updateUI(state);
    } catch (error) {
        console.error("Gagal memuat data dari server.", error);
    }
}

async function setupSystem() {
    showLoading();
    const total_ram = document.getElementById('total_ram').value;
    const page_size = document.getElementById('page_size').value;
    try {
        const res = await fetch(`${API_URL}/setup`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ total_ram, page_size }) 
        });
        const data = await res.json();
        if(data.success) {
            await fetchState(); 
            showModal('Sistem Siap', data.state.activity_logs[0].message, 'success');
        }
    } catch (error) {
        showModal('Koneksi Error', 'Gagal memformat memori. Periksa koneksi internet.', 'error');
    } finally { 
        hideLoading(); 
    }
}

async function allocateProcess() {
    const process_name = document.getElementById('process_name').value.toUpperCase();
    const size = document.getElementById('process_size').value;
    if(!process_name || !size) return showModal('Input Tidak Valid', 'Silakan isi Nama Proses dan Memory Required.', 'error');
    
    showLoading();
    try {
        const res = await fetch(`${API_URL}/allocate`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ process_name, size }) 
        });
        const data = await res.json();
        
        await fetchState(); 
        
        if(!data.success) showModal('Alokasi Ditolak', data.message, 'error');
    } catch (error) {
        showModal('Koneksi Error', 'Terputus dari server saat mengalokasikan proses.', 'error');
    } finally { 
        hideLoading(); 
    }
}

async function deallocateProcess() {
    const process_name = document.getElementById('process_name').value.toUpperCase();
    if(!process_name) return showModal('Input Tidak Valid', 'Masukkan nama proses yang ingin dihentikan.', 'error');

    showLoading();
    try {
        const res = await fetch(`${API_URL}/deallocate`, { 
            method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ process_name }) 
        });
        const data = await res.json();
        
        await fetchState(); 
        
        if(!data.success) {
            showModal('Proses Tidak Ditemukan', data.message, 'error');
        } else {
            document.getElementById('process_name').value = '';
            document.getElementById('process_size').value = '';
        }
    } catch (error) {
        showModal('Koneksi Error', 'Terputus dari server saat mencoba Kill Process.', 'error');
    } finally { 
        hideLoading(); 
    }
}

function updateUI(state) {
    document.getElementById('stat-faults').innerText = state.page_faults || 0;
    const freeFrames = state.frames.filter(f => f.is_free).length;
    document.getElementById('stat-ram').innerText = `${freeFrames * state.page_size} KB`;

    const mapContainer = document.getElementById('memoryMap');
    const tableContainer = document.getElementById('pageTable');
    mapContainer.innerHTML = ''; tableContainer.innerHTML = '';
    
    state.frames.forEach(frame => {
        const isFree = frame.is_free;
        const div = document.createElement('div');
        
        // PEWARNAAN MATANG: 
        // Frame kosong memiliki latar abu-abu gelap dengan teks abu-abu terang yang sangat jelas.
        // Frame terisi berwarna biru solid dengan teks putih.
        const freeStyle = 'bg-[#27272a] border-[#52525b] text-[#d4d4d8]'; 
        const usedStyle = 'bg-blue-600 border-blue-500 text-white shadow-md';
        
        div.className = `p-5 h-32 flex flex-col justify-between rounded border-2 transition-all duration-300 ${isFree ? freeStyle : usedStyle}`;
        
        div.innerHTML = `
            <div class="flex justify-between items-start w-full">
                <span class="text-sm font-mono font-bold ${isFree ? 'text-[#a1a1aa]' : 'text-blue-200'}">F${frame.frame_index}</span>
            </div>
            <div class="text-xl font-bold tracking-wide truncate mt-3 ${isFree ? 'text-[#a1a1aa]' : 'text-white'}">
                ${isFree ? 'NULL' : frame.process_name}
            </div>
        `;
        mapContainer.appendChild(div);

        if(!isFree) {
            const tr = document.createElement('tr');
            // Garis tabel menggunakan border-b tegas dengan warna `#3f3f46` (abu-abu terang)
            tr.className = "hover:bg-[#27272a] transition-colors border-b border-[#3f3f46]";
            tr.innerHTML = `
                <td class="py-4 px-6 text-white font-semibold">${frame.process_name}</td>
                <td class="py-4 px-6 text-[#a1a1aa]">terpetakan ke</td>
                <td class="py-4 px-6 text-right text-emerald-400 font-bold">F${frame.frame_index}</td>
            `;
            tableContainer.appendChild(tr);
        }
    });

    const logContainer = document.getElementById('activityLog');
    logContainer.innerHTML = '';
    [...(state.activity_logs || [])].reverse().forEach(log => {
        let actionColor = 'text-white';
        if(log.status === 'error') actionColor = 'text-red-400';
        else if(log.action === 'KILL_PROC') actionColor = 'text-amber-400';
        else if(log.action === 'FORMAT_RAM') actionColor = 'text-[#a1a1aa]';

        const div = document.createElement('div');
        div.className = "flex gap-5 items-start py-2 border-b border-[#27272a]";
        const time = new Date(log.created_at).toISOString().split('T')[1].slice(0,8);
        div.innerHTML = `
            <span class="text-[#71717a] shrink-0 font-bold">[${time}]</span>
            <span class="${actionColor} font-bold w-32 shrink-0">${log.action}</span>
            <span class="text-gray-300 break-words leading-relaxed">${log.message}</span>
        `;
        logContainer.appendChild(div);
    });
}

window.onload = fetchState;
