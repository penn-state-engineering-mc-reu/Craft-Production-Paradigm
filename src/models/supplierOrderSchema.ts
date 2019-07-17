import {IOrder, OrderSchema} from "./orderBaseSchema";

export class PartInventory
{
    name: string = '';
    color: number = 0;
    count: number = 0;
}

export interface ISupplierOrder extends IOrder
{
    manufacturerReq: Array<PartInventory>;
    supplyOrders: Array<PartInventory>;
}

export const SupplierOrderSchema = OrderSchema.clone();
SupplierOrderSchema.add({
    manufacturerReq: {type: [{name: String, color: Number, count: Number}], default: new Array<PartInventory>()},
    supplyOrders: {type: [{name: String, color: Number, count: Number}], default: new Array<PartInventory>()}
});