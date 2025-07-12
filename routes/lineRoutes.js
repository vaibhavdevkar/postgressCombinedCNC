// // routes/lineRoutes.js
// const express = require('express');
// const router = express.Router();
// const lineCtrl = require('../controller/lineController');

// router.post('/lines',    lineCtrl.createLine);
// router.get('/lines',     lineCtrl.getAllLines);
// router.get('/lines/:id', lineCtrl.getLineById);
// router.put('/lines/:id', lineCtrl.updateLine);
// router.delete('/lines/:id', lineCtrl.deleteLine);

// module.exports = router;


const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const ctrl = require('../controller/lineController');

// configure multer storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');           // make sure this dir exists
  },
  filename: (req, file, cb) => {
    const unique = Date.now() + '-' + file.originalname;
    cb(null, unique);
  }
});

// file filter: only jpg/png/pdf
const fileFilter = (req, file, cb) => {
  const allowed = ['.jpg','.jpeg','.png','.pdf'];
  const ext = path.extname(file.originalname).toLowerCase();
  if (allowed.includes(ext)) cb(null, true);
  else cb(new Error('Only .jpg, .png, .pdf allowed'), false);
};

const upload = multer({ storage, fileFilter });

// CREATE (with file)
router.post(
  '/',
  upload.single('layout_upload'),
  ctrl.createLine
);

// READ ALL
router.get('/', ctrl.getAllLines);

// READ ONE
router.get('/:id', ctrl.getLineById);

// UPDATE (with optional file)
router.put(
  '/:id',
  upload.single('layout_upload'),
  ctrl.updateLine
);

// DELETE
router.delete('/:id', ctrl.deleteLine);

module.exports = router;
