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
    async getStores  (req, res) {
        try {
            const { userId } = req.params;

            if (!userId) {
                return res.status(400).json({ message: "userId є обов'язковим!" });
            }

            const user = await UserModel.findById(userId);
            if (!user) {
                return res.status(404).json({ message: "Користувача не знайдено!" });
            }

            res.json(user.stores);
        } catch (error) {
            console.error("❌ Помилка в getUserStores():", error);
            res.status(500).json({ message: "Помилка сервера" });
        }
    };
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
            const {numberOfDocument, delivery, date, price, storeId} = req.body;
            const updatedStore = await StoreService.addDelivery(numberOfDocument, delivery, date, price, storeId)
            return res.json(updatedStore);
        } catch (error) {
            res.status(400).json({ message: error.message });
        }
    }
    async addProduct(req, res){
        try {
            const {productData, storeId, numberOfDocument, delivery, date} = req.body;
            const updatedStore = await StoreService.addProduct(productData, storeId, numberOfDocument, delivery, date);
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
        const {newProduct, storeId, nameOfCustomer, date, numberOfOrder} = req.body;
        const updatedStore =await StoreService.addSalesProduct(newProduct, storeId, nameOfCustomer, date, numberOfOrder)
        return res.json(updatedStore);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
    }
    async changeProduct(req, res) {
        try {
        const {productData, storeId} = req.body;
        const updatedStore= await StoreService.changeProduct(productData, storeId);
        return res.json(updatedStore);
    } catch (error) {
        res.status(400).json({ message: error.message });
    }}
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
