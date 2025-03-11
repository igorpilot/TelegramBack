const mongoose = require('mongoose');

const RowsAllSchema = new mongoose.Schema({
    id: { type: String, required: true },
    category: { type: String, required: false },
    name: { type: String, required: true },
    description: { type: String, required: false },
    brand: { type: String, required: false },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    purchaseTotal: { type: Number, required: false },
    sellingPrice: { type: Number, required: false },
    numberOfDocument: { type: String, required: false },
    delivery: { type: String, required: false },
    date: { type: String, required: false },
});

const RowsDeliverySchema = new mongoose.Schema({
    id: { type: String, required: true },
    numberOfDocument: { type: String, required: false },
    delivery: { type: String, required: false },
    date: { type: String, required: true },
    price: { type: Number, required: true }
});

const RowsArrivalSchema = new mongoose.Schema({
    id: { type: String, required: true },
    category: { type: String, required: false },
    name: { type: String, required: true },
    description: { type: String},
    brand: { type: String, required: false },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: true },
    purchaseTotal: { type: Number, required: true },
    sellingPrice: { type: Number, required: false },
    numberOfDocument: { type: String, required: false },
    delivery: { type: String, required: false },
    date: { type: String, required: false },

});

const RowsCustomerSchema = new mongoose.Schema({
    id: { type: String, required: true },
    nameOfCustomer: { type: String, required: false },
    date: { type: String, required: true },
    price: { type: Number, required: true },
    numberOfOrder: { type: String, required: true }
});

const RowsSalesSchema = new mongoose.Schema({
    id: { type: String, required: true },
    category: { type: String, required: false },
    name: { type: String, required: true },
    description: { type: String },
    brand: { type: String, required: false },
    quantity: { type: Number, required: true },
    purchasePrice: { type: Number, required: false },
    sellingPrice: { type: Number, required: true },
    sellingTotal: { type: Number, required: true },
    nameOfCustomer: { type: String, required: false },
    date: { type: String, required: false },
    numberOfOrder: { type: String, required: true }
});

const StoreSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User'
    },
    title: { type: String, required: true },
    description: { type: String, required: false },
    menu: { type: [String], default: [] },
    supplier: { type: [String], default: [] },
    rowsAll: { type: [RowsAllSchema], default: [] },
    rowsDelivery: { type: [RowsDeliverySchema], default: [] },
    rowsArrival: { type: [RowsArrivalSchema], default: [] },
    rowsCustomer: { type: [RowsCustomerSchema], default: [] },
    rowsSales: { type: [RowsSalesSchema], default: [] },
    numberOfOrder: { type: Number, default: 1000000 }
});

module.exports = mongoose.model('Store', StoreSchema);
