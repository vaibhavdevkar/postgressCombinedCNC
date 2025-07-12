const pool = require("../db");

exports.createTransaction = async (req, res) => {
  try {
    const { setup_id, start_time, end_time, operator_id, setup_status, validation_passed } = req.body;

    const result = await pool.query(
      `INSERT INTO setup_transactions (
        setup_id, start_time, end_time, operator_id, setup_status, validation_passed
      ) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [setup_id, start_time, end_time, operator_id, setup_status, validation_passed]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error("Create Setup Transaction Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getAllTransactions = async (req, res) => {
  try {
    const result = await pool.query("SELECT * FROM setup_transactions ORDER BY setup_transaction_id DESC");
    res.json(result.rows);
  } catch (error) {
    console.error("Get All Transactions Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.getTransactionById = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("SELECT * FROM setup_transactions WHERE setup_transaction_id = $1", [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Transaction not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Get Transaction Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.updateTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const { setup_id, start_time, end_time, operator_id, setup_status, validation_passed } = req.body;

    const result = await pool.query(
      `UPDATE setup_transactions SET
        setup_id = $1, start_time = $2, end_time = $3,
        operator_id = $4, setup_status = $5, validation_passed = $6
      WHERE setup_transaction_id = $7 RETURNING *`,
      [setup_id, start_time, end_time, operator_id, setup_status, validation_passed, id]
    );

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Transaction not found" });

    res.json(result.rows[0]);
  } catch (error) {
    console.error("Update Setup Transaction Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};

exports.deleteTransaction = async (req, res) => {
  try {
    const { id } = req.params;
    const result = await pool.query("DELETE FROM setup_transactions WHERE setup_transaction_id = $1 RETURNING *", [id]);

    if (result.rows.length === 0)
      return res.status(404).json({ message: "Transaction not found" });

    res.json({ message: "Deleted successfully", deleted: result.rows[0] });
  } catch (error) {
    console.error("Delete Setup Transaction Error:", error);
    res.status(500).json({ error: "Internal Server Error" });
  }
};
