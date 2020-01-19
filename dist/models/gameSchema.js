"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const partInventory_1 = require("./partInventory");
const polyfill_1 = require("../polyfill");
const Schema = mongoose.Schema;
exports.GAME_TYPES = { CRAFT_PRODUCTION: 'Craft Production', MASS_PRODUCTION: 'Mass Production' };
class PositionInfo {
    constructor() {
        this.positionName = String();
        this.playerName = String();
    }
}
PositionInfo.POSITION_NAMES = { CUSTOMER: 'Customer', MANUFACTURER: 'Manufacturer', SUPPLIER: 'Supplier', ASSEMBLER: 'Assembler' };
exports.PositionInfo = PositionInfo;
exports.PositionInfoSchema = new Schema({
    positionName: { type: String, enum: polyfill_1.objectValues(PositionInfo.POSITION_NAMES) },
    playerName: { type: String }
});
exports.GameScheme = new Schema({
    pin: { type: Number, min: 0, max: 9999 },
    groupName: { type: String },
    gameType: { type: String, enum: polyfill_1.objectValues(exports.GAME_TYPES) },
    status: { type: String },
    maxPlayers: { type: Number, min: 2, max: 4 },
    activePlayers: { type: Number, min: 0, max: 4 },
    positions: { type: [exports.PositionInfoSchema], default: new Array() },
    createdDate: {
        type: Date,
        default: Date.now
    },
    assemblerParts: { type: partInventory_1.PartInventoryScheme, default: new Array() }
});
//# sourceMappingURL=gameSchema.js.map