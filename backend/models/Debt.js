// backend/models/Debt.js
const mongoose = require('mongoose');

const debtSchema = new mongoose.Schema({
  customer_name: { type: String, required: true, unique: true },
  total_debt: { type: Number, default: 0 },
  history: [
    {
      date: { type: Date, default: Date.now },
      action: String, // 'add' hoặc 'pay'
      amount: Number,
      note: String,
    }
  ]
});

module.exports = mongoose.model('Debt', debtSchema);
