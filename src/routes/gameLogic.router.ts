import { Router, Request, Response } from 'express';
import multer = require('multer');
let fileUpload = multer();

import {GameLogicController} from '../controllers/GameLogicController'
import * as cors from 'cors';

const router: Router = Router();
const controller: GameLogicController = new GameLogicController();

router.post('/sendOrder', fileUpload.single('custom-order-image'), async (req: Request, res: Response) => {
  let pin: number = parseInt(req.body.pin);

  if(req.body.model)
  {
    let modelID: number = parseInt(req.body.model);
    await controller.placeOrder(pin, modelID);
  }
  else
  {
    let modelDesc: string = req.body['custom-order-desc'];
    let modelImageData: Express.Multer.File = req.file;

    await controller.placeCustomOrder(pin, modelDesc, modelImageData.buffer);
  }

  res.status(200).send('OK');
});

router.get('/getOrder/:id/:orderID', async (req: Request, res: Response) => {
  res.send(await controller.getOrder(req.params.id, req.params.orderID));
});

router.get('/getOrders/:id', async (req: Request, res: Response) => {
  res.send(await controller.getOrders(req.params.id));
});

router.post('/sendSupplyOrder/:id', (req: Request, res: Response) => {
  controller.addSupplyOrder(req.params.id, req.body.id, req.body.order, req.body.colors);
  res.status(200).send('OK');
});

router.get('/getSupplyOrder/:id/:orderId', async (req: Request, res: Response) => {
  res.send(await controller.getSupplyOrder(req.params.id, req.params.orderId));
});

router.get('/colors/:id/:orderId', async(req: Request, res: Response) => {
  let result = await controller.getColors(req.params.id, req.params.orderId);
  res.send(result);
});

router.post('/updatePieces/:id/:orderId', (req: Request, res: Response) => {
  res.send(controller.updatePieces(req.params.id, req.params.orderId, req.body.pieces));
});

router.post('/sendAssembledModel/:id/:orderId', (req: Request, res: Response) => {
  console.log('Assembled model has been sent');
  res.send(controller.updateAssembledModel(req.params.id, req.params.orderId, req.body.model));
});

router.get('/getAssembledModel/:id/:orderId', async (req: Request, res: Response) => {
  res.send(await controller.getAssembledModel(req.params.id, req.params.orderId));
});

router.get('/getManufacturerRequest/:id/:orderId', async (req: Request, res: Response) => {
  res.send(await controller.getManufacturerRequest(req.params.id, req.params.orderId));
});

router.post('/updateManufacturerRequest/:id/:orderId', (req: Request, res: Response) => {
  res.send(controller.updateManufacturerRequest(req.params.id, req.params.orderId, req.body.request));
});

router.post('/acceptOrder/:id/:orderId', (req: Request, res: Response) => {
  res.send(controller.acceptOrder(req.params.id, req.params.orderId));
});

router.post('/rejectOrder/:id/:orderId', (req: Request, res: Response) => {
  res.send(controller.rejectOrder(req.params.id, req.params.orderId));
});

export const GameLogicRouter: Router = router;