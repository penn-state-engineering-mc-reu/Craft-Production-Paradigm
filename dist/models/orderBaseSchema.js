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
exports.OrderSchema = new mongoose_1.Schema({
    _id: { type: String, default: generateID },
    pin: { type: Number, default: null },
    createDate: { type: Date, default: Date.now },
    lastModified: { type: Date, default: Date.now },
    finishedTime: { type: Date, default: null },
    status: { type: String, default: 'In Progress' }
});
exports.OrderSchema.methods.setLastModified = function () {
    this.lastModified = (new Date().getTime());
};
exports.OrderSchema.methods.setFinished = function () {
    this.finishedTime = new Date().getTime();
};
//# sourceMappingURL=orderBaseSchema.js.map