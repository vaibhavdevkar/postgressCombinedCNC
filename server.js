// server.js
require('dotenv').config();
const express = require('express');
const app = express();
const cors = require("cors")



app.use(cors());
app.use(express.json());
app.use('/uploads', express.static('uploads'));

const partRoutes = require('./routes/partRoutes');
const machineRoutes = require('./routes/machineRoutes');
const lineRoutes = require('./routes/lineRoutes');
const processRoutes = require('./routes/processRoutes');
const setupRoutes = require('./routes/setupRoutes');
const shiftRoutes = require("./routes/shiftRoutes")
const pmcparameterRoutes = require("./routes/pmcParameterRoutes")
const documentRoutes = require("./routes/documentRoutes")
const productionRoutes = require('./routes/productionRoutes');
const monitoringRoutes = require('./routes/monitoringRoutes');
const maintenanceRoutes = require('./routes/maintenanceRoutes');
const breakdownRoutes = require('./routes/breakdownRoutes');
const downtimeRoutes = require('./routes/downtimeRoutes');

app.use('/api/downtimes', downtimeRoutes);
const partRejectionRoutes = require('./routes/partrejectionRoutes');
app.use('/api/partrejections', partRejectionRoutes);

const alertsRoutes = require("./routes/alertsRoutes");
app.use('/api/alerts', alertsRoutes);
const alertHistoryRoutes = require("./routes/alertHistoryRoutes");
app.use("/api/alertHistory", alertHistoryRoutes);
const setupTransactionRoutes = require("./routes/setupTransactionsRoutes");
app.use("/api/setupTransactions", setupTransactionRoutes);
const pmcHistoryRoutes = require("./routes/pmcHistoryRoutes");
app.use("/api/pmcHistory", pmcHistoryRoutes);
const gaugeLogRoutes = require('./routes/gaugeLogRoutes');
app.use('/api/gauge', gaugeLogRoutes);  
const processTxnRoutes = require('./routes/processTransactionRoutes');
app.use('/api/process-transactions', processTxnRoutes);
const setupApprovalRoutes = require('./routes/setupApprovalRoutes');
app.use('/api/setup-approvals', setupApprovalRoutes);
const skillMatrixRoutes = require("./routes/skillMatrixRoutes")
app.use('/api/skills', skillMatrixRoutes);
const toolRoutes = require("./routes/toolRoutes")
app.use('/api/tools', toolRoutes);
const userRoutes = require("./routes/userRoutes")
app.use('/api/users', userRoutes);

app.use('/api/breakdown', breakdownRoutes);
app.use('/api/maintenance', maintenanceRoutes);
app.use('/api/production', productionRoutes);
app.use('/api/monitoring', monitoringRoutes);
app.use('/api/setups', setupRoutes);
app.use('/api/machines', machineRoutes);
app.use('/api/parts', partRoutes);
app.use('/api/lines', lineRoutes);
app.use('/api/processes', processRoutes);
app.use('/api/shifts', shiftRoutes)
app.use('/api/pmc-parameters', pmcparameterRoutes);
app.use('/api/documents', documentRoutes);

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => {
  console.log(`🛠️  Part-Master API listening on port ${PORT}`);
});
