"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orderBaseSchema_1 = require("./orderBaseSchema");
class PartInventory {
    constructor() {
        this.partID = -1;
        this.color = 0;
        this.count = 0;
    }
}
exports.PartInventory = PartInventory;
let PartInventoryScheme = { partID: Number, color: Number, count: Number };
exports.SupplierOrderSchema = orderBaseSchema_1.OrderSchema.clone();
exports.SupplierOrderSchema.add({
    manufacturerReq: { type: [PartInventoryScheme], default: new Array() },
    supplyOrders: { type: [PartInventoryScheme], default: new Array() }
});
//# sourceMappingURL=supplierOrderSchema.js.map