import {Model} from "mongoose";

import DatabaseConnector from './database';
import {ISupplierOrder, PartInventory} from "./supplierOrderSchema";

export class SupplierOrderDatabaseConnector {
    public orderModel: Model<ISupplierOrder>;

    constructor(dbConnection: DatabaseConnector) {
        this.orderModel = dbConnection.getSupplierOrderCollection();
    }

    public async addOrder(pin: string, manufRequest: Array<PartInventory>): Promise<ISupplierOrder> {
        let newModel = new this.orderModel({pin: pin, manufacturerReq: manufRequest});
        return newModel.save();
    }

    public async getManufacturerRequest(pin: number, orderId: string): Promise<Array<PartInventory>> {
        let orders = await this.orderModel.findOne({pin: pin, _id: orderId}, {manufacturerReq: 1});

        if(orders) {
            return orders.manufacturerReq;
        }
        else
        {
            return new Array<PartInventory>();
        }
    }

    public async getSupplyOrder(pin: string, orderId: string): Promise<Array<PartInventory>> {
        let orders = await this.orderModel.findOne({pin: parseInt(pin), _id: orderId}, {supplyOrders: 1});

        if(orders) {
            return orders.supplyOrders;
        }
        else
        {
            return new Array<PartInventory>();
        }
    }

    public async completeOrder(gamePin: string, orderID: string, supplierParts: Array<PartInventory>): Promise<ISupplierOrder | null>
    {
        let time: number = new Date().getTime();
        return this.orderModel.findOneAndUpdate({pin: gamePin, _id: orderID}, {$set: {
            supplyOrders: supplierParts,
            lastModified: time,
            finishedTime: time,
            status: 'Completed'
        }}).exec();
    }
}