"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const customerOrderSchema_1 = require("./customerOrderSchema");
function makeCollection(dbConnection) {
    return dbConnection.getConnection().model('CustomerOrder', customerOrderSchema_1.CustomerOrderSchema, 'customerOrders');
}
exports.makeCollection = makeCollection;
//# sourceMappingURL=customerOrderCollection.js.map