import * as mongoose from 'mongoose';
import {makeCollection as makeCustomerOrderCollection} from "./customerOrderCollection";
import {makeCollection as makeGameCollection} from "./gameCollection";
import {IGame} from "./gameSchema";
import {ICustomerOrder} from "./customerOrderSchema";

export default class DatabaseConnector {
  protected db: mongoose.Connection;
  protected gameCollection: mongoose.Model<IGame>;
  protected orderCollection: mongoose.Model<ICustomerOrder>;
  protected url: string;
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
    this.db.once('open', function callback () {
      console.log('Connected to database');
    });

    this.gameCollection = makeGameCollection(this);
    this.orderCollection = makeCustomerOrderCollection(this);
  }

  public getConnection(): mongoose.Connection
  {
    return this.db;
  }

  public getGameCollection(): mongoose.Model<IGame>
  {
    return this.gameCollection;
  }

  public getOrderCollection(): mongoose.Model<ICustomerOrder>
  {
    return this.orderCollection;
  }
}
