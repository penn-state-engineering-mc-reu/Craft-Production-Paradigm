"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const orderBaseSchema_1 = require("./orderBaseSchema");
exports.CustomerOrderSchema = orderBaseSchema_1.OrderSchema.clone();
exports.CustomerOrderSchema.add({
    stage: { type: String, default: 'Manufacturer' },
    modelID: { type: Number, default: -1 },
    isCustomOrder: { type: Boolean, default: false },
    orderDesc: { type: String, default: null },
    imageData: { type: Buffer, default: null },
    assembledModel: { type: String, default: null },
});
//# sourceMappingURL=customerOrderSchema.js.map