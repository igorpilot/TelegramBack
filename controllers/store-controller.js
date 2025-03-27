const StoreService = require("../service/store-service");
const error = require("nodemailer/lib/mail-composer");

class StoreController {
    async createStore(req, res) {
        try {
            const { userId, title, description } = req.body;
            const store = await StoreService.createStore(userId, title, description);
            res.json(store);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Сталася помилка при створенні магазину' });
        }
    }
    async deleteStore(req, res) {
        try {
            const {userId, storeId} = req.body;
            const store = await StoreService.deleteStore(userId, storeId);
            res.json(store);
        } catch (error) {
            console.error(error);
            res.status(500).json({ message: 'Сталася помилка при видаленні магазину' });
        }
    }
    async getUserStores(req, res) {
        try {
            const { userId } = req.params;
            const stores = await StoreService.getUserStores(userId);
            return res.json(stores);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async addCategoryOrSupplier(req, res) {
        try {
            const { label, value, storeId} = req.body;
            const updatedStore = await StoreService.addCategoryOrSupplier(label, value, storeId);
            return res.json(updatedStore);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async deleteCategoryOrSupplier(req, res) {
        try {
            const { label, value, storeId} = req.body;
            const updatedStore = await StoreService.deleteCategoryOrSupplier(label, value, storeId);
            return res.json(updatedStore);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async changeCategoryOrSupplier(req, res) {
        try {
            const {title, label, value, storeId } = req.body;
            const updatedStore = await StoreService.changeCategoryOrSupplier(title, label, value, storeId);
            return res.json(updatedStore);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async addDelivery(req, res) {
        try {
            const {supplierInfo, storeId} = req.body;
            const updatedStore = await StoreService.addDelivery(supplierInfo, storeId)
            return res.json(updatedStore);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async addProduct(req, res){
        try {
            const {productData, storeId, deliveryId} = req.body;
            const updatedStore = await StoreService.addProduct(productData, storeId, deliveryId);
            return res.json(updatedStore);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async addCustomer(req, res) {
        try {
            const {customerInfo, storeId} = req.body;
            const updatedStore = await StoreService.addCustomer(customerInfo, storeId);
            return res.json(updatedStore);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async addSalesProduct(req, res) {
        try {
        const {newProduct, storeId, customerId} = req.body;
        const updatedStore =await StoreService.addSalesProduct(newProduct, storeId, customerId)
        return res.json(updatedStore);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    }
    async changeProduct(req, res) {
        try {
        const {productData, storeId, deliveryId, customerId} = req.body;
        const updatedStore= await StoreService.changeProduct(productData, storeId, deliveryId, customerId);
        return res.json(updatedStore);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }}
    async deleteProduct(req, res) {
        try {
            const {productData, storeId, deliveryId, customerId} = req.body;
            const updatedStore = await StoreService.deleteProduct(productData, storeId, deliveryId, customerId);
            return res.json(updatedStore);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async changeNumberOfOrder(req, res) {
        try {
        const {value, storeId} = req.body;
        const updatedStore = await StoreService.changeNumberOfOrder(value, storeId);
        return res.json(updatedStore);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }}
    async changeTitleOrDescriptionStore(req, res) {
        try {
        const {title, value, storeId} = req.body;
        const updatedStore = await StoreService.changeTitleOrDescriptionStore(title, value, storeId);
        return res.json(updatedStore);
    }  catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
}

module.exports = new StoreController();
