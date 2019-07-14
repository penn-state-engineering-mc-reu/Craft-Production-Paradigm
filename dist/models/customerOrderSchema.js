"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
/**
 * This should generally be random enough to handle a couple order ids
 * This isn't a permenant solution; it works well enough for me
 * Found on Github: https://gist.github.com/gordonbrander/2230317
 */
function generateID() {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
}
/*
function onCustomOrderDataSet(newData: any)
{
    // @ts-ignore
    if(this instanceof Document)
    {
        // @ts-ignore
        this.modelID = null;
    }
}
*/
exports.CustomerOrderSchema = new mongoose_1.Schema({
    _id: { type: String, default: generateID },
    pin: { type: Number, default: null },
    createDate: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    finishedTime: { type: Date, default: null },
    status: { type: String, default: 'In Progress' },
    stage: { type: String, default: 'Manufacturer' },
    modelID: { type: Number, default: -1 },
    supplyOrders: { type: [Number], default: (new Array()) },
    colors: { type: [String], default: (new Array()) },
    isCustomOrder: { type: Boolean, default: false },
    orderDesc: { type: String, default: null },
    imageData: { type: Buffer, default: null },
    assembledModel: { type: String, default: null },
    manufacturerReq: { type: [Number], default: (new Array()) }
});
exports.CustomerOrderSchema.methods.setLastModified = function () {
    this.lastModified = (new Date().getTime());
};
exports.CustomerOrderSchema.methods.setFinished = function () {
    this.finishedTime = new Date().getTime();
};
//# sourceMappingURL=customerOrderSchema.js.map