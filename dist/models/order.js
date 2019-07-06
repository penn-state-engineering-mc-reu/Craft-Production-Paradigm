"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class CustomOrderInfo {
    constructor(desc, image) {
        this.orderDesc = desc;
        this.orderImage = image;
    }
}
class Order {
    constructor(pin) {
        this.customOrderInfo = null;
        this.pin = pin;
        this._id = this.generateId();
        this.createDate = new Date().getTime();
        this.status = "In Progress";
        this.stage = "Manufacturer";
        this.modelID = -1;
        this.lastModified = this.createDate;
        this.finishedTime = -1;
        this.manufacturerReq = new Array();
        this.supplyOrders = new Array();
        this.assembledModel = {};
        this.colors = new Array();
    }
    setLastModified() {
        this.lastModified = new Date().getTime();
    }
    setFinished() {
        this.finishedTime = new Date().getTime();
    }
    /**
     * This should generally be random enough to handle a couple order ids
     * This isn't a permenant solution; it works well enough for me
     * Found on Github: https://gist.github.com/gordonbrander/2230317
     */
    generateId() {
        // Math.random should be unique because of its seeding algorithm.
        // Convert it to base 36 (numbers + letters), and grab the first 9 characters
        // after the decimal.
        return '_' + Math.random().toString(36).substr(2, 9);
    }
    ;
    setStatus(status) {
        this.setLastModified();
        this.status = status;
    }
    setStage(stage) {
        this.setLastModified();
        this.stage = stage;
    }
    setModelID(type) {
        this.setLastModified();
        this.modelID = type;
        this.customOrderInfo = null;
    }
    setCustomOrder(desc, image) {
        this.setLastModified();
        this.customOrderInfo = new CustomOrderInfo(desc, image);
    }
    // Allows me to easily convert the object and store it into the mongoDB database
    toJSON() {
        return __awaiter(this, void 0, void 0, function* () {
            let jsonObj = {
                "_id": this._id,
                "pin": this.pin,
                "createDate": this.createDate,
                "lastModified": this.lastModified,
                "finishedTime": this.finishedTime,
                "status": this.status,
                "stage": this.stage,
                "modelID": this.modelID,
                "isCustomOrder": (!!this.customOrderInfo),
                "orderDesc": (this.customOrderInfo ? this.customOrderInfo.orderDesc : null),
                "imageData": (this.customOrderInfo ? yield this.customOrderInfo.orderImage.toBuffer() : null),
                "manufacturerReq": this.manufacturerReq,
                "supplyOrders": this.supplyOrders,
                "colors": this.colors,
                "assembledModel": this.assembledModel
            };
            return jsonObj;
        });
    }
}
exports.default = Order;
//# sourceMappingURL=order.js.map