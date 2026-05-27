const express = require('express');
const { createUrl, getUserUrls, updateUrl, deleteUrl } = require('../controllers/urlController');
const { protect } = require('../middlewares/authMiddleware');

const router = express.Router();

// All URL operations are protected / user-wise isolated
router.use(protect);

router.post('/', createUrl);
router.get('/', getUserUrls);
router.put('/:id', updateUrl);
router.delete('/:id', deleteUrl);

module.exports = router;
