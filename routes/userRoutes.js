const express = require('express');
const multer  = require('multer');
const path    = require('path');
const ctrl    = require('../controller/userController');
const router  = express.Router();

// Multer setup
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, 'uploads/'),
  filename:    (req, file, cb) =>
    cb(null, `${Date.now()}-${file.originalname}`)
});
const fileFilter = (req, file, cb) => {
  const ext = path.extname(file.originalname).toLowerCase();
  // allow images and pdf/doc
  if (['.jpg','.jpeg','.png','.pdf','.doc','.docx'].includes(ext))
    cb(null, true);
  else
    cb(new Error('Invalid file type'), false);
};
const upload = multer({ storage, fileFilter });

// CREATE
router.post(
  '/',
  upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  ctrl.createUser
);

// READ ALL
router.get('/', ctrl.getAllUsers);

// READ ONE
router.get('/:id', ctrl.getUserById);

// UPDATE
router.put(
  '/:id',
  upload.fields([
    { name: 'picture', maxCount: 1 },
    { name: 'documents', maxCount: 10 }
  ]),
  ctrl.updateUser
);

// DELETE
router.delete('/:id', ctrl.deleteUser);

module.exports = router;