import * as mongoose from 'mongoose';

import {PartInventory, PartInventoryScheme} from "./partInventory";
import {objectValues} from "../polyfill";

const Schema = mongoose.Schema;

export interface IGame extends mongoose.Document
{
  pin: number;
  groupName: string;
  gameType: string;
  status: string;
  maxPlayers: number;
  activePlayers: number;
  positions: Array<PositionInfo>;
  createdDate: Date;
  assemblerParts: Array<PartInventory>;
}

export class PositionInfo {
  static POSITION_NAMES = {CUSTOMER: 'Customer', MANUFACTURER: 'Manufacturer', SUPPLIER: 'Supplier', ASSEMBLER: 'Assembler'};
  positionName: string = String();
  playerName: string = String();
}

export const PositionInfoSchema = new Schema({
  positionName: {type: String, enum: objectValues(PositionInfo.POSITION_NAMES)},
  playerName: {type: String}
});

export const GameScheme = new Schema({
  pin: {type: Number, min: 0, max: 9999},
  groupName: {type: String},
  gameType: {type: String},
  status: {type: String},
  maxPlayers: {type: Number, min: 2, max: 4},
  activePlayers: {type: Number, min: 0, max: 4},
  positions: {type: [PositionInfoSchema], default: new Array<PositionInfo>()},
  createdDate: {
    type: Date,
    default: Date.now
  },
  assemblerParts: {type: PartInventoryScheme, default: new Array<PartInventory>()}
});