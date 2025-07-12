

// routes/toolRoutes.js
const express = require('express');
const router = express.Router();
const path = require('path');
const fs = require('fs');
const multer = require('multer');
const toolController = require('../controller/toolController');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir);

// Multer storage config
 const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, uploadDir),
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + unique + ext);
  }
});
const upload = multer({ storage });

// CRUD routes with file-upload middleware on create/update
router.get('/', toolController.getAllTools);
router.get('/:id', toolController.getToolById);
router.post('/', upload.single('tool_drawing_upload'), toolController.createTool);
router.put('/:id', upload.single('tool_drawing_upload'), toolController.updateTool);
router.delete('/:id', toolController.deleteTool);

module.exports = router;