export default class UserDTO {
    role;
    firstName;
    lastName;
    phoneNumber;
    email;
    _id;
    isActivated;
    stores;

    constructor(model) {
        this.role = model.role;
        this.firstName = model.firstName;
        this.lastName = model.lastName;
        this.phoneNumber = model.phoneNumber;
        this.email = model.email;
        this._id = model._id;
        this.isActivated = model.isActivated;
        this.stores = model.stores;
    }

}