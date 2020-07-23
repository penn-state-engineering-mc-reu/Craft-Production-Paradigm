"use strict";
/**
 * This controller handles the game and setup
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
const mongoose = require("mongoose");
const gameSchema_1 = require("../models/gameSchema");
const GameDatabaseConnector_1 = require("../models/GameDatabaseConnector");
const Game = mongoose.model('Game', gameSchema_1.GameScheme);
class GameController {
    constructor(dbClient, timerManager) {
        this.db = new GameDatabaseConnector_1.GameDatabaseConnector(dbClient);
        this.timerManager = timerManager;
    }
    /**
     * Takes data sent and creates database entry
     * @param req
     */
    addNewGame(req) {
        return __awaiter(this, void 0, void 0, function* () {
            let requestGame = req.body;
            requestGame.pin = yield this.generatePin();
            requestGame.maxPlayers = Object.keys(gameSchema_1.getTypeInfoByName(requestGame.gameType).positions).length;
            let game = new Game(requestGame);
            this.db.addToDatabase(game);
            return requestGame.pin;
        });
    }
    joinGame(pin, positionName, playerName) {
        this.db.joinGame(pin, { positionName: positionName, playerName: playerName });
    }
    /**
     * Gets all of the game info from database using the pin
     * @param pin JavaScript decided for me that it will be a string
     */
    getGameInfo(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.getGameObject(pin);
        });
    }
    addActivePlayer(pin) {
        this.db.addActivePlayer(pin);
    }
    removeActivePlayer(pin, position) {
        this.db.removeActivePlayer(pin, position);
    }
    getPlayerName(pin, position) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.getPlayerName(pin, position);
        });
    }
    checkIfPinExists(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            return yield this.db.checkIfPinExists(pin);
        });
    }
    getPossiblePositions(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.getPossiblePositions(pin);
        });
    }
    getAssemblerParts(pin) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.getAssemblerParts(pin);
        });
    }
    setAssemblerParts(pin, newParts) {
        return __awaiter(this, void 0, void 0, function* () {
            return this.db.setAssemblerParts(pin, newParts);
        });
    }
    addAssemblerParts(pin, newParts) {
        return __awaiter(this, void 0, void 0, function* () {
            let assemblerParts = yield this.db.getAssemblerParts(pin);
            if (assemblerParts) {
                newParts.forEach(thisNewPart => {
                    // Checked twice because TypeScript won't change the data type if a null check occurs in an outer block
                    if (assemblerParts) {
                        let matchedExistingIndex = assemblerParts.findIndex(function (thisExistingPart) {
                            return (thisExistingPart.partID === thisNewPart.partID && thisExistingPart.color === thisNewPart.color);
                        });
                        if (matchedExistingIndex !== -1) {
                            assemblerParts[matchedExistingIndex].count += thisNewPart.count;
                        }
                        else {
                            assemblerParts.push(thisNewPart);
                        }
                    }
                });
                yield this.db.setAssemblerParts(pin, assemblerParts);
            }
            else {
                yield this.db.setAssemblerParts(pin, newParts);
            }
        });
    }
    /**
     * Generates a pin and makes sure the pin doesn't already exist in the db
     */
    generatePin() {
        return __awaiter(this, void 0, void 0, function* () {
            let notOriginal = true;
            let pin = Math.floor(Math.random() * 9999);
            while (notOriginal) {
                let result = yield this.db.checkIfPinExists(pin);
                notOriginal = result;
                if (notOriginal)
                    pin = Math.floor(Math.random() * 9999);
            }
            return pin;
        });
    }
}
exports.GameController = GameController;
//# sourceMappingURL=GameController.js.map