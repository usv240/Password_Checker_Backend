const mongoose = require('mongoose');

const RainbowTableSchema = new mongoose.Schema({
    password: { type: String, required: true, unique: true },
});

const RainbowTable = mongoose.model('RainbowTable', RainbowTableSchema);

module.exports = RainbowTable;
