const OnlineStoreService = require("../service/onlineStore-service");

class OnlineStoreController {
    async getProducts(req, res) {
        try {
            const {storeId} = req.body;
            const products = await OnlineStoreService.getProducts(storeId);
            res.json(products);
        } catch (error) {
            console.error(error);
            res.status(500).json({message: 'Сталася помилка controller getProducts '});
        }
    }
}
module.exports = new OnlineStoreController();