"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose = require("mongoose");
const customerOrderCollection_1 = require("./customerOrderCollection");
const supplierOrderCollection_1 = require("./supplierOrderCollection");
const gameCollection_1 = require("./gameCollection");
class DatabaseConnector {
    constructor() {
        const RECONNECTION_INTERVAL = 10000;
        if (process.env.NODE_ENV == 'production')
            this.url = 'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + process.env.DB_HOST;
        else
            this.url = 'mongodb://localhost/local';
        console.log(this.url);
        let connectionObj = this.db = mongoose.createConnection(this.url);
        let connString = this.url;
        this.db.on('error', function (errorInfo) {
            console.log('Database connection error:', errorInfo);
            setTimeout(function () {
                console.log('Attempting reconnection to database...');
                connectionObj.openUri(connString);
            }, RECONNECTION_INTERVAL);
        });
        this.db.once('connected', function callback() {
            console.log('Connected to database');
        });
        this.gameCollection = gameCollection_1.makeCollection(this);
        this.custOrderCollection = customerOrderCollection_1.makeCollection(this);
        this.supplierOrderCollection = supplierOrderCollection_1.makeCollection(this);
    }
    getConnection() {
        return this.db;
    }
    getGameCollection() {
        return this.gameCollection;
    }
    getCustOrderCollection() {
        return this.custOrderCollection;
    }
    getSupplierOrderCollection() {
        return this.supplierOrderCollection;
    }
}
exports.default = DatabaseConnector;
//# sourceMappingURL=database.js.map