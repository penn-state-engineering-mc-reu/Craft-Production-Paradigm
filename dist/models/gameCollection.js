"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const gameSchema_1 = require("./gameSchema");
function makeCollection(dbConnection) {
    return dbConnection.getConnection().model('Game', gameSchema_1.GameScheme, 'games');
}
exports.makeCollection = makeCollection;
//# sourceMappingURL=gameCollection.js.map