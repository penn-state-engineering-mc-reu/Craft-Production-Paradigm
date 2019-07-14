"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const customerOrderCollection_1 = require("./customerOrderCollection");
const gameCollection_1 = require("./gameCollection");
class DatabaseConnector {
    constructor() {
        if (process.env.NODE_ENV == 'production')
            this.url = 'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + process.env.DB_HOST;
        else
            this.url = 'mongodb://localhost/local';
        console.log(this.url);
        mongoose.connect(this.url).catch((e) => {
            console.log(e);
        });
        this.db = mongoose.connection;
        this.db.on('error', console.error.bind(console, 'connection error:'));
        this.db.once('open', function callback() {
            console.log('Connected to database');
        });
        this.gameCollection = gameCollection_1.makeCollection(this);
        this.orderCollection = customerOrderCollection_1.makeCollection(this);
    }
    getConnection() {
        return this.db;
    }
    getGameCollection() {
        return this.gameCollection;
    }
    getOrderCollection() {
        return this.orderCollection;
    }
}
exports.default = DatabaseConnector;
//# sourceMappingURL=database.js.map