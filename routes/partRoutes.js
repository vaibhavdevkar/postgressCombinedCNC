// // routes/partRoutes.js
// const express = require('express');
// const router  = express.Router();
// const ctrl    = require('../controller/partController');

// router.post('/',ctrl.createPart);
// router.get('/',ctrl.getAllParts);
// router.get('/:id',ctrl.getPartById);
// router.put('/:id', ctrl.updatePart);
// router.delete('/:id', ctrl.deletePart);

// module.exports = router;


const express = require('express');
const multer  = require('multer');
const path    = require('path');
const ctrl    = require('../controller/partController');

const router = express.Router();

// Multer configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/');              // ensure this dir exists
  },
  filename: (req, file, cb) => {
    const name = `${Date.now()}-${file.originalname}`;
    cb(null, name);
  }
});
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.pdf','.dxf','.step','.stp', '.png'].includes(ext)) cb(null, true);
  else cb(new Error('Only .pdf/.dxf/.step files are allowed'), false);
};
const upload = multer({ storage, fileFilter });

// CREATE (with file upload)
router.post(
  '/',
  upload.single('cad_design_upload'),
  ctrl.createPart
);

// READ ALL
router.get('/', ctrl.getAllParts);

// READ ONE
router.get('/:id', ctrl.getPartById);

// UPDATE (with optional new file)
router.put(
  '/:id',
  upload.single('cad_design_upload'),
  ctrl.updatePart
);

// DELETE
router.delete('/:id', ctrl.deletePart);

module.exports = router;
