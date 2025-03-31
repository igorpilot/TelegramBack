const { Router } = require('express');  // Тут потрібно імпортувати Router
const router = Router();
const {body}= require('express-validator');
const userController = require('../controllers/user-controller');
const authMiddleware = require('../middlewares/auth-middleware');
const storeController = require('../controllers/store-controller');
const onlineStoreController = require('../controllers/onlineStore-controller');
const exportExcelController = require('../controllers/excel-controller');
const upload = require('../middlewares/uploadMiddleware');
router.post('/registration',
    body('email').isEmail(),
    body('password').isLength({min:6, max:32}),
    userController.registration)
router.post('/login', userController.login)
router.post('/logout', userController.logout)
router.get('/activate/:link', userController.activate)
router.get('/refresh', userController.refresh)
router.get('/users',   userController.getUsers)
router.post("/create", storeController.createStore);
router.delete('/deleteStore', storeController.deleteStore);
router.put("/addCategoryOrSupplier", storeController.addCategoryOrSupplier);
router.get('/get-stores/:userId', storeController.getUserStores);
router.put('/deleteCategoryOrSupplier', storeController.deleteCategoryOrSupplier)
router.put('/changeCategoryOrSupplier', storeController.changeCategoryOrSupplier)
router.put('/addDelivery', storeController.addDelivery)
router.put('/addProduct', storeController.addProduct)
router.post('/uploadImage', upload.single('image'), storeController.uploadImage);
router.post('/addProduct', storeController.addProduct);
router.put('/addCustomer', storeController.addCustomer)
router.put('/addSalesProduct', storeController.addSalesProduct)
router.put('/changeProduct', storeController.changeProduct)
router.delete('/deleteProduct', storeController.deleteProduct)
router.put('/changeNumberOfOrder', storeController.changeNumberOfOrder)
router.put('/changeTitleOrDescriptionStore', storeController.changeTitleOrDescriptionStore)
router.get('/downloadExcel/:storeId', exportExcelController.exportInventory);


router.post('/getProducts', onlineStoreController.getProducts)



module.exports = router;