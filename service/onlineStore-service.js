const StoreModel=require('../models/store-model');
class OnlineStoreService {
    async getStore(storeId) {
        try {
            const store = await StoreModel.findOne({title: storeId});

            if (!store) {
                throw new Error('Магазин не знайдено');
            }

            return store;
        } catch (error) {
            console.log("Error in getProducts", error);
            return null;
        }
    }
}
module.exports =  new OnlineStoreService();