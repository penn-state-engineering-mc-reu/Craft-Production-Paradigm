"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const sharp = require("sharp");
class OrderImage {
    constructor(imageBuffer) {
        this.image = sharp(imageBuffer).resize(OrderImage.MAX_WIDTH, OrderImage.MAX_HEIGHT, {
            fit: "inside"
        }).png();
    }
    toBuffer() {
        return __awaiter(this, void 0, void 0, function* () {
            return this.image.toBuffer();
        });
    }
}
OrderImage.MAX_WIDTH = 600;
OrderImage.MAX_HEIGHT = 250;
exports.OrderImage = OrderImage;
//# sourceMappingURL=orderImage.js.map