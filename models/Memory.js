const mongoose = require('mongoose');

const frameSchema = new mongoose.Schema({
    frame_index: Number,
    is_free: { type: Boolean, default: true },
    process_name: { type: String, default: null }
});

const logSchema = new mongoose.Schema({
    action: String, 
    status: String, 
    message: String,
    created_at: { type: Date, default: Date.now }
});

const memoryStateSchema = new mongoose.Schema({
    total_ram: { type: Number, default: 128 },
    page_size: { type: Number, default: 8 },
    page_faults: { type: Number, default: 0 },
    frames: [frameSchema],
    activity_logs: [logSchema]
});

module.exports = mongoose.model('MemoryState', memoryStateSchema);