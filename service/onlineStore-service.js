import StoreModel from '../models/store-model.js';
import UserModel from "../models/user-model.js";
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
    async saveLikes(userId, likes) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");
        user.customer.likedProducts = likes;
        await user.save();
        return true;
    }

    async mergeLikes(userId, likes) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        const set = new Set([...user.customer.likedProducts.map(id => id.toString()), ...likes]);
        user.customer.likedProducts = Array.from(set);
        await user.save();
        return true;
    }

    async getLikes(userId) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        return user.customer.likedProducts;
    }
    async saveProductsInCart(userId, products) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");
        user.customer.cartProducts = products;
        await user.save();
        return true;
    }

    async mergeProductsInCart(userId, products) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        const set = new Set([...user.customer.cartProducts.map(id => id.toString()), ...products]);
        user.customer.cartProducts = Array.from(set);
        await user.save();
        return true;
    }

    async getProductsInCart(userId) {
        const user = await UserModel.findById(userId);
        if (!user) throw new Error("User not found");

        return user.customer.cartProducts;
    }
}
export default new OnlineStoreService();