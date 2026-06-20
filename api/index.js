const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv').config();

const MemoryState = require('../models/Memory');

const app = express();
app.use(cors());
app.use(express.json());

let isConnected = false;
const connectDB = async () => {
    if (isConnected) return;
    try {
        await mongoose.connect(process.env.MONGODB_URI);
        isConnected = true;
    } catch (err) { console.error("Database Connection Error:", err); }
};

app.post('/api/setup', async (req, res) => {
    await connectDB();
    const { total_ram, page_size } = req.body;
    const num_frames = Math.floor(total_ram / page_size);
    
    let frames = Array.from({ length: num_frames }, (_, i) => ({ frame_index: i, is_free: true, process_name: null }));
    const log = { action: "FORMAT_RAM", status: "success", message: `Sistem diformat. Total RAM Fisik: ${total_ram}KB, Ukuran Page: ${page_size}KB.` };

    await MemoryState.deleteMany({});
    const newState = new MemoryState({ total_ram, page_size, frames, activity_logs: [log] });
    await newState.save();
    res.json({ success: true, state: newState });
});

app.post('/api/allocate', async (req, res) => {
    await connectDB();
    const { process_name, size } = req.body;
    let state = await MemoryState.findOne();
    if(!state) return res.status(400).json({success: false, message: "Sistem belum diatur. Harap Format System terlebih dahulu."});

    const pages_needed = Math.ceil(size / state.page_size);
    let free_frames = state.frames.filter(f => f.is_free);

    if (pages_needed > free_frames.length) {
        state.page_faults += 1;
        state.activity_logs.push({ action: "PAGE_FAULT", status: "error", message: `Alokasi [${process_name}] gagal. Membutuhkan ${pages_needed} frames, memori penuh.` });
        await state.save();
        return res.status(400).json({ success: false, message: "PAGE FAULT: Memori fisik tidak mencukupi untuk proses ini." });
    }

    let allocated = 0;
    for (let frame of state.frames) {
        if (frame.is_free && allocated < pages_needed) {
            frame.is_free = false; frame.process_name = process_name; allocated++;
        }
    }
    state.activity_logs.push({ action: "ALLOCATE", status: "success", message: `Alokasi ${size}KB memori untuk proses [${process_name}] berhasil.` });
    await state.save();
    res.json({ success: true, state });
});

app.post('/api/deallocate', async (req, res) => {
    await connectDB();
    const { process_name } = req.body;
    let state = await MemoryState.findOne();
    
    let freed = 0;
    for (let frame of state.frames) {
        if (frame.process_name === process_name) {
            frame.is_free = true; frame.process_name = null; freed++;
        }
    }
    
    if(freed === 0) return res.status(404).json({success: false, message: `Proses [${process_name}] tidak ditemukan dalam RAM.`});
    state.activity_logs.push({ action: "KILL_PROC", status: "success", message: `Proses [${process_name}] dihentikan. Membebaskan ${freed} frame.` });
    await state.save();
    res.json({ success: true, state });
});

app.get('/api/state', async (req, res) => {
    await connectDB();
    res.json(await MemoryState.findOne());
});

module.exports = app;