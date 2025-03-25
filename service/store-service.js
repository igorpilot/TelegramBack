const UserModel = require("../models/user-model");
const StoreModel = require("../models/store-model");
const mongoose = require("mongoose");
const StoreDTO = require("./dtos/store-dto");
const {v1} = require("uuid");

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


            return newStore;

        } catch (error) {
            console.error("❌ Помилка в createStore():", error);
            throw error;
        }
    }
    async deleteStore(userId, storeId) {
        try {
            const store = await StoreModel.findById(storeId);

            if (!store) {
                throw new Error("Магазин не знайдено або у вас немає прав на його видалення");
            }
            const user = await UserModel.findById(userId)
            if (!user) {
                throw new Error("Користувач не знайдений");
            }
            await StoreModel.findByIdAndDelete(storeId);
            user.stores = user.stores.filter(store => store._id !== storeId);
            await user.save();
        } catch (error) {
            console.log("❌ Помилка в deleteStore():", error)
        }
    }
    async getUserStores(userId) {
        try {
            if (!mongoose.Types.ObjectId.isValid(userId)) {
                throw new Error('Невірний формат userId');
            }
            const user = await UserModel.findById(userId)
            const stores = await StoreModel.find({ userId });
            user.stores = stores
            await user.save()
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
                store.menu.unshift(value.toUpperCase())
                store.menu.sort()
            } else if (label === "Supplier" || label === "Постачальник") {
                store.supplier.unshift(value.toUpperCase());
                store.supplier.sort()
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
                store.markModified("menu");
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
    async addProduct(productData, storeId, deliveryId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            const rowDelivery = store.rowsDelivery.find(row => row.id === deliveryId);
            if(productData.id === "") {
                let productId= v1()
                rowDelivery.products = [{...productData, id: productId}, ...rowDelivery.products];
                rowDelivery.price = rowDelivery.products.reduce((sum, row) => sum + Number(row.quantity) * Number(row.purchasePrice), 0)
                store.rowsAll = [{...productData, id: productId}, ...store.rowsAll]
            } else {
                const existProduct = store.rowsAll.find(p => p.id === productData.id);
                rowDelivery.products = [{...productData, id:existProduct.id}, ...rowDelivery.products];
                rowDelivery.price = rowDelivery.products.reduce((sum, row) => sum + Number(row.quantity) * Number(row.purchasePrice), 0)
                if (existProduct) {
                    Object.assign(existProduct, {
                        ...productData,
                        quantity: existProduct.quantity + Number(productData.quantity)
                    });
                }

            }
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
    async addSalesProduct(newProduct, storeId, customerId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            const rowCustomer = store.rowsCustomer.find(row => row.id === customerId);
            if (newProduct.id === "") {
                console.log(newProduct);
                rowCustomer.products = [{...newProduct, id: v1()}, ...rowCustomer.products];
                rowCustomer.price = rowCustomer.products.reduce((sum, row) =>
                    sum + row.quantity * row.sellingPrice, 0);
        } else {
                const existProduct = store.rowsAll.find(p => p.id === newProduct.id);
                rowCustomer.products = [{...newProduct, id: existProduct.id}, ...rowCustomer.products];
                rowCustomer.price = rowCustomer.products.reduce((sum, row) => sum + Number(row.quantity) * Number(row.sellingPrice), 0)
                if (existProduct) {
                    Object.assign(existProduct, {
                        ...newProduct,
                        quantity: existProduct.quantity - Number(newProduct.quantity)
                    });
                }
            }

            await store.save();
            return store;

        } catch (e) {
            console.error("❌ Помилка в addSalesProduct():", e)
        }

    }
    async changeProduct(productData, storeId, deliveryId, customerId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            let productInRowsAll = store.rowsAll.find(row => row.id === productData.id)
            if(deliveryId) {

                const rowDelivery = store.rowsDelivery.find(p => p.id === deliveryId);
                const product = rowDelivery.products.find(p => p.id === productData.id);
                if (product) {
                    Object.assign(product, productData)
                }
                if (productInRowsAll) {

                    Object.assign(productInRowsAll, productData, {
                        quantity: productInRowsAll.quantity + Number(productData.quantityDifference),
                    });
                }
                rowDelivery.price = rowDelivery.products.reduce((sum, row) => sum + Number(row.quantity) * Number(row.purchasePrice), 0)
            }
            if(deliveryId === undefined && customerId===undefined) {
                    Object.assign(productInRowsAll, productData, {
                        quantity: Number(productData.quantity),
                        purchaseTotal: Number(productData.purchaseTotal),
                    });
                store.markModified("rowsAll");
            }
            if(customerId){
                const rowCustomer = store.rowsCustomer.find(p => p.id === customerId);
                const product = rowCustomer.products.find(p => p.id === productData.id);
                if (product) {
                    Object.assign(product, productData)
                }
                if (productInRowsAll) {
                    Object.assign(productInRowsAll, productData, {
                        quantity: productInRowsAll.quantity - Number(productData.quantityDifference),
                    });
                }
                rowCustomer.price = rowCustomer.products.reduce((sum, row) => sum + Number(row.quantity) * Number(row.sellingPrice), 0)
            }
            await store.save();
            return store;
        } catch (e) {
            console.log("❌ Помилка в changeProduct():", e)
        }
    }
    async deleteProduct(productData, storeId, deliveryId, customerId) {
        try {
            console.log("id", customerId)
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            let productInRowsAll = store.rowsAll.find(p => p.id === productData.id);
            if (deliveryId) {
                const deliveryRow = store.rowsDelivery.find(row => row.id === deliveryId);
                const deliveryProduct = deliveryRow.products.find(p => p.id === productData.id);
                if (deliveryRow) {
                    const updatedProduct = {
                        ...productInRowsAll,
                        quantity: Number(productInRowsAll.quantity) - Number(deliveryProduct.quantity)
                    };
                    store.rowsAll = store.rowsAll.map(p =>
                        p.id === productData.id ? updatedProduct : p
                    );
                    deliveryRow.products = deliveryRow.products.filter(p => p.id !== productData.id);
                }
                deliveryRow.price = deliveryRow.products.reduce((sum, row) => sum + Number(row.quantity) * Number(row.purchasePrice), 0)
            }
            if(deliveryId === undefined && customerId===undefined) {
                store.rowsAll = store.rowsAll.filter(p => p.id !== productData.id);
                store.markModified("rowsAll");
                };
            if (customerId) {
                console.log('deliveryId', deliveryId)
                const customerRow = store.rowsCustomer.find(row => row.id === customerId);
                const customerProduct = customerRow.products.find(p => p.id === productData.id);
                if (customerRow) {
                    const updatedProduct = {
                        ...productInRowsAll,
                        quantity: Number(productInRowsAll.quantity) + Number(customerProduct.quantity)
                    };
                    store.rowsAll = store.rowsAll.map(p =>
                        p.id === productData.id ? updatedProduct : p
                    );
                    customerRow.products = customerRow.products.filter(p => p.id !== productData.id);
                }
                rowCustomer.price = rowCustomer.products.reduce((sum, row) => sum + Number(row.quantity) * Number(row.sellingPrice), 0)
            }


            await store.save();
            return store;
        } catch (e) {
            console.log("❌ Помилка в deleteProduct():", e)
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