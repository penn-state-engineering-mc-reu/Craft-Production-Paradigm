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
const multer = require("multer");
function createRoutes(controller) {
    const router = express_1.Router();
    let fileUpload = multer();
    router.post('/sendOrder', fileUpload.single('custom-order-image'), (req, res) => __awaiter(this, void 0, void 0, function* () {
        let pin = parseInt(req.body.pin);
        if (req.body.model) {
            let modelID = parseInt(req.body.model);
            yield controller.placeOrder(pin, modelID);
        }
        else {
            let modelDesc = req.body['custom-order-desc'];
            let modelImageData = req.file;
            yield controller.placeCustomOrder(pin, modelDesc, modelImageData.buffer);
        }
        res.status(200).send('OK');
    }));
    router.get('/getOrder/:id/:orderID', (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.send(yield controller.getOrder(req.params.id, req.params.orderID));
    }));
    router.get('/getCustomOrderImage/:id/:orderID', (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.setHeader('Content-Type', 'image/png');
        res.send(yield controller.getCustomOrderImage(req.params.id, req.params.orderID));
    }));
    router.get('/getOrders/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.send(yield controller.getOrders(req.params.id));
    }));
    router.post('/sendSupplyOrder/:id/:orderID', (req, res) => __awaiter(this, void 0, void 0, function* () {
        yield controller.completeSupplyOrder(req.params.id, req.params.orderID, req.body.order);
        res.status(200).send('OK');
    }));
    /*  router.get('/getSupplyOrder/:id/:orderId', async (req: Request, res: Response) => {
        res.send(await controller.getSupplyOrder(req.params.id, req.params.orderId));
      });*/
    /*router.get('/colors/:id/:orderId', async (req: Request, res: Response) => {
      let result = await controller.getColors(req.params.id, req.params.orderId);
      res.send(result);
    });*/
    router.post('/forwardManufacturerOrder/:id/:orderID', (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.send(yield controller.forwardManufacturerOrder(req.params.id, req.params.orderID));
    }));
    router.post('/updatePieces/:id/:orderId', (req, res) => {
        res.send(controller.updatePieces(req.params.id, req.params.orderId, req.body.pieces));
    });
    router.post('/sendAssembledModel/:id/:orderId', (req, res) => {
        console.log('Assembled model has been sent');
        res.send(controller.updateAssembledModel(req.params.id, req.params.orderId, req.body.model));
    });
    router.get('/getAssembledModel/:id/:orderId', (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.send(yield controller.getAssembledModel(req.params.id, req.params.orderId));
    }));
    /*  router.get('/getManufacturerRequest/:id/:orderId', async (req: Request, res: Response) => {
        res.send(await controller.getManufacturerRequest(parseInt(req.params.id), req.params.orderId));
      });*/
    router.post('/addSupplyOrder/:id', (req, res) => {
        res.send(controller.addSupplyOrder(req.params.id, req.body.request));
    });
    router.get('/getSupplyOrders/:id', (req, res) => __awaiter(this, void 0, void 0, function* () {
        res.send(yield controller.getSupplyOrders(parseInt(req.params.id)));
    }));
    router.post('/acceptOrder/:id/:orderId', (req, res) => {
        res.send(controller.acceptOrder(req.params.id, req.params.orderId));
    });
    router.post('/rejectOrder/:id/:orderId', (req, res) => {
        res.send(controller.rejectOrder(req.params.id, req.params.orderId));
    });
    return router;
}
exports.createRoutes = createRoutes;
//# sourceMappingURL=gameLogic.router.js.map