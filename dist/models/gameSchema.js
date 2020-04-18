"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const partInventory_1 = require("./partInventory");
const polyfill_1 = require("../polyfill");
const gameObjects_1 = require("../shared/gameObjects");
const Schema = mongoose.Schema;
class PositionInfo {
    constructor() {
        this.positionName = String();
        this.playerName = String();
    }
}
exports.PositionInfo = PositionInfo;
// export class CraftPositionInfo extends PositionInfo {
//   static POSITION_NAMES = GameObjects.GameTypes.CraftProduction.Positions; // {CUSTOMER: 'Customer', MANUFACTURER: 'Manufacturer', SUPPLIER: 'Supplier', ASSEMBLER: 'Assembler'};
// }
//
// export class MassPositionInfo extends PositionInfo {
//   static POSITION_NAMES = GameObjects.GameTypes.MassProduction.Positions; // {CUSTOMER: 'Customer', MANUFACTURER: 'Manufacturer', SUPPLIER: 'Supplier',
//     // ASSEMBLER_BODY: 'Assembler - Body', ASSEMBLER_WHEEL_AXLE: 'Assembler - Wheel and Axle', ASSEMBLER_INTERIOR: 'Assembler - Interior'};
// }
function getTypeInfoByName(typeName) {
    let typeKey = Object.keys(gameObjects_1.GameObjects.GameTypes).find(value => gameObjects_1.GameObjects.GameTypes[value].name === typeName);
    if (typeKey !== undefined) {
        return gameObjects_1.GameObjects.GameTypes[typeKey];
    }
    else {
        throw 'Invalid game type.';
    }
}
exports.getTypeInfoByName = getTypeInfoByName;
function getAllPositions(typeName) {
    return polyfill_1.objectValues(getTypeInfoByName(typeName).positions);
}
exports.getAllPositions = getAllPositions;
// Use a single schema for now, since only position names differ; creating two schemas would involve creating two
// collections for games, which would involve significant refactoring.
let allPositions = {};
Object.assign(allPositions, gameObjects_1.GameObjects.GameTypes.CraftProduction.positions);
Object.assign(allPositions, gameObjects_1.GameObjects.GameTypes.MassProduction.positions);
let maxSchemaPlayers = Object.keys(gameObjects_1.GameObjects.GameTypes).map(value => Object.keys(gameObjects_1.GameObjects.GameTypes[value].positions).length).reduce((previousValue, currentValue) => Math.max(previousValue, currentValue));
// console.log(maxSchemaPlayers.toString() + " max players");
exports.PositionInfoSchema = new Schema({
    positionName: { type: String, enum: polyfill_1.objectValues(allPositions).map(value => value.name) },
    playerName: { type: String }
});
let gameTypeNameArray = Object.keys(gameObjects_1.GameObjects.GameTypes).map(value => gameObjects_1.GameObjects.GameTypes[value].name);
exports.GameScheme = new Schema({
    pin: { type: Number, min: 0, max: 9999 },
    groupName: { type: String },
    gameType: { type: String, enum: gameTypeNameArray },
    status: { type: String },
    maxPlayers: { type: Number, min: 2, max: maxSchemaPlayers },
    activePlayers: { type: Number, min: 0, max: maxSchemaPlayers },
    positions: { type: [exports.PositionInfoSchema], default: new Array() },
    createdDate: {
        type: Date,
        default: Date.now
    },
    assemblerParts: { type: partInventory_1.PartInventoryScheme, default: new Array() }
});
exports.GameScheme.methods.getPosition = function (positionName) {
    return this.positions.find((value) => value.positionName === positionName);
};
exports.GameScheme.methods.getCustomer = function () {
    let positionName;
    switch (this.gameType) {
        case gameObjects_1.GameObjects.GameTypes.CraftProduction.name:
            positionName = gameObjects_1.GameObjects.GameTypes.CraftProduction.positions.CUSTOMER.name;
            break;
        default:
            throw 'Customer position not available for this game type.';
    }
    return this.getPosition(positionName);
};
exports.GameScheme.methods.getManufacturer = function () {
    let positionName;
    switch (this.gameType) {
        case gameObjects_1.GameObjects.GameTypes.CraftProduction.name:
            positionName = gameObjects_1.GameObjects.GameTypes.CraftProduction.positions.MANUFACTURER.name;
            break;
        case gameObjects_1.GameObjects.GameTypes.MassProduction.name:
            positionName = gameObjects_1.GameObjects.GameTypes.MassProduction.positions.MANUFACTURER.name;
            break;
        default:
            throw 'Manufacturer position not available for this game type.';
    }
    return this.getPosition(positionName);
};
//# sourceMappingURL=gameSchema.js.map