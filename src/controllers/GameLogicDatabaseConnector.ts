/**
 * This class handles any actual game logic
 */

import DatabaseConnector from './database';

export class GameLogicDatabaseConnector extends DatabaseConnector {
  constructor() {
    super();
  }

  /**
   * This will add the order to the game object's array
   * @param pin 
   * @param order JSON Object that holds all the order details
   */
  public addOrder(order: object): void {
    this.orderCollection.insert(order);
  }

  public async getOrders(pin: string): Promise<Array<object>> {
    try {
      return await this.orderCollection.find({pin: parseInt(pin)}).toArray();
    } catch(e) {
      return new Array<object>();
    }
  }

  public addSupplyOrder(pin: string, orderId: string, order: Array<number>): void {
    let time = new Date().getTime();
    this.orderCollection.update({pin: parseInt(pin), _id: orderId}, {$set: {supplyOrders: order, lastModified: time}});
  }

  public async getSupplyOrder(pin: string, orderId: string): Promise<Array<number>> {
    try {
      let orders = await this.orderCollection.findOne({pin: parseInt(pin), _id: orderId}, {fields: {supplyOrders: 1, _id: 0}});
      return orders.supplyOrders;
    } catch(e) {
      return new Array<number>();
    }
  }

  public updatePieces(pin: string, orderId: string, pieces: Array<number>): number {
    if (pieces != null && pieces != undefined) {
      let time = new Date().getTime();
      let update = {$set: {supplyOrders: pieces, lastModified: time}};
      this.orderCollection.update({pin: parseInt(pin), _id: orderId}, update);
      return 200;
    }
    return 400;
  }

  public updateAssembledModel(pin: string, orderId: string, model: object): number {
    if (model != null && model != undefined) {
      let time = new Date().getTime();
      let update = {$set: {assembledModel: model, status: "Completed", finishedTime: time}};
      this.orderCollection.update({pin: parseInt(pin), _id: orderId}, update);
      return 200;
    }
    return 400;
  }

  public async getManufacturerRequest(pin: string, orderId: string): Promise<Array<number>> {
    try {
      let request = await this.orderCollection.findOne({pin: parseInt(pin), _id: orderId}, {fields: {manufacturerReq: 1, _id: 0}});
      return request.manufacturerReq;
    } catch(e) {
      return new Array<number>();
    }
  }

  public updateManufacturerRequest(pin: string, orderId: string, request: Array<number>): number {
    if (request != null && request != undefined) {
      let time: number = new Date().getTime();
      let update = {$set: {manufacturerReq: request, stage: "Supplier", lastModified: time}};
      this.orderCollection.update({pin: parseInt(pin), _id: orderId}, update);
      return 200;
    }
    return 400;
  }
}