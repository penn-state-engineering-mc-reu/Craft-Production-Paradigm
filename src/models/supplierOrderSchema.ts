import {IOrder, OrderSchema} from "./orderBaseSchema";

export class PartInventory
{
    partID: number = -1;
    color: number = 0;
    count: number = 0;
}

let PartInventoryScheme = {partID: Number, color: Number, count: Number};

export interface ISupplierOrder extends IOrder
{
    manufacturerReq: Array<PartInventory>;
    supplyOrders: Array<PartInventory>;
}

export const SupplierOrderSchema = OrderSchema.clone();
SupplierOrderSchema.add({
    manufacturerReq: {type: [PartInventoryScheme], default: new Array<PartInventory>()},
    supplyOrders: {type: [PartInventoryScheme], default: new Array<PartInventory>()}
});