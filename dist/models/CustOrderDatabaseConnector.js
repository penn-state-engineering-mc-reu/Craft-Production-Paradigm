"use strict";
/**
 * This class handles any actual game logic
 */
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
class CustOrderDatabaseConnector {
    constructor(dbConnection) {
        this.orderModel = dbConnection.getCustOrderCollection();
    }
    /**
     * This will add the order to the game object's array
     * @param pin
     * @param order JSON Object that holds all the order details
     */
    addOrder(order) {
        return __awaiter(this, void 0, void 0, function* () {
            let newModel = new this.orderModel(order);
            return newModel.save();
        });
    }
    getOrder(pin, orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.orderModel.findOne({ pin: parseInt(pin), _id: orderID }, { 'imageData': 0 }).exec();
        });
    }
    getCustomOrderImage(pin, orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            let orderInfo = yield this.orderModel.findOne({ pin: parseInt(pin), _id: orderID }, { 'imageData': 1 });
            if (orderInfo) {
                if (orderInfo.imageData) {
                    return Promise.resolve(orderInfo.imageData);
                }
                else {
                    return Promise.reject('No image found for the requested order');
                }
            }
            else {
                return Promise.reject('No information found for the requested order');
            }
        });
    }
    /**
     * Gets all of the orders that are part of the same session
     * @param pin
     */
    getOrders(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield this.orderModel.find({ pin: parseInt(pin) }, { 'imageData': 0 }));
            }
            catch (e) {
                return new Array();
            }
        });
    }
    /*// This happens at the supplier stage
    // I don't know why I have two functions that essentially do the same thing (idgaf at this point)
    // fixed: they no longer do the same thing
    public addSupplyOrder(pin: string, orderId: string, order: Array<number>, colors: Array<string>): void {
      let time: number = new Date().getTime();
      let update: Object = {$set: {supplyOrders: order, colors: colors, lastModified: time, stage: 'Assembler'}};
      this.orderModel.update({pin: parseInt(pin), _id: orderId}, update).exec();
    }*/
    /*  public async getSupplyOrder(pin: string, orderId: string): Promise<Array<number>> {
        let orders = await this.orderModel.findOne({pin: parseInt(pin), _id: orderId}, {supplyOrders: 1});
    
        if(orders) {
          return orders.supplyOrders;
        }
        else
        {
          return new Array<number>();
        }
      }*/
    /*public async getColors(pin: string, orderId: string): Promise<Array<string>> {
      try {
        let query = {pin: parseInt(pin), _id: orderId};
        let fields = {colors: 1};
        let result = await this.orderModel.findOne(query, fields);
        if (result == null) return new Array<string>();
        return result.colors;
      } catch(e) {
        console.log(e);
        return new Array<any>();
      }
    }*/
    // this is used in the assembler stage
    updatePieces(pin, orderId, pieces) {
        if (pieces != null && pieces != undefined) {
            let time = new Date().getTime();
            let update = { $set: { supplyOrders: pieces, lastModified: time } };
            this.orderModel.update({ pin: parseInt(pin), _id: orderId }, update).exec();
            return 200;
        }
        return 400;
    }
    /**
     * Updates the assembled model in the database
     * Also assumed that the process has been finishes so status is changed
     * and time completed is recorded
     * @param pin
     * @param orderId
     * @param model
     */
    updateAssembledModel(pin, orderId, model) {
        if (model != null && model != undefined) {
            let time = new Date().getTime();
            let update = { $set: { assembledModel: model, status: 'Completed', finishedTime: time, stage: 'Inspection' } };
            this.orderModel.update({ pin: parseInt(pin), _id: orderId }, update).exec();
            return 200;
        }
        return 400;
    }
    getAssembledModel(pin, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                let query = { pin: parseInt(pin), _id: orderId.toString() };
                let projection = { assembledModel: 1 };
                let foundOrder = yield this.orderModel.findOne(query, projection);
                if (foundOrder) {
                    return foundOrder.assembledModel;
                }
                else {
                    return '';
                }
            }
            catch (e) {
                console.log(e);
                return '';
            }
        });
    }
    /*
    public async getManufacturerRequest(pin: string, orderId: string): Promise<Array<number>> {
      try {
        let request: (ICustomerOrder | null) = await this.orderModel.findOne({pin: parseInt(pin), _id: orderId}, {manufacturerReq: 1});
        if(request) {
          return request.manufacturerReq;
        }
        else
        {
          return new Array<number>();
        }
      } catch(e) {
        return new Array<number>();
      }
    }
    */
    /**
     * Once the manufacturer request is sent, the time modified is updated and the game goes to the supplier stage
     * @param pin
     * @param orderId
     * @param request
     */
    /*public updateManufacturerRequest(pin: string, orderId: string, request: Array<number>): number {
      if (request != null && request != undefined) {
        let time: number = new Date().getTime();
        let update: Object = {$set: {manufacturerReq: request, stage: 'Supplier', lastModified: time}};
        this.orderModel.update({pin: parseInt(pin), _id: orderId}, update).exec();
        return 200;
      }
      return 400;
    }*/
    acceptOrder(pin, orderId) {
        try {
            let update = { $set: { status: 'Completed', stage: 'Sent to Customer' } };
            this.orderModel.update({ pin: parseInt(pin), _id: orderId }, update).exec();
            return 200;
        }
        catch (e) {
            return 400;
        }
    }
    setOrderStage(pin, orderID, newStage) {
        return __awaiter(this, void 0, void 0, function* () {
            let time = new Date().getTime();
            return this.orderModel.findOneAndUpdate({ pin: pin, _id: orderID }, {
                $set: {
                    lastModified: time,
                    stage: newStage
                }
            }).exec();
        });
    }
    /**
     * If the user doesn't approve the model, the game will turn back to the supplier stage
     * @param pin
     * @param orderId
     */
    rejectOrder(pin, orderId) {
        try {
            let time = new Date().getTime();
            let update = { $set: { status: 'In Progress', stage: 'Supplier', lastModified: time, assembledModel: null, finishedTime: -1 } };
            this.orderModel.update({ pin: parseInt(pin), _id: orderId }, update).exec();
            return 200;
        }
        catch (e) {
            return 400;
        }
    }
}
exports.CustOrderDatabaseConnector = CustOrderDatabaseConnector;
//# sourceMappingURL=CustOrderDatabaseConnector.js.map