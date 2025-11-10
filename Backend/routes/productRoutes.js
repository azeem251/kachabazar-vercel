// import express from 'express';
// import multer from 'multer';
// import {
//   addProduct,
//   deleteProduct,
//   getProductsByCategory,
//   updateProduct,
//   getProductById, // ✅ Add this
// } from '../controllers/productController.js';

// const router = express.Router();

// const storage = multer.diskStorage({
//   destination: 'uploads/',
//   filename: (req, file, cb) => cb(null, `${Date.now()}-${file.originalname}`),
// });
// const upload = multer({ storage });

// router.post('/add', upload.single('image'), addProduct);
// router.get('/', getProductsByCategory);
// router.get('/products/:id', getProductById); // ✅ Add this line
// router.put('/products/:id', updateProduct);
// router.delete('/products/:id', deleteProduct);

// export default router;


import express from 'express';
import multer from 'multer';
import {
  addProduct,
  deleteProduct,
  getProductsByCategory,
  updateProduct,
  getProductById,
  searchProducts,
} from '../controllers/productController.js';
import Product from '../models/Product.js';

const router = express.Router();

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + path.extname(file.originalname));
  },
});
const upload = multer({ storage });

router.post('/add', upload.single('image'), addProduct);
router.get('/', getProductsByCategory);
router.get('/:name/:id', getProductById); // ✅ Correct path
// router.put('/:id', updateProduct);
router.put('/:id', upload.single('image'), updateProduct);
router.delete('/:id', deleteProduct);
router.get('/search', searchProducts);




export default router;
