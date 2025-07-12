const express = require("express");
const router = express.Router();
const setupTransactionController = require("../controller/setupTransactionsController");

router.post("/", setupTransactionController.createTransaction);
router.get("/", setupTransactionController.getAllTransactions);
router.get("/:id", setupTransactionController.getTransactionById);
router.put("/:id", setupTransactionController.updateTransaction);
router.delete("/:id", setupTransactionController.deleteTransaction);

module.exports = router;
