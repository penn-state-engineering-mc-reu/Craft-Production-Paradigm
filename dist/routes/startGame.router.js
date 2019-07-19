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
const express_1 = require("express");
const cors = require("cors");
function createRoutes(controller) {
    const router = express_1.Router();
    router.post('/', cors(), (req, res) => __awaiter(this, void 0, void 0, function* () {
        let result = { "pin": 0 };
        result.pin = yield controller.addNewGame(req);
        res.send(result);
    }));
    router.post('/joinGame/:id', (req, res) => {
        controller.joinGame(parseInt(req.params.id), req.body.position);
        res.status(200).send('OK');
    });
    router.get('/getGameInfo/:id', cors(), (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.send(yield controller.getGameInfo(parseInt(req.params.id)));
    }));
    router.get('/addActivePlayer/:id', cors(), (req, res) => {
        controller.addActivePlayer(parseInt(req.params.id));
        res.sendStatus(200);
    });
    router.get('/removeActivePlayer/:id/:position', cors(), (req, res) => {
        controller.removeActivePlayer(parseInt(req.params.id), req.params.position);
        res.sendStatus(200);
    });
    router.get('/checkIfPinExists/:id', cors(), (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.send(yield controller.checkIfPinExists(parseInt(req.params.id)));
    }));
    router.get('/getPossiblePositions/:id', cors(), (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.send(yield controller.getPossiblePositions(parseInt(req.params.id)));
    }));
    return router;
    // if I create self-contained functions, I can write them like this
    //router.post('/', new GameController().addNewGame);
}
exports.createRoutes = createRoutes;
//# sourceMappingURL=startGame.router.js.map