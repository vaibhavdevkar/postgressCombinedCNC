const express = require('express');
const multer  = require('multer');
const path    = require('path');
const ctrl    = require('../controller/documentController');

const router = express.Router();

// Multer setup (uploads folder, fileFilter for .pdf/.doc/.jpg etc)
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`)
});
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  if (['.pdf','.doc','.docx','.xls','.xlsx','.jpg','.png'].includes(ext)) {
    cb(null, true);
  } else {
    cb(new Error('Only document/image files are allowed'), false);
  }
};
const upload = multer({ storage, fileFilter });

router.post(   '/', upload.single('document_file'), ctrl.createDocument);
router.get(    '/', ctrl.getAllDocuments);
router.get(    '/:id', ctrl.getDocumentById);
router.put(    '/:id', upload.single('document_file'), ctrl.updateDocument);
router.delete( '/:id', ctrl.deleteDocument);

module.exports = router;
