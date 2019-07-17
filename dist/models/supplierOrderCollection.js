"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const supplierOrderSchema_1 = require("./supplierOrderSchema");
function makeCollection(dbConnection) {
    return dbConnection.getConnection().model('SupplierOrder', supplierOrderSchema_1.SupplierOrderSchema, 'supplierOrders');
}
exports.makeCollection = makeCollection;
//# sourceMappingURL=supplierOrderCollection.js.map