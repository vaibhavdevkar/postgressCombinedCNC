const express = require('express');
const multer  = require('multer');
const path    = require('path');
const ctrl    = require('../controller/skillMatrixController');
const router  = express.Router();

// Multer config for certificate upload
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const fileFilter = (req, file, cb) => {
  if (['.pdf','.jpg','.png','.jpeg'].includes(path.extname(file.originalname).toLowerCase()))
    cb(null, true);
  else
    cb(new Error('Only PDF/JPG/PNG allowed'), false);
};
const upload = multer({ storage, fileFilter });

// CREATE
router.post(
  '/',
  upload.single('document_upload'),
  ctrl.createSkillMatrix
);

// READ ALL
router.get('/', ctrl.getAllSkills);

// READ ONE
router.get('/:id', ctrl.getSkillById);

// UPDATE
router.put(
  '/:id',
  upload.single('document_upload'),
  ctrl.updateSkillMatrix
);

// DELETE
router.delete('/:id', ctrl.deleteSkillMatrix);

module.exports = router;