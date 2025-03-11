module.exports = class StoreDTO {
    title;
    description;
    menu;
    supplier;
    rowsAll;
    rowsDelivery;
    rowsArrival;
    rowsCustomer;
    rowsSales;
    numberOfOrder;

    constructor(model) {
        this.title = model.title;
        this.description = model.description;
        this.menu = model.menu;
        this.supplier = model.supplier;
        this.rowsAll = model.rowsAll;
        this.rowsDelivery = model.rowsDelivery;
        this.rowsArrival = model.rowsArrival;
        this.rowsCustomer = model.rowsCustomer;
        this.rowsSales = model.rowsSales;
        this.numberOfOrder = model.numberOfOrder;
    }

}