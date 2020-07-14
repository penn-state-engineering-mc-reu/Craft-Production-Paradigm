"use strict";
/**
 * Controller handles all of the game logic
 * i.e. Things that deal with the orders
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
const CustOrderDatabaseConnector_1 = require("../models/CustOrderDatabaseConnector");
const orderImage_1 = require("../models/orderImage");
const SupplierOrderDatabaseConnector_1 = require("../models/SupplierOrderDatabaseConnector");
const gameObjects_1 = require("../shared/gameObjects");
class GameLogicController {
    constructor(dbClient, gameController) {
        this.gameController = gameController;
        this.custOrderDBConnector = new CustOrderDatabaseConnector_1.CustOrderDatabaseConnector(dbClient);
        this.supplierOrderDBConnector = new SupplierOrderDatabaseConnector_1.SupplierOrderDatabaseConnector(dbClient);
    }
    placeOrder(pin, modelID) {
        return __awaiter(this, void 0, void 0, function* () {
            let gameObj = yield this.gameController.getGameInfo(pin);
            if (gameObj !== null) {
                let custPosition = gameObj.getCustomer();
                if (custPosition !== undefined) {
                    let order = {
                        pin: pin, modelID: modelID,
                        createdBy: custPosition.playerName
                    };
                    yield this.custOrderDBConnector.addOrder(order);
                }
            }
        });
    }
    placeCustomOrder(pin, orderDesc, imageData) {
        return __awaiter(this, void 0, void 0, function* () {
            let gameObj = yield this.gameController.getGameInfo(pin);
            if (gameObj !== null) {
                let custPosition = gameObj.getCustomer();
                if (custPosition !== undefined) {
                    let order = {
                        pin: pin, isCustomOrder: true, orderDesc: orderDesc, imageData: yield (new orderImage_1.OrderImage(imageData)).toBuffer(),
                        createdBy: custPosition.playerName
                    };
                    yield this.custOrderDBConnector.addOrder(order);
                }
            }
        });
    }
    /*
    private generateOrders(pin: number, max:number, skew: number): void {
      for (let i: number = 0; i < max; i++) {
        let order = new Order(pin);
        let ID: number = Math.ceil(this.normalDistribution(skew));
        order.setModelID(ID);
        order.setStage('Manufacturer');
        this.db.addOrder(order.toJSON());
      }
    }
    */
    /**
     * Found on StackOverflow
     * https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
     * @param min
     * @param max
     * @param skew
     */
    /*  private normalDistribution(skew: number): number {
        const min: number = 0;
        const max: number = 4;
        var u = 0, v = 0;
        while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
        while(v === 0) v = Math.random();
        let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );
    
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0) num = this.normalDistribution(skew); // resample between 0 and 1 if out of range
        num = Math.pow(num, skew); // Skew
        num *= max - min; // Stretch to fill range
        num += min; // offset to min
        return num;
      }*/
    getOrder(pin, orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.custOrderDBConnector.getOrder(pin, orderID);
        });
    }
    getOrders(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.custOrderDBConnector.getOrders(pin);
        });
    }
    getCustomOrderImage(pin, orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.custOrderDBConnector.getCustomOrderImage(pin, orderID);
        });
    }
    completeSupplyOrder(pin, orderId, parts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield Promise.all([
                this.supplierOrderDBConnector.completeOrder(pin, orderId, parts),
                this.gameController.addAssemblerParts(pin, parts)
            ]);
        });
    }
    forwardManufacturerOrder(pin, orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.custOrderDBConnector.setOrderStage(pin, orderID, gameObjects_1.GameObjects.GameTypes.CraftProduction.custOrderStages.AT_ASSEMBLER.name);
        });
    }
    /*public async getSupplyOrder(pin: number, orderId: string): Promise<Array<PartInventory>> {
      return await this.supplierOrderDBConnector.getSupplyOrder(pin, orderId);
    }*/
    /*public async getColors(pin: number, orderId: string): Promise<Array<any>> {
      let result = await this.custOrderDBConnector.getColors(pin, orderId);
      return result;
    }*/
    /*  public updatePieces(pin: string, orderId: string, pieces: Array<number>): number {
        return this.custOrderDBConnector.updatePieces(pin, orderId, pieces);
      }*/
    updateAssembledModel(pin, orderId, model) {
        return __awaiter(this, void 0, void 0, function* () {
            let gameInfo = yield this.gameController.getGameInfo(pin);
            let craftStages = gameObjects_1.GameObjects.GameTypes.CraftProduction.custOrderStages, massStages = gameObjects_1.GameObjects.GameTypes.MassProduction.custOrderStages;
            if (gameInfo !== null) {
                switch (gameInfo.gameType) {
                    case gameObjects_1.GameObjects.GameTypes.CraftProduction.name:
                        return this.custOrderDBConnector.updateAssembledModel(pin, orderId, model, true, craftStages.INSPECTION.name);
                    case gameObjects_1.GameObjects.GameTypes.MassProduction.name:
                        let orderInfo = yield this.custOrderDBConnector.getOrder(pin, orderId);
                        if (orderInfo !== null) {
                            let newStage;
                            try {
                                newStage = gameObjects_1.GameObjects.GameTypes.MassProduction.getCustOrderModelDest(orderInfo.stage).name;
                            }
                            catch (ex) {
                                return Promise.reject(ex);
                            }
                            return this.custOrderDBConnector.updateAssembledModel(pin, orderId, model, false, newStage);
                        }
                }
            }
        });
    }
    getAssembledModel(pin, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.custOrderDBConnector.getAssembledModel(pin, orderId);
        });
    }
    /*  public async getManufacturerRequest(pin: number, orderId: string): Promise<ISupplierOrder | null> {
        return await this.supplierOrderDBConnector.getManufacturerRequest(pin, orderId);
      }*/
    addSupplyOrder(pin, request) {
        return __awaiter(this, void 0, void 0, function* () {
            console.log("At controller: " + JSON.stringify(request));
            let gameObj = yield this.gameController.getGameInfo(pin);
            if (gameObj !== null) {
                let manufPosition = gameObj.getManufacturer();
                if (manufPosition !== undefined) {
                    return this.supplierOrderDBConnector.addOrder(pin, manufPosition.playerName, request);
                }
                else {
                    return Promise.reject('No manufacturer exists for this game.');
                }
            }
            else {
                return Promise.reject('The game specified does not exist.');
            }
        });
    }
    getSupplyOrders(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.supplierOrderDBConnector.getSupplyOrders(pin);
        });
    }
    acceptOrder(pin, orderId) {
        return this.custOrderDBConnector.acceptOrder(pin, orderId);
    }
    rejectOrder(pin, orderId) {
        return this.custOrderDBConnector.rejectOrder(pin, orderId);
    }
}
exports.GameLogicController = GameLogicController;
//# sourceMappingURL=GameLogicController.js.map