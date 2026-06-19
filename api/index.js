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
