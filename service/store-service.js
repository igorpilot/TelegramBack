const UserModel = require("../models/user-model");
const StoreModel = require("../models/store-model");
const mongoose = require("mongoose");
const StoreDTO = require("./dtos/store-dto");
const {v1} = require("uuid");
const trace_events = require("node:trace_events");

class StoreService {
    async createStore(userId, title, description) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Невірний формат userId');
            }

            const user = await UserModel.findById(userId);
            if (!user) {
                throw new Error('Користувач не знайдений');
            }

            const newStore = await StoreModel.create({
                userId,
                title,
                description,
                menu: [],
                supplier: [],
                rowsAll: [],
                rowsDelivery: [],
                rowsArrival: [],
                rowsCustomer: [],
                rowsSales: [],
                numberOfOrder: 1000000
            });

            user.stores.push(newStore);
            await user.save();
            // const storeDto = new StoreDTO(newStore);


            return newStore;

        } catch (error) {
            console.error("❌ Помилка в createStore():", error);
            throw error; // Перекидаєте помилку до контролера
        }
    }
    async getUserStores(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Невірний формат userId');
            }

            const stores = await StoreModel.find({ userId });
            return stores;
        } catch (error) {
            console.error("❌ Помилка в getUserStores():", error);
            throw error;
        }
    }
    async addCategoryOrSupplier(label, value, storeId ) {
        try {
            if (!mongoose.Types.ObjectId.isValid(storeId)) {
                throw new Error('Невірний формат storeId');
            }

            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }

            if (label === "Menu" || label ===  "Категорія") {
                store.menu.unshift(value.toUpperCase());
            } else if (label === "Supplier" || label === "Постачальник") {
                store.supplier.unshift(value.toUpperCase());
            } else {
                throw new Error("Невідомий тип оновлення");
            }

            await store.save();
            return store;
        } catch (error) {
            console.error("❌ Помилка в addCategoryOrSupplier():", error);
            throw error;
        }
    }
    async deleteCategoryOrSupplier(label, value, storeId ) {
        try {
            if (!mongoose.Types.ObjectId.isValid(storeId)) {
                throw new Error('Невірний формат storeId');
            }

            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }

            if (label === "menu") {
                store.menu = store.menu.filter(item => item.toUpperCase() !== value.toUpperCase());
            } else if (label === "supplier") {
                store.supplier = store.supplier.filter(item => item.toUpperCase() !== value.toUpperCase());
            } else {
                throw new Error("Невідомий тип оновлення");
            }

            await store.save();
            return store;
        } catch (error) {
            console.error("❌ Помилка в addCategoryOrSupplier():", error);
            throw error;
        }
    }
    async changeCategoryOrSupplier(title, oldValue, newValue, storeId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }

            if (title === "menu") {
                const index = store.menu.findIndex(item => item.toUpperCase() === oldValue.toUpperCase());
                if (index === -1) {
                    throw new Error("Категорія не знайдена");
                }
                store.menu[index] = newValue.toUpperCase();
                store.markModified("menu"); // Позначаємо поле як змінене
            }
            else if (title === "supplier") {
                const index = store.supplier.findIndex(item => item.toUpperCase() === oldValue.toUpperCase());
                if (index === -1) {
                    throw new Error("Постачальник не знайдений");
                }
                store.supplier[index] = newValue.toUpperCase();
                store.markModified("supplier");
            }
            else {
                throw new Error("Невідомий тип оновлення");
            }

            await store.save();
            return store;
        } catch (error) {
            console.error("❌ Помилка в changeCategoryOrSupplier():", error);
            throw error;
        }
    }
    async addDelivery(numberOfDocument, delivery, date, price, storeId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            store.rowsDelivery = [{id:v1(), numberOfDocument, delivery, date, price}, ...store.rowsDelivery]
            store.markModified("rowsDelivery");
            await store.save();
            return store;
        } catch (e) {
            console.error("❌ Помилка в addDelivery():", e)
        }
    }
    async addProduct(productData, storeId, numberOfDocument, delivery, date) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            if(productData.id === "") {
                store.rowsArrival = [{...productData, id: v1(), numberOfDocument, delivery, date}, ...store.rowsArrival]
                const row = store.rowsDelivery.find(row => row.numberOfDocument === numberOfDocument);
                row.price = store.rowsArrival.filter(row => row.numberOfDocument === numberOfDocument).reduce((sum, row) => sum + Number(row.quantity) * Number(row.purchasePrice), 0)
                store.rowsAll = [{...productData, id: v1(), numberOfDocument, delivery, date}, ...store.rowsAll]
            } else {
                store.rowsArrival = [{...productData, id: v1(), numberOfDocument, delivery, date}, ...store.rowsArrival]
                const existProduct = store.rowsAll.find(p => p.id === productData.id);
                if (existProduct) {
                    existProduct.name = productData.name;
                    existProduct.description = productData.description;
                    existProduct.brand = productData.brand;
                    existProduct.country = productData.country;
                    existProduct.quantity += Number(productData.quantity);
                    existProduct.purchasePrice = productData.purchasePrice;
                    existProduct.profitPrice = productData.profitPrice;
                    existProduct.sellingPrice = productData.sellingPrice;
                    existProduct.code = productData.code;
                }
                const row = store.rowsDelivery.find(row => row.numberOfDocument === numberOfDocument);
                if (row) {
                    row.price = store.rowsArrival
                        .filter((row) => row.numberOfDocument === numberOfDocument)
                        .reduce((sum, row) => sum + Number(row.quantity) * Number(row.purchasePrice), 0);
                }
                store.rowsAll = [{...productData, id: v1(), numberOfDocument, delivery, date}, ...store.rowsAll]
            }
            store.markModified("rowsArrival");
            store.markModified("rowsAll");
            store.markModified("rowsDelivery");
            await store.save();
            return store;
        } catch (e) {
            console.error("❌ Помилка в addProduct():", e)
        }
    }
    async addCustomer(customerInfo, storeId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }

            store.rowsCustomer = [{ id: v1(), ...customerInfo}, ...store.rowsCustomer]
            store.numberOfOrder++;
            store.markModified("rowsCustomer");
            await store.save();
            return store;
        } catch (e){
            console.error("❌ Помилка в addCustomer():", e)
        }
    }
    async addSalesProduct(newProduct, storeId, nameOfCustomer, date, numberOfOrder) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            store.rowsSales = [{id: v1(), ...newProduct, nameOfCustomer, date, numberOfOrder}, ...store.rowsSales]
            store.rowsAll= store.rowsAll.map((row) => row.id === newProduct.id ? {...row,
                        quantity: Number(row.quantity) - Number(newProduct.quantity),
                    }
                    : row
            )
            const row = store.rowsCustomer.find(row => row.numberOfOrder === numberOfOrder);
            if (row) {
                row.price = store.rowsSales
                    .filter(row => row.numberOfOrder === numberOfOrder)
                    .reduce((sum, row) => sum + Number(row.quantity)*Number(row.sellingPrice), 0)
            }


            await store.save();
            return store;

        } catch (e) {
            console.error("❌ Помилка в addSalesProduct():", e)
        }

    }
    async changeProduct(productData, storeId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            const rowArr=store.rowsArrival.find(row => row.id === productData.id)
            if (rowArr) {
                Object.assign(rowArr, productData);
            }
            const rowAll = store.rowsAll.find(row => row.id === productData.id)
            if (rowAll) {

            }
            await store.save();
            return store;
        } catch (e) {
            console.log("❌ Помилка в changeProduct():", e)
        }
    }
    async changeNumberOfOrder(value, storeId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            store.numberOfOrder=value;
            await store.save();
            return store;
        } catch (e) {
            console.log("❌ Помилка в changeNumberOfOrder():", e)
        }
    }
    async changeTitleOrDescriptionStore(title, value, storeId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            if(title=== "titleOfStore") {
                store.title=value
            }
            if(title=== "descriptionOfStore") {
                store.description=value
            }

            await store.save();
            return store;
        } catch (e) {
            console.log("❌ Помилка в changeTitleOrDescriptionStore():", e)
        }
    }

}
module.exports =  new StoreService();