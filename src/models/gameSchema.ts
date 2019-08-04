import * as mongoose from 'mongoose';

import {PartInventory, PartInventoryScheme} from "./partInventory";

const Schema = mongoose.Schema;

export interface IGame extends mongoose.Document
{
  pin: number;
  groupName: string;
  gameType: string;
  status: string;
  maxPlayers: number;
  activePlayers: number;
  positions: Array<string>;
  createdDate: Date;
  assemblerParts: Array<PartInventory>;
}

export const GameScheme = new Schema({
  pin: {type: Number, min: 0, max: 9999},
  groupName: {type: String},
  gameType: {type: String},
  status: {type: String},
  maxPlayers: {type: Number, min: 2, max: 4},
  activePlayers: {type: Number, min: 0, max: 4},
  positions: {type: Schema.Types.Mixed},
  createdDate: {
    type: Date,
    default: Date.now
  },
  assemblerParts: {type: PartInventoryScheme, default: new Array<PartInventory>()}
});