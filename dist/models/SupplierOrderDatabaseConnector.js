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
class SupplierOrderDatabaseConnector {
    constructor(dbConnection) {
        this.orderModel = dbConnection.getSupplierOrderCollection();
    }
    addOrder(pin, createdBy, manufRequest) {
        return __awaiter(this, void 0, void 0, function* () {
            let newModel = new this.orderModel({ pin: pin, createdBy: createdBy, manufacturerReq: manufRequest });
            return newModel.save();
        });
    }
    /*public async getManufacturerRequest(pin: number, orderId: string): Promise<ISupplierOrder | null> {
        return await this.orderModel.findOne({pin: pin, _id: orderId}, {manufacturerReq: 1});
    }

    public async getSupplyOrder(pin: number, orderId: string): Promise<Array<PartInventory>> {
        let orders = await this.orderModel.findOne({pin: parseInt(pin), _id: orderId}, {supplyOrders: 1});

        if(orders) {
            return orders.supplyOrders;
        }
        else
        {
            return new Array<PartInventory>();
        }
    }*/
    getSupplyOrders(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.orderModel.find({ pin: pin }).exec();
        });
    }
    completeOrder(gamePin, orderID, supplierParts) {
        return __awaiter(this, void 0, void 0, function* () {
            let time = new Date().getTime();
            return this.orderModel.findOneAndUpdate({ pin: gamePin, _id: orderID }, { $set: {
                    supplyOrders: supplierParts,
                    lastModified: time,
                    finishedTime: time,
                    status: 'Completed'
                } }).exec();
        });
    }
}
exports.SupplierOrderDatabaseConnector = SupplierOrderDatabaseConnector;
//# sourceMappingURL=SupplierOrderDatabaseConnector.js.map