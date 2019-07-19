"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orderBaseSchema_1 = require("./orderBaseSchema");
const partInventory_1 = require("./partInventory");
exports.SupplierOrderSchema = orderBaseSchema_1.OrderSchema.clone();
exports.SupplierOrderSchema.add({
    manufacturerReq: { type: [partInventory_1.PartInventoryScheme], default: new Array() },
    supplyOrders: { type: [partInventory_1.PartInventoryScheme], default: new Array() }
});
//# sourceMappingURL=supplierOrderSchema.js.map