"use strict";
/**
 * This class handles all of the Game Settings
 * and anything involved with starting or joining games
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
// let noop = (err: any, raw: any) => {};
class GameDatabaseConnector {
    constructor(dbConnection) {
        this.gameCollection = dbConnection.getGameCollection();
    }
    /**
     * This takes the passed in game object and adds it to the database
     * @param game Scheme created earlier
     */
    addToDatabase(game) {
        let newGame = new this.gameCollection(game);
        newGame.save();
    }
    /**
     * Returns whether or not a pin already exists
     * This is to avoid games from having the same pin
     * @param pin Identifier
     */
    checkIfPinExists(pinNum) {
        return __awaiter(this, void 0, void 0, function* () {
            let result = yield this.gameCollection.findOne({ pin: pinNum });
            return result != undefined && result != null;
        });
    }
    /**
     * Increments the active players by one whenever a new player joins the game
     * @param pinNum string
     */
    addActivePlayer(pinNum) {
        console.log(`Adding active player for ${pinNum} (a ${typeof pinNum}).`);
        this.gameCollection.update({ pin: pinNum }, { $inc: { activePlayers: 1 } }).exec();
    }
    /**
     * When someone needs to exit the application, this handles removing the active player
     * it will also delete the database entry, if there are no active players
     * @param pinNum string
     */
    removeActivePlayer(pinNum, position) {
        let query = { pin: pinNum };
        let change = { $inc: { activePlayers: -1 }, $pull: { positions: position } };
        this.gameCollection.update(query, change, () => {
            this.gameCollection.findOne(query, (err, result) => {
                if (err)
                    console.log(err);
                if (result.activePlayers <= 0)
                    this.gameCollection.deleteOne(query).exec();
            });
        });
    }
    /**
     * Used for when looking up the game by pin
     * @param pinNum number
     */
    getGameObject(pinNum) {
        return __awaiter(this, void 0, void 0, function* () {
            try {
                return (yield this.gameCollection.findOne({ pin: pinNum }));
            }
            catch (e) {
                return null;
            }
        });
    }
    /**
     * Makes sure two users don't end up with the same positions
     * If no positions are returned, the game is full
     * @param pinNum string
     */
    getPossiblePositions(pinNum) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.gameCollection.findOne({ pin: pinNum }, { positions: 1 });
        });
    }
    joinGame(pinNum, position) {
        if (position != null && position != undefined)
            this.gameCollection.update({ pin: pinNum }, { $push: { positions: position } }).exec();
    }
    getAssemblerParts(pinNum) {
        return __awaiter(this, void 0, void 0, function* () {
            let gameObj = yield this.gameCollection.findOne({ pin: pinNum }, { assemblerParts: 1 }).exec();
            if (gameObj) {
                return Promise.resolve(gameObj.assemblerParts.slice());
            }
            else {
                return Promise.resolve(null);
            }
        });
    }
    setAssemblerParts(pinNum, newParts) {
        return __awaiter(this, void 0, void 0, function* () {
            yield this.gameCollection.findOneAndUpdate({ pin: pinNum }, {
                $set: {
                    assemblerParts: newParts
                }
            });
        });
    }
}
exports.GameDatabaseConnector = GameDatabaseConnector;
//# sourceMappingURL=GameDatabaseConnector.js.map