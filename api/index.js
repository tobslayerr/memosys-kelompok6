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
