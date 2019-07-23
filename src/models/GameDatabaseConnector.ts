/**
 * This class handles all of the Game Settings
 * and anything involved with starting or joining games
 */

import * as mongoose from 'mongoose';

import DatabaseConnector from './database';
import {IGame} from "./gameSchema";
import {PartInventory} from "./partInventory";

// let noop = (err: any, raw: any) => {};

export class GameDatabaseConnector {
  private gameCollection: mongoose.Model<IGame>;
  constructor(dbConnection: DatabaseConnector) {
    this.gameCollection = dbConnection.getGameCollection();
  }

  /**
   * This takes the passed in game object and adds it to the database
   * @param game Scheme created earlier
   */
  public addToDatabase(game: IGame): void {
    let newGame: IGame = new this.gameCollection(game);
    newGame.save();
  }

  /**
   * Returns whether or not a pin already exists
   * This is to avoid games from having the same pin
   * @param pin Identifier
   */
  public async checkIfPinExists(pinNum: number): Promise<any> {
    let result = await this.gameCollection.findOne({pin: pinNum});
    return result != undefined && result != null;
  }

  /**
   * Increments the active players by one whenever a new player joins the game
   * @param pinNum string
   */
  public addActivePlayer(pinNum: number): void {
    console.log(`Adding active player for ${pinNum} (a ${typeof pinNum}).`);
    this.gameCollection.update({pin: pinNum}, {$inc: {activePlayers: 1}}).exec();
  }

  /**
   * When someone needs to exit the application, this handles removing the active player
   * it will also delete the database entry, if there are no active players
   * @param pinNum string
   */
  public removeActivePlayer(pinNum: number, position: string): void {
    let query = {pin: pinNum};
    let change = {$inc: {activePlayers: -1}, $pull: {positions: position}};
    this.gameCollection.update(query, change, () => {
      this.gameCollection.findOne(query, (err: any, result: any) => {
        if (err) console.log(err);
        if (result.activePlayers <= 0) this.gameCollection.deleteOne(query).exec();
      });
    });
  }

  /**
   * Used for when looking up the game by pin
   * @param pinNum number
   */
  public async getGameObject(pinNum: number): Promise<IGame | null> {
    try {
      return (await this.gameCollection.findOne({pin: pinNum}));
    } catch(e) {
      return null;
    }
  }

  /**
   * Makes sure two users don't end up with the same positions
   * If no positions are returned, the game is full
   * @param pinNum string 
   */
  public async getPossiblePositions(pinNum: number): Promise<any> {
    return await this.gameCollection.findOne({pin: pinNum}, {positions: 1});
  }

  public joinGame(pinNum: number, position: string): void {
    if (position != null && position != "" && position != undefined)
      this.gameCollection.update({pin: pinNum}, {$push: {positions: position}}).exec();
  }

  public async getAssemblerParts(pinNum: number): Promise<Array<PartInventory> | null>
  {
    let gameObj: (IGame | null) = await this.gameCollection.findOne({pin: pinNum}, {assemblerParts: 1}).exec();

    if(gameObj)
    {
      return Promise.resolve(gameObj.assemblerParts.slice());
    }
    else
    {
      return Promise.resolve(null);
    }
  }

  public async setAssemblerParts(pinNum: number, newParts: Array<PartInventory>): Promise<void>
  {
    await this.gameCollection.findOneAndUpdate({pin: pinNum}, {
      $set: {
        assemblerParts: newParts
      }
    })
  }
}