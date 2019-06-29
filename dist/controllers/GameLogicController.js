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
const GameLogicDatabaseConnector_1 = require("../controllers/GameLogicDatabaseConnector");
const order_1 = require("../models/order");
class GameLogicController {
    constructor() {
        this.db = new GameLogicDatabaseConnector_1.GameLogicDatabaseConnector();
    }
    placeOrder(pin, modelID, generated, max, skew) {
        if (generated == true) {
            this.generateOrders(pin, max, skew);
        }
        else {
            let order = new order_1.default(pin);
            order.setModelID(modelID);
            order.setStage('Manufacturer');
            this.db.addOrder(order.toJSON());
        }
    }
    generateOrders(pin, max, skew) {
        for (let i = 0; i < max; i++) {
            let order = new order_1.default(pin);
            let ID = Math.ceil(this.normalDistribution(skew));
            order.setModelID(ID);
            order.setStage('Manufacturer');
            this.db.addOrder(order.toJSON());
        }
    }
    /**
     * Found on StackOverflow
     * https://stackoverflow.com/questions/25582882/javascript-math-random-normal-distribution-gaussian-bell-curve
     * @param min
     * @param max
     * @param skew
     */
    normalDistribution(skew) {
        const min = 0;
        const max = 4;
        var u = 0, v = 0;
        while (u === 0)
            u = Math.random(); //Converting [0,1) to (0,1)
        while (v === 0)
            v = Math.random();
        let num = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
        num = num / 10.0 + 0.5; // Translate to 0 -> 1
        if (num > 1 || num < 0)
            num = this.normalDistribution(skew); // resample between 0 and 1 if out of range
        num = Math.pow(num, skew); // Skew
        num *= max - min; // Stretch to fill range
        num += min; // offset to min
        return num;
    }
    getOrder(pin, orderID) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.getOrder(pin, orderID);
        });
    }
    getOrders(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.getOrders(pin);
        });
    }
    addSupplyOrder(pin, order, colors) {
        this.db.addSupplyOrder(pin, order, colors);
    }
    getSupplyOrder(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.getSupplyOrder(pin);
        });
    }
    getColors(pin, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.db.getColors(pin, orderId);
            return result;
        });
    }
    updatePieces(pin, orderId, pieces) {
        return this.db.updatePieces(pin, orderId, pieces);
    }
    updateAssembledModel(pin, orderId, model) {
        return this.db.updateAssembledModel(pin, orderId, model);
    }
    getAssembledModel(pin, orderId) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.getAssembledModel(pin, orderId);
        });
    }
    getManufacturerRequest(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.getManufacturerRequest(pin);
        });
    }
    updateManufacturerRequest(pin, request) {
        return this.db.updateManufacturerRequest(pin, request);
    }
    acceptOrder(pin, orderId) {
        return this.db.acceptOrder(pin, orderId);
    }
    rejectOrder(pin, orderId) {
        return this.db.rejectOrder(pin, orderId);
    }
}
exports.GameLogicController = GameLogicController;
//# sourceMappingURL=GameLogicController.js.map