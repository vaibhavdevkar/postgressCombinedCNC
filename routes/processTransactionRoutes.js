const express = require('express');
const router = express.Router();
const ctrl = require('../controller/processTransactionController');

// Create a new transaction
router.post('/', ctrl.createProcessTransaction);

// Get all transactions
router.get('/', ctrl.getAllProcessTransactions);

// Get one transaction by ID
router.get('/:id', ctrl.getProcessTransactionById);

// Update a transaction
router.put('/:id', ctrl.updateProcessTransaction);

// Delete a transaction
router.delete('/:id', ctrl.deleteProcessTransaction);

module.exports = router;