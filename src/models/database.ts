import * as mongoose from 'mongoose';
import {makeCollection as makeCustomerOrderCollection} from "./customerOrderCollection";
import {makeCollection as makeSupplierOrderCollection} from "./supplierOrderCollection";
import {makeCollection as makeGameCollection} from "./gameCollection";
import {IGame} from "./gameSchema";
import {ICustomerOrder} from "./customerOrderSchema";
import {ISupplierOrder} from "./supplierOrderSchema";

export default class DatabaseConnector {
  protected db: mongoose.Connection;
  protected gameCollection: mongoose.Model<IGame>;
  protected custOrderCollection: mongoose.Model<ICustomerOrder>;
  protected supplierOrderCollection: mongoose.Model<ISupplierOrder>;
  protected url: string;
  constructor() {
    const RECONNECTION_INTERVAL: number = 10000;

    if (process.env.NODE_ENV == 'production')
      this.url = 'mongodb+srv://' + process.env.DB_USER + ':' + process.env.DB_PASS + '@' + process.env.DB_HOST;
    else 
      this.url = 'mongodb://localhost/local';
    console.log(this.url);
    let connectionObj = this.db = mongoose.createConnection(this.url);
    let connString = this.url;

    this.db.on('error', function(errorInfo) {
      console.log('Database connection error:', errorInfo);
      setTimeout(function() {
        console.log('Attempting reconnection to database...');
        connectionObj.openUri(connString);
      }, RECONNECTION_INTERVAL);
    });

    this.db.once('connected', function callback () {
      console.log('Connected to database');
    });

    this.gameCollection = makeGameCollection(this);
    this.custOrderCollection = makeCustomerOrderCollection(this);
    this.supplierOrderCollection = makeSupplierOrderCollection(this);
  }

  public getConnection(): mongoose.Connection
  {
    return this.db;
  }

  public getGameCollection(): mongoose.Model<IGame>
  {
    return this.gameCollection;
  }

  public getCustOrderCollection(): mongoose.Model<ICustomerOrder>
  {
    return this.custOrderCollection;
  }

  public getSupplierOrderCollection(): mongoose.Model<ISupplierOrder>
  {
    return this.supplierOrderCollection;
  }
}
