const StoreModel=require('../models/store-model');
class OnlineStoreService {
    async getProducts(storeId) {
        try {
            const store = await StoreModel.findOne({title: storeId});

            if (!store) {
                throw new Error('Магазин не знайдено');
            }

            return store.rowsAll;
        } catch (error) {
            console.log("Error in getProducts", error);
            return null;
        }
    }
}
module.exports =  new OnlineStoreService();