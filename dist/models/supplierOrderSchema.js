"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orderBaseSchema_1 = require("./orderBaseSchema");
class PartInventory {
    constructor() {
        this.name = '';
        this.color = 0;
        this.count = 0;
    }
}
exports.PartInventory = PartInventory;
exports.SupplierOrderSchema = orderBaseSchema_1.OrderSchema.clone();
exports.SupplierOrderSchema.add({
    manufacturerReq: { type: [{ name: String, color: Number, count: Number }], default: new Array() },
    supplyOrders: { type: [{ name: String, color: Number, count: Number }], default: new Array() }
});
//# sourceMappingURL=supplierOrderSchema.js.map