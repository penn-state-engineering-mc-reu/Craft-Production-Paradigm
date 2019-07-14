import * as express from "express";
import * as bodyParser from "body-parser";
import * as path from 'path';
import * as cors from 'cors';
import {createGameRoutes, createCustOrderRoutes} from '../routes';
import DatabaseConnector from "./database";
import {GameLogicController} from "../controllers/GameLogicController";
import {GameController} from "../controllers/GameController";

class App {
  public app: express.Application;
  public dbConnection: DatabaseConnector;
  constructor() {
    this.app = express();
    this.dbConnection = new DatabaseConnector();
    this.config();
    this.setRoutes();     
  }

  private config(): void {
    /*this.app.use((req, res, next) => {
      res.setHeader('Access-Control-Allow-Origin', '*');
    }),*/
    this.app.use(cors({origin: '*'}));
    this.app.use((req, res, next) => {
      // res.setHeader('Access-Control-Allow-Origin', '*');
      res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE');
      res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
      res.setHeader('Access-Control-Allow-Credentials', 'true');
      next();
    });
    
    this.app.use(bodyParser.json({limit: '500mb'}));
    this.app.use(bodyParser.urlencoded({limit: "500mb", extended: true, parameterLimit:10000000}));
    this.app.use(bodyParser({limit: '50mb'}));
  }

  private setRoutes(): void {
    this.app.use('/startGame', createGameRoutes(new GameController(this.dbConnection)));
    this.app.use('/gameLogic', createCustOrderRoutes(new GameLogicController(this.dbConnection)));
  }
}

export default new App().app;