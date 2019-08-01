'use strict'

/**
 * name: String 
 *  -> Holds the name of the object
 * directory: String 
 *  -> Points to the directory of the model
 * scale: Integer
 *  -> Some models are scaled differently than others
 * yTranslation: Boolean 
 *  -> Some models have the center at different places
 *  -> In this case 1 is the top, 0 is the middle, and -1 is the bottom
 * top, bottom, front, back, left, right: Boolean
 *  -> Most pieces can only be put together by a few of the surfaces
 * collisionX, collisionY, collisionZ: Doubles
 *  -> All of the models need to have their collision boxes resized
 *  -> These values are modifiers that are subtracted from the original model's size
 */

function Model(name, directory, scale, top, bottom, front, back, left, right, collisionX, collisionY, collisionZ,
               snapOffsetBasisX, snapOffsetBasisZ, snapOffsetX, snapOffsetZ) {
  this.name = name;
  this.directory = directory;
  this.scale = scale;
  this.top = top;
  this.bottom = bottom;
  this.front = front;
  this.back = back;
  this.left = left;
  this.right = right;
  this.collisionX = collisionX;
  this.collisionY = collisionY;
  this.collisionZ = collisionZ;
  this.snapOffsetBasisX = (snapOffsetBasisX ? snapOffsetBasisX : Model.SnapBasis.BASIS_MIN);
  this.snapOffsetBasisZ = (snapOffsetBasisZ ? snapOffsetBasisZ : Model.SnapBasis.BASIS_MIN);
  this.snapOffsetX = (snapOffsetX ? snapOffsetX : 0);
  this.snapOffsetZ = (snapOffsetZ ? snapOffsetZ : 0);
}

Model.SnapBasis = {
  BASIS_MIN: 'BASIS_MIN',
  BASIS_MAX: 'BASIS_MAX',
  BASIS_CENTER: 'BASIS_CENTER'
};

let allModels = [
  new Model('1x1', '../objects/1x1.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('1x3', '../objects/1x3.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('2x2', '../objects/2x2.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('2x2 Slope', '../objects/2x2Slope.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('2x2 Pin', '../objects/2x2wPin.stl', 3, 1, 1, 1, 0, 0, 0, 0, 5, 0, Model.SnapBasis.BASIS_CENTER, Model.SnapBasis.BASIS_CENTER),
  new Model('2x3x2', '../objects/2x3x2.stl', 1.5, 1, 1, 0, 0, 0, 0, 12, 6, 0),
  new Model('1x2 Pin', '../objects/1x2wPin.stl', 3, 1, 1, 1, 0, 0, 0, 0, 5, 0),
  new Model('1x2 Slope', '../objects/1x2Slope.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('1x2 Inverted Slope', '../objects/1x2InvertedSlope.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('2x2x1 Pin', '../objects/2x2x1wPin.stl', 3, 1, 1, 1, 0, 0, 0, 0, 5, 0),
  new Model('2x2x2 Pin', '../objects/2x2x2wPin.stl', 3, 1, 1, 1, 0, 0, 0, 0, 5, 0),
  new Model('2x2 Double', '../objects/2x2Double.stl', 3, 1, 1, 1, 0, 0, 0, 0, 5, 0),
  new Model('Tire 1', '../objects/tire1.stl', 1.5, 0, 0, 1, 1, 0, 0, 0, 0, 0),
  new Model('Tire 2', '../objects/tire2.stl', 3, 0, 0, 1, 1, 0, 0),
  new Model('Tire 3', '../objects/tire3.stl', 1, 0, 0, 1, 1, 0, 0),
  new Model('Rim 1', '../objects/rim1.stl', 1.45, 0, 0, 1, 1, 0, 0),
  new Model('Rim 2', '../objects/rim2.stl', 3, 0, 0, 0, 1, 0, 0),
  new Model('Rim 3', '../objects/rim3.stl', 1, 0, 0, 0, 1, 0, 0),
  new Model('1x2', '../objects/1x2.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('1x4', '../objects/1x4.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('1x2 Plate', '../objects/1x2P.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('2x2 Plate', '../objects/2x2P.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('4x6 Plate', '../objects/4x6P.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('4x10 Plate', '../objects/4x10P.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('2x8 Plate', '../objects/2x8P.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('2x6 Plate', '../objects/2x6P.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('6x8 Plate', '../objects/6x8P.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('2x10 Plate', '../objects/2x10P.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('Windshield', '../objects/windshield.stl', 3, 1, 1, 0, 0, 0, 0, 0, 5, 0),
  new Model('Steering Wheel', '../objects/steering.stl', 3, 0, 1, 0, 0, 0, 0, 0, 0, 0, Model.SnapBasis.BASIS_MIN, Model.SnapBasis.BASIS_MAX),
  new Model('Lego Man', '../objects/lego_man.stl', 3, 0, 1, 0, 0, 0, 0, 0, 5, 0, Model.SnapBasis.BASIS_CENTER, Model.SnapBasis.BASIS_MAX)
];