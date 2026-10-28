const express = require('express');
const router = express.Router();
const productController = require('../controllers/productController');
const { authenticateToken } = require('../middleware/auth');

// All product routes require authentication and tenant isolation
router.use(authenticateToken);

router.get('/', productController.getProducts);
router.post('/', productController.createProduct);
router.get('/:id', productController.getProductById);
router.put('/:id', productController.updateProduct);
router.patch('/:id/adjust-stock', productController.adjustStock);
router.delete('/:id', productController.deleteProduct);

module.exports = router;
