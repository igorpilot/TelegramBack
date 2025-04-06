import StoreModel from '../models/store-model.js';
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
export default new OnlineStoreService();