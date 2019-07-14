import {Schema, Document} from "mongoose";
import {Binary} from "bson";

/**
 * This should generally be random enough to handle a couple order ids
 * This isn't a permenant solution; it works well enough for me
 * Found on Github: https://gist.github.com/gordonbrander/2230317
 */
function generateID(): string {
    // Math.random should be unique because of its seeding algorithm.
    // Convert it to base 36 (numbers + letters), and grab the first 9 characters
    // after the decimal.
    return '_' + Math.random().toString(36).substr(2, 9);
}

export interface ICustomerOrder extends Document
{
    pin: number;
    createDate: number;
    lastModified: number;
    finishedTime: number;
    status: string;
    stage: string;
    modelID: number;
    isCustomOrder: boolean;
    orderDesc: string;
    imageData: Buffer;
    supplyOrders: Array<number>;
    colors: Array<string>;
    assembledModel: string;
    manufacturerReq: Array<number>;
    setLastModified(): void;
    setFinished(): void;
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

export const CustomerOrderSchema = new Schema({
    _id: {type: String, default: generateID},
    pin: {type: Number, default: null},
    createDate: {type: Date, default: Date.now},
    lastModified: {type: Date, default: Date.now},
    finishedTime: {type: Date, default: null},
    status: {type: String, default: 'In Progress'},
    stage: {type: String, default: 'Manufacturer'},
    modelID: {type: Number, default: -1},
    supplyOrders: {type: [Number], default: (new Array<number>())},
    colors: {type: [String], default: (new Array<string>())},
    isCustomOrder: {type: Boolean, default: false},
    orderDesc: {type: String, default: null},
    imageData: {type: Buffer, default: null},
    assembledModel: {type: String, default: null},
    manufacturerReq: {type: [Number], default: (new Array<number>())}
});

CustomerOrderSchema.methods.setLastModified = function(): void {
    this.lastModified = (new Date().getTime());
};

CustomerOrderSchema.methods.setFinished = function(): void {
    this.finishedTime = new Date().getTime();
};