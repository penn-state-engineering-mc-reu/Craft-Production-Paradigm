/**
 * Controller handles all of the game logic
 * i.e. Things that deal with the orders
 */

import {Request, Response} from 'express';
import {GameLogicDatabaseConnector} from '../controllers/GameLogicDatabaseConnector';
import Order from '../models/order'

export class GameLogicController {
  private db: GameLogicDatabaseConnector;
  constructor() {
    this.db = new GameLogicDatabaseConnector();
  }

  public placeOrder(pin: number, modelID: number, generated: boolean, max: number, skew: number): void {
    if (generated == true) {
      this.generateOrders(pin, max, skew);
    }
    else {
      let order = new Order(pin);
      order.setModelID(modelID);
      order.setStage('Manufacturer');
      this.db.addOrder(order.toJSON());
    }
  }

  private generateOrders(pin: number, max:number, skew: number): void {
    for (let i: number = 0; i < max; i++) {
      let order = new Order(pin);
      let ID: number = Math.ceil(this.normalDistribution(skew));
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
  private normalDistribution(skew: number): number {
    const min: number = 0;
    const max: number = 4;
    var u = 0, v = 0;
    while(u === 0) u = Math.random(); //Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    let num = Math.sqrt( -2.0 * Math.log( u ) ) * Math.cos( 2.0 * Math.PI * v );

    num = num / 10.0 + 0.5; // Translate to 0 -> 1
    if (num > 1 || num < 0) num = this.normalDistribution(skew); // resample between 0 and 1 if out of range
    num = Math.pow(num, skew); // Skew
    num *= max - min; // Stretch to fill range
    num += min; // offset to min
    return num;
}

  public async getOrder(pin: string, orderID: string): Promise<object>
  {
    return await this.db.getOrder(pin, orderID);
  }

  public async getOrders(pin: string): Promise<Array<object>> {
    return await this.db.getOrders(pin);
  }

  public addSupplyOrder(pin: string, order: Array<number>, colors: Array<string>): void {
    this.db.addSupplyOrder(pin, order, colors);
  }

  public async getSupplyOrder(pin: string): Promise<Array<number>> {
    return await this.db.getSupplyOrder(pin);
  }

  public async getColors(pin: string): Promise<Array<any>> {
    let result = await this.db.getColors(pin);
    return result;
  }

  public updatePieces(pin: string, pieces: Array<number>): number {
    return this.db.updatePieces(pin, pieces);
  }

  public updateAssembledModel(pin: string, orderId: string, model: object): number {
    return this.db.updateAssembledModel(pin, orderId, model);
  }

  public async getAssembledModel(pin: string, orderId: string): Promise<object> {
    return await this.db.getAssembledModel(pin, orderId);
  }

  public async getManufacturerRequest(pin: string): Promise<Array<number>> {
    return await this.db.getManufacturerRequest(pin);
  }

  public updateManufacturerRequest(pin: string, request: Array<number>): number {
    return this.db.updateManufacturerRequest(pin, request);
  }

  public acceptOrder(pin: string, orderId: string): number {
    return this.db.acceptOrder(pin, orderId);
  }

  public rejectOrder(pin: string, orderId: string): number {
    return this.db.rejectOrder(pin, orderId);
  }
}