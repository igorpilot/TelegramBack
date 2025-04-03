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
                rowsCustomer: [],
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
            if (label === "Category" || label ===  "Категорія") {
                store.menu.unshift(value.toUpperCase())
                store.menu.sort()
            } else if (label === "Supplier" || label === "Постачальник") {
                store.supplier.unshift(value.toUpperCase());
                store.supplier.sort()
            } else if (label === "Brand" || label === "Бренд") {
                store.brands.unshift(value.toUpperCase());
                store.brands.sort()
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
            } else if (label === "brand") {
                store.brands = store.brands.filter(item => item.toUpperCase() !== value.toUpperCase());
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
            else if (title === "brand") {
                const index = store.brands.findIndex(item => item.toUpperCase() === oldValue.toUpperCase());
                if (index === -1) {
                    throw new Error("Бренд не знайдений");
                }
                store.brands[index] = newValue.toUpperCase();
                store.markModified("brand");
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
    async addDelivery(supplierInfo, storeId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }
            store.rowsDelivery = [supplierInfo, ...store.rowsDelivery]
            store.markModified("rowsDelivery");
            await store.save();
            return store;
        } catch (e) {
            console.error("❌ Помилка в addDelivery():", e)
        }
    }
    async addProduct(productPayload) {
        try {
            console.log(productPayload);
            const store = await StoreModel.findById(productPayload.storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }

            let imageUrl = productPayload.image || null;

            const rowDelivery = store.rowsDelivery.find(row => row.id === productPayload.deliveryId);
            if (!rowDelivery) {
                throw new Error('Доставка не знайдена');
            }

            if (!productPayload.id) {
                let productId = v1();
                rowDelivery.products = [{ ...productPayload, id: productId, image: imageUrl }, ...rowDelivery.products];
                rowDelivery.price = rowDelivery.products.reduce((sum, row) => sum + row.quantity * row.purchasePrice, 0);
                store.rowsAll = [{ ...productPayload, id: productId, image: imageUrl }, ...store.rowsAll];
            } else {
                const existProduct = store.rowsAll.find(p => p.id === productPayload.id);
                rowDelivery.products = [{ ...productPayload, id: existProduct.id, image: imageUrl }, ...rowDelivery.products];
                rowDelivery.price = rowDelivery.products.reduce((sum, row) => sum + row.quantity * row.purchasePrice, 0);

                if (existProduct) {
                    Object.assign(existProduct, {
                        ...productPayload,
                        quantity: existProduct.quantity + productPayload.quantity,
                        image: imageUrl
                    });
                }
            }

            await store.save();
            return store;
        } catch (e) {
            console.error("❌ Помилка в addProduct():", e);
            throw new Error("Не вдалося додати товар");
        }
    }

    async addCustomer(customerInfo, storeId) {
        try {
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error('Магазин не знайдено');
            }

            store.rowsCustomer = [customerInfo, ...store.rowsCustomer]
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
                rowCustomer.products = [{...newProduct, id: v1()}, ...rowCustomer.products];
                rowCustomer.price = rowCustomer.products.reduce((sum, row) =>
                    sum + row.quantity * row.sellingPrice, 0);
        } else {
                const existProduct = store.rowsAll.find(p => p.id === newProduct.id);
                rowCustomer.products = [{...newProduct, id: existProduct.id}, ...rowCustomer.products];
                rowCustomer.price = rowCustomer.products.reduce((sum, row) => sum + row.quantity * row.sellingPrice, 0)
                if (existProduct) {
                    Object.assign(existProduct, {
                        ...newProduct,
                        quantity: existProduct.quantity - newProduct.quantity
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
            console.log('img', productData.image);
            const store = await StoreModel.findById(storeId);
            if (!store) {
                throw new Error("Магазин не знайдено");
            }

            let productInRowsAll = store.rowsAll.find(row => row.id === productData.id);
            let imageUrl = productData.image || null;

            if (imageUrl === null && productInRowsAll?.image) {
                productInRowsAll.image = null;
            }

            if (deliveryId) {
                const rowDelivery = store.rowsDelivery.find(p => p.id === deliveryId);
                const product = rowDelivery?.products.find(p => p.id === productData.id);

                if (product) {
                    Object.assign(product, productData, { image: imageUrl });
                }
                if (productInRowsAll) {
                    Object.assign(productInRowsAll, productData, { image: imageUrl });
                }

                rowDelivery.price = rowDelivery.products.reduce((sum, row) => sum + row.quantity * row.purchasePrice, 0);
            }

            if (!deliveryId && !customerId) {
                Object.assign(productInRowsAll, productData, { image: imageUrl });
                store.markModified("rowsAll");
            }

            if (customerId) {
                const rowCustomer = store.rowsCustomer.find(p => p.id === customerId);
                const product = rowCustomer?.products.find(p => p.id === productData.id);

                if (product) {
                    Object.assign(product, productData, { image: imageUrl });
                }
                if (productInRowsAll) {
                    Object.assign(productInRowsAll, productData, { image: imageUrl });
                }

                rowCustomer.price = rowCustomer.products.reduce((sum, row) => sum + row.quantity * row.sellingPrice, 0);
            }

            await store.save();
            return store;
        } catch (e) {
            console.error("❌ Помилка в ProductService.changeProduct():", e);
            throw new Error("Не вдалося оновити товар");
        }
    }
    async deleteProduct(productData, storeId, deliveryId, customerId) {
        try {
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
                        quantity: productInRowsAll.quantity - deliveryProduct.quantity
                    };
                    store.rowsAll = store.rowsAll.map(p =>
                        p.id === productData.id ? updatedProduct : p
                    );
                    deliveryRow.products = deliveryRow.products.filter(p => p.id !== productData.id);
                }
                deliveryRow.price = deliveryRow.products.reduce((sum, row) => sum + row.quantity * row.purchasePrice, 0)
            }
            if(deliveryId === undefined && customerId===undefined) {
                store.rowsAll = store.rowsAll.filter(p => p.id !== productData.id);
                store.markModified("rowsAll");
                };
            if (customerId) {
                const customerRow = store.rowsCustomer.find(row => row.id === customerId);
                const customerProduct = customerRow.products.find(p => p.id === productData.id);
                if (customerRow) {
                    const updatedProduct = {
                        ...productInRowsAll,
                        quantity: productInRowsAll.quantity + customerProduct.quantity
                    };
                    store.rowsAll = store.rowsAll.map(p =>
                        p.id === productData.id ? updatedProduct : p
                    );
                    customerRow.products = customerRow.products.filter(p => p.id !== productData.id);
                }
                customerRow.price = customerRow.products.reduce((sum, row) => sum + row.quantity * row.sellingPrice, 0)
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