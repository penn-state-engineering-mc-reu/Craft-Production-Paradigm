'use strict'
let currentRollOverModel = null;
let placementOffset = new THREE.Vector3();

/*
function loadRollOverMesh() {
  let index = allModels.indexOf(currentObj);
  getPartGeometry(index, function (geometry) {
    geometry.computeBoundingBox();
    let modelColor = tinycolor(BrickColors.findByColorID(pieces[pieceIndex].color).RGBString);
    let material = new THREE.MeshPhongMaterial({transparent: true, opacity: modelColor.getAlpha(),
      color: modelColor.toHexString(), shininess: 30, specular: 0x111111});
    rollOverMesh = new THREE.Mesh(geometry, material);
    scene.add(rollOverMesh);
    rollOverMesh.scale.set(currentObj.scale, currentObj.scale, currentObj.scale);
    rollOverMesh.rotation.x += - Math.PI / 2;

    // so some of these models are really dumb
    // i need to manually fix the positioning of them
    //if (currentObj == twoByThreeByTwo) rollOverMesh.position.x -= 15;

    // generate collision box
    let box = new THREE.Box3().setFromObject(rollOverMesh);
    let size = new THREE.Vector3();
    box.getSize(size);

    currentRollOverModel = allModels[index].name;
    rollOverMesh.userData.dimensions = size;
    rollOverMesh.userData.modelType = currentRollOverModel;
    rollOverMesh.userData.colorInfo = pieces[pieceIndex].color;
    rollOverMesh.name = 'rollOverMesh';

    rollOverMesh.position.y += determineModelYTranslation();
    placementOffset.set(0, 0, 0);
  });
}
 */

/**
 * ================================================================
 *                  KEYBOARD AND MOUSE INPUT
 * ================================================================
 */

function getNormalizedMousePosition(event)
{
  let canvasPosition = $(renderer.domElement).offset();
  let canvasHeight = $(renderer.domElement).height();
  // mouse.set((event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / (window.innerHeight + (window.innerHeight * .15))) * 2 + 1);
  return new THREE.Vector2((event.clientX / window.innerWidth) * 2 - 1, - ( (event.clientY - canvasPosition.top) / canvasHeight ) * 2 + 1);
}

function onDocumentMouseMove(event)
{
  event.preventDefault();
  mouse = getNormalizedMousePosition(event);
  updateRolloverMesh(mouse);
}

function updateRolloverMesh(mousePos) {
  raycaster.setFromCamera(mousePos, camera);
  var intersects = raycaster.intersectObjects(collisionObjects);
  // pieceIndex = names.indexOf(currentRollOverModel);
  if (rollOverMesh !== null) {
    clearPreviousRollOverObject();
    if (intersects.length > 0 && currentRollOverModel !== null) {
      // Need to load the rollOverMesh once the user enters the plane one again
      // this is to avoid lingering rollOverMeshes when you cycle through different pieces
      if (scene.children.indexOf(rollOverMesh) == -1) scene.add(rollOverMesh);
      else {
        // rollOverMesh.position.copy(intersects[0].point);
        let dim = rollOverMesh.userData.dimensions;
        var intersect = intersects[0];
        rollOverMesh.position.copy(intersect.point);

        moveToSnappedPosition(rollOverMesh);
        rollOverMesh.position.add(placementOffset);
      }
    }
    else {
      // solves issue that if you rapidly click the cylce button
      // it would place unremovable rollOverMeshes on the scene
      scene.children.forEach(element => {
        if (element.name == 'rollOverMesh')
          scene.remove(element);
      });
    }
  }
  // render();
}

// handles all the keyboard presses
// TODO: Handle multiple keypresses
function onDocumentKeyDown(event) {
  switch (event.keyCode) {
    case 16: isShiftDown = true; break; // Shift
    case 17: isCtrlDown = true; break;  // Ctrl
    case 87: placementOffset.add(new THREE.Vector3(0, 0, -TILE_DIMENSIONS.y)); break;  // W
    case 65: placementOffset.add(new THREE.Vector3(-TILE_DIMENSIONS.x, 0, 0)); break;  // A
    case 83: placementOffset.add(new THREE.Vector3(0, 0, TILE_DIMENSIONS.y)); break; // S
    case 68: placementOffset.add(new THREE.Vector3(TILE_DIMENSIONS.x, 0, 0)); break; // D
    case 81: rollOverMesh.rotation.y += Math.PI / 2; /* render(); */ break; // Q
    case 69: rollOverMesh.rotation.y -= Math.PI / 2; /* render(); */ break; // E
      // Manually updating the camera's world matrix seems to be necessary for raytracing (used during the rollover mesh
      // update) when the camera is moved/rotated in the same frame.
    case 32: controls.reset(); camera.updateMatrixWorld(); break;   // Space
  }
  updateRolloverMesh(mouse);
}

function onDocumentKeyUp(event) {
  switch (event.keyCode) {
    case 16: isShiftDown = false; break;
    case 17: isCtrlDown = false; break;
  }
}

function onRendererMouseWheel(event)
{
  camera.updateMatrixWorld();
  updateRolloverMesh(mouse);
}

function onBeforePageUnload(event)
{
  if(objects.length > 0 || rollOverMesh !== null)
  {
    event.preventDefault();
    event.returnValue = 'The parts and model that you are working on will be lost.';
  }
}

function onPageUnload(event)
{
  objects.forEach(value => {
    returnPartToStock(value);
  });

  if(rollOverMesh)
  {
    returnPartToStock(rollOverMesh);
  }

  updatePieces(true);
}

/**
 * ================================================================
 *        CREATION AND DELETION OF THE MODELS IN THE SCENE
 * ================================================================
 * 
 */

function returnPartToStock(partMesh)
{
  // I get this kind of shit when I forget to actually design some parts
  // It's also because some parts of JS can be "interesting"
  let partID = partMesh.userData.modelType;
  let partColor = partMesh.userData.colorInfo;
  let existingPiece = pieces.find(value => {
    return (value.partID === partID && value.color === partColor);
  });

  if(existingPiece) {
    (existingPiece.count)++;
  }
  else
  {
    pieces.push({
      partID: partID,
      color: partColor,
      count: 1
    });
  }

  // It's about as stupid as it looks
  // this is because the intersection object is the collision object
  // group.remove(intersect.object.children[0]);
}

/*
function removePartFromStock(index)
{
  let newPieceCount = pieces[index].count - 1;

  if(newPieceCount > 0) {
    pieces[index].count = newPieceCount;
  }
  else
  {
    pieces.splice(index, 1);
  }
}
*/

function removePartFromStock(partID, colorID)
{
  let index = pieces.findIndex(value => {
    return (value.partID === partID && value.color === colorID);
  });

  let newPieceCount = pieces[index].count - 1;

  if(newPieceCount > 0) {
    pieces[index].count = newPieceCount;
  }
  else
  {
    pieces.splice(index, 1);
  }
}

function setRolloverObject(objMesh)
{
  if(objMesh.parent !== null) objMesh.parent.remove(objMesh);
  objMesh.name = 'rollOverMesh';
  scene.remove(rollOverMesh);
  rollOverMesh = objMesh;
  currentRollOverModel = objMesh.userData.modelType;
  currentObj = allModels[objMesh.userData.modelType];

  updateRolloverMesh(mouse);
}

function clearRolloverObject()
{
  rollOverMesh = null;
  currentRollOverModel = null;
  currentObj = null;
}

function removeEditorObject(collisionObj)
{
  if (collisionObj.children[1]) scene.remove(collisionObj.children[1]);
  scene.remove(collisionObj);
  scene.remove(collisionObj.children[0]);
  objects.splice(objects.indexOf(collisionObj.children[0]), 1);
  collisionObjects.splice(collisionObjects.indexOf(collisionObj), 1);
}

function onDocumentMouseDown(event) {
  event.preventDefault();
  mouse = getNormalizedMousePosition(event);
  raycaster.setFromCamera(mouse, camera);
  let collisionIntersects = raycaster.intersectObjects(collisionObjects);
  // let objIntersect = raycaster.intersectObjects(objects);
  if (collisionIntersects.length > 0) {
    let collisionIntersect = collisionIntersects[0];
    let modelObj = collisionIntersect.object.children[0];
    // pieceIndex = names.indexOf(currentRollOverModel);
    // delete cube
    if (isCtrlDown) {
      if (collisionIntersect && collisionIntersect.object !== plane) {
        removeEditorObject(collisionIntersect.object);
        returnPartToStock(modelObj);
        updatePieces().then(() => {
          updateBinParts();
        });
        updateRolloverMesh(mouse);
      }
    }
    else if(isShiftDown)
    {
      if(rollOverMesh !== null)
      {
        placeLego(collisionIntersect, (placement, modelMesh, collisionMesh) => {
          if (placement)
          {
            placementOffset.set(0, 0, 0);
          }
        });
      }
      else if(collisionIntersect && collisionIntersect.object !== plane)
      {
        removeEditorObject(collisionIntersect.object);
        setRolloverObject(modelObj);
      }
    }
    /*else if (isShiftDown && pieces[pieceIndex].count > 0) {
      placeLego(intersect, (placement, modelMesh, collisionMesh) => {
        if (placement) {
          let newPieceCount = pieces[pieceIndex].count - 1;

          if(newPieceCount > 0) {
            pieces[pieceIndex].count = newPieceCount;
          }
          else
          {
            pieces.splice(pieceIndex, 1);
            pieceIndex = -1;
          }
          placementOffset.set(0, 0, 0);
          updatePieces();

          // Manually updating the world matrices seems to be necessary for raytracing (used during the rollover mesh
          // update) for objects created in the same frame.
          modelMesh.updateMatrixWorld();
          collisionMesh.updateMatrixWorld();
          updateRolloverMesh(mouse);
          // TODO: Update rollover mesh
          // setTimeout(() => {updateRolloverMesh(mouse);}, 500);
        }
      });
    }*/
    // render();
  }
  else if(isShiftDown)
  {
    let binCollection = getActiveWorkbench().getObjectByName('Bins').children;

    let binObject = null;
    let binObjectHit = binCollection.some(thisBin => {
      let binIntersects = raycaster.intersectObject(thisBin, true);

      if(binIntersects.length >= 1)
      {
        binObject = binIntersects[0].object;
        return true;
      }
      else
      {
        return false;
      }
    });

    if(binObjectHit)
    {
      if(binObject.userData.isPart)
      {
        if (rollOverMesh)
        {
          returnPartToStock(rollOverMesh);
        }

        removePartFromStock(binObject.userData.modelType, binObject.userData.colorInfo);

        setRolloverObject(binObject);

        updatePieces().then(() => {
          updateBinParts();
        });
      }
      else if(binObject.name === 'partBin' && rollOverMesh !== null)
      {
        returnPartToStock(rollOverMesh);
        clearRolloverObject();
        updatePieces().then(() => {
          updateBinParts();
        });
      }
    }
  }
}

/**
 * There is a bug when changing rollOverMeshes where there will be more than one on the scene at the same time
 */
function clearPreviousRollOverObject() {
  scene.children.forEach(elem => {
    if (elem.name == 'rollOverMesh' && elem.userData.modelType != currentRollOverModel)
      scene.remove(elem);
  });
}

function getPartGeometry(partID, onLoaded)
{
    if(partModelCache[partID])
    {
        onLoaded(partModelCache[partID]);
    }
    else
    {
        let loader = new THREE.STLLoader();

        loader.load(allModels[partID].directory, function(geometry) {
            geometry.scale(allModels[partID].scale, allModels[partID].scale, allModels[partID].scale);
            geometry.rotateX(- Math.PI / 2);
            geometry.computeBoundingBox();
            geometry.translate(-(geometry.boundingBox.min.x + geometry.boundingBox.max.x) / 2, -geometry.boundingBox.min.y,
                -(geometry.boundingBox.min.z + geometry.boundingBox.max.z) / 2);

            partModelCache[partID] = geometry;
            onLoaded(geometry);
        });
    }
}

function updateBinParts()
{
  const BASE_PART_OFFSET = new THREE.Vector3(50, 20, 50),
        PART_COL_SPACING = new THREE.Vector3(30, 0, 0),
        PART_ROW_SPACING = new THREE.Vector3(0, 0, 30),
        PART_LEVEL_SPACING = new THREE.Vector3(0, 20, 0);

  let binCollection = getActiveWorkbench().getObjectByName('Bins').children;
  binCollection.forEach(thisBin => {
    for(let i = thisBin.children.length - 1; i >= 0; i--)
    {
      thisBin.remove(thisBin.children[i]);
    }
  });

  let rayOrigin = new THREE.Vector3();
  binCollection[0].getWorldPosition(rayOrigin);
  rayOrigin.add(BASE_PART_OFFSET);
  let binRaycaster = new THREE.Raycaster(rayOrigin, new THREE.Vector3(1, 0, 0), 1, 1000);
  let binIntersectXDist = binRaycaster.intersectObject(binCollection[0])[0].distance;
  binRaycaster.set(rayOrigin, new THREE.Vector3(0, 0, 1));
  let binIntersectZDist = binRaycaster.intersectObject(binCollection[0])[0].distance;

  pieces.forEach((thisPieceInfo, thisPieceIndex) => {
    let binIndex = binPartIDs.findIndex(value => value === thisPieceInfo.partID);

    if(binIndex !== -1)
    {
      getPartGeometry(thisPieceInfo.partID, function (geometry) {
        geometry.computeBoundingBox();
        let modelColor = tinycolor(BrickColors.findByColorID(thisPieceInfo.color).RGBString);
        let material = new THREE.MeshPhongMaterial({
          transparent: true, opacity: modelColor.getAlpha(),
          color: modelColor.toHexString(), shininess: 30, specular: 0x111111
        });

        let templateMesh = new THREE.Mesh(geometry, material);

        let adjustedBoundingBox = (new THREE.Box3()).setFromPoints([geometry.boundingBox.max, geometry.boundingBox.min]);
        let adjustedBoundingBoxSize = (new THREE.Vector3()).copy(adjustedBoundingBox.max).sub(adjustedBoundingBox.min);

        templateMesh.userData.isPart = true;
        templateMesh.userData.dimensions = adjustedBoundingBoxSize;
        templateMesh.userData.modelType = thisPieceInfo.partID;
        templateMesh.userData.colorInfo = thisPieceInfo.color;

        let parentBin = binCollection[binIndex];

        let newColGroupOffset = (new THREE.Vector3()).setX(adjustedBoundingBoxSize.x).add(PART_COL_SPACING)
            .multiplyScalar(parentBin.children.length);
        let columnGroup;

        let partLevel;
        if (parentBin.children.length === 0 || newColGroupOffset.x + adjustedBoundingBoxSize.x <= binIntersectXDist) {
          columnGroup = new THREE.Group();
          parentBin.add(columnGroup);
          columnGroup.position.copy(BASE_PART_OFFSET).sub(adjustedBoundingBox.min).add(newColGroupOffset);

          partLevel = 0;
        } else {
          let allGroupMinLevel = Number.POSITIVE_INFINITY;
          let minLevelGroup = null;

          parentBin.children.forEach(thisGroup => {
            if (thisGroup.userData.maxLevel < allGroupMinLevel) {
              minLevelGroup = thisGroup;
              allGroupMinLevel = thisGroup.userData.maxLevel;
            }
          });

          partLevel = allGroupMinLevel + 1;
          columnGroup = minLevelGroup;
        }

        let partColorGroup = new THREE.Group();
        partColorGroup.name = thisPieceInfo.color.toString();
        columnGroup.add(partColorGroup);

        let partRow = 0;
        for (let partNum = 0; partNum < thisPieceInfo.count; partNum++, partRow++) {
          if (adjustedBoundingBoxSize.z * (partRow + 1) + PART_ROW_SPACING.z * partRow > binIntersectZDist) {
            partLevel++;
            partRow = 0;
          }

          let thisPieceMesh = templateMesh.clone();
          let rowOffset = (new THREE.Vector3()).setZ(adjustedBoundingBoxSize.z).add(PART_ROW_SPACING)
              .multiplyScalar(partRow);
          let levelOffset = (new THREE.Vector3()).setY(adjustedBoundingBoxSize.y).add(PART_LEVEL_SPACING)
              .multiplyScalar(partLevel);
          thisPieceMesh.position.copy(rowOffset).add(levelOffset);

          partColorGroup.add(thisPieceMesh);
        }

        columnGroup.userData.maxLevel = partLevel;
      });
    }
  });
}

/**
 * Handles placing the object on the scene and creating the collision object
 * @param {THREE.Intersection} intersect
 * @param {function} cb this is to return whether or not the object has been placed
 */
function placeLego(intersect, cb) {
  let placementPossible = true;
  let index = allModels.indexOf(currentObj);

  // getPartGeometry(index, function(geometry) {
  // i wanted to break up this function so i needed to pass these variables by reference
  let modelObj = rollOverMesh, size = new THREE.Vector3();
  // generateObjFromModel(geometry, modelObj, size);

  let box = new THREE.Box3().setFromObject(modelObj);
  box.getSize(size);

  if (intersect.object.name === 'plane') {
      //changeObjPosOnPlane(modelObj, intersect, size);
      let mName = allModels[currentRollOverModel].name.split(' ');
      if (mName[0] === 'Rim' || mName[0] === 'Tire') {
        placementPossible = false;
      }
  }
  else {
      let dim = intersect.face.normal;
      dim.normalize();
      // TODO: THERE SEEMS TO BE A PROBLEM WITH A SLIGHTLY LOWER PLACEMENT THAN IT SHOULD BE
      let iName = intersect.object.userData.obj.name.split(' ');
      let mName = allModels[currentRollOverModel].name.split(' ');

      // this is lazy programming. i don't want to handle the array bounds
      // i did this all already in a better manner but it was lost with my desktop. RIP
      if ((iName[1] == 'Pin' || iName[1] == 'Double' || iName[0] == 'Rim') && (mName[0] == 'Rim' || mName[0] == 'Tire')) {
          placementPossible = determineWheelPosition(modelObj, intersect, dim);
      }
      else {
          placementPossible = determineModelPosition(modelObj, intersect, size, dim);
      }
  }


  let collisionCube;
  // If the piece can't be placed on another, I don't want it to create and add the modelObj to the scene
  if (placementPossible) {
      scene.add(modelObj);
      objects.push(modelObj);
      collisionCube = generateCollisionCube(modelObj, size);
      clearRolloverObject();
  }

  cb(placementPossible, modelObj, collisionCube);
  // });
}

/**
 * The STLloader gets the model and turns it into a THREE.Geometry.
 * This function turns the geometry into a mesh and determines the size
 * @param {THREE.Geometry} geometry 
 * @param {THREE.MESH} modelObj 
 * @param {THREE.Vector3} size 
 */
/*function generateObjFromModel(geometry, modelObj, size) {
  let modelColor = tinycolor(BrickColors.findByColorID(pieces[pieceIndex].color).RGBString);

  geometry.computeBoundingBox();
  let material = new THREE.MeshPhongMaterial({transparent: true, opacity: modelColor.getAlpha(),
    color: modelColor.toHexString(), shininess: 30, specular: 0x111111});
  modelObj.mesh = new THREE.Mesh(geometry, material);
  modelObj.mesh.rotation.x = rollOverMesh.rotation.x;
  modelObj.mesh.rotation.y = rollOverMesh.rotation.y;
  modelObj.mesh.rotation.z = rollOverMesh.rotation.z;
  modelObj.mesh.scale.set(currentObj.scale,currentObj.scale,currentObj.scale);
  modelObj.mesh.userData.colorInfo = pieces[pieceIndex].color;

  // group.add(modelObj.mesh);
  let box = new THREE.Box3().setFromObject(modelObj.mesh);
  size.size = new THREE.Vector3();
  box.getSize(size.size);
}*/

/**
 * Generates the collision box around the mesh
 * TODO: Fix the sizing of the collision boxes
 * @param {THREE.Mesh} modelObj 
 * @param {THREE.Vector3} size 
 */
function generateCollisionCube(modelObj, size) {
  // turns out these aren't 0 by default and caused me so much trouble until i did this
  let yModifier = currentObj.collisionY ? currentObj.collisionY : 0;
  let zModifier = currentObj.collisionZ ? currentObj.collisionZ : 0;
  let xModifier = currentObj.collisionX ? currentObj.collisionX : 0;

  // Create the collision cube
  let geo = new THREE.BoxGeometry(size.x, size.y - yModifier, size.z - zModifier);
  geo.translate(0, (size.y - yModifier) / 2, 0);
  let mat = new THREE.MeshBasicMaterial({color: 0x00ff00, visible: false});
  let cube = new THREE.Mesh(geo, mat);
  cube.position.copy(modelObj.position);
  scene.add(cube);

  // fixModelCollisionPosition(cube, modelObj, size, xModifier, yModifier, zModifier);
  collisionObjects.push(cube);

  /* This creates a bounding box around the collision cube. 
  let helper = new THREE.BoxHelper(cube, 0xff0000);
  helper.update();
  // visible bounding box
  scene.add(helper);
  helper.name = modelObj.name + ".helper";
  cube.children.push(helper);  
  */

  // add names to all of the objects for debugging purposes
  modelObj.name = 'obj' + objects.length;
  cube.name = modelObj.name + '.collisionObj';

  cube.userData.dimensions = size;
  cube.userData.obj = currentObj;
  cube.userData.rotation = (modelObj.rotation.z / (Math.PI / 2)) % 4;

  cube.children.push(modelObj);

  return cube;
}

/**
 * Determines which face of the model the object is being placed on
 * and then adjusts the objects position in the scene accoridingly 
 * @param {THREE.Mesh} modelObj 
 * @param {THREE.Intersection} intersect 
 * @param {THREE.Vector3} size 
 * @param {THREE.Vector3} dim 
 */
function determineModelPosition(modelObj, intersect, size, dim) {
  let rollPos = rollOverMesh.position;
  let interPos = intersect.object.position;
  let collisionModel = intersect.object.userData.obj;
  let rotation = (modelObj.rotation.z / (Math.PI / 2)) % 4;

  let rotationMatrix = determineRotationMatrix(intersect, rotation);

  if (dim.z == 1 && rotationMatrix[0] == 1) {
    modelObj.position.z = interPos.z + size.z;
    modelObj.position.y = rollPos.y;
    modelObj.position.x = rollPos.x;
  }
  else if (dim.x == 1 && rotationMatrix[1] == 1) {
    modelObj.position.x = interPos.x + size.x;
    modelObj.position.y = rollPos.y;
    modelObj.position.z = rollPos.z;
  }
  else if (dim.y == 1 && collisionModel.top == 1) {
    modelObj.position.y = rollPos.y;
    modelObj.position.x = rollPos.x;
    modelObj.position.z = rollPos.z;
  }
  else if (dim.z == -1 && rotationMatrix[2] == 1) {
    modelObj.position.z = interPos.z - size.z;
    modelObj.position.y = rollPos.y;
    modelObj.position.x = rollPos.x;
  }
  else if (dim.x == -1 && rotationMatrix[3] == 1) {
    modelObj.position.x = interPos.x - size.x;
    modelObj.position.y = rollPos.y;
    modelObj.position.z = rollPos.z;
  }
  else if (dim.y == -1 && collisionModel.bottom == 1) {
    modelObj.position.y = interPos.y - (size.y / 2) - size.y;
    modelObj.position.x = rollPos.x;
    modelObj.position.z = rollPos.z;
  }
  else {
    scene.remove(modelObj);
    return false;
  }

  /*const gridSize = new THREE.Vector2(24, 24),
        gridOffset = new THREE.Vector2(12, 12);

  var snappedPosition = getGridSnapPosition2D(new THREE.Vector2(modelObj.position.x, modelObj.position.z), gridSize, gridOffset);
  modelObj.position.setX(snappedPosition.x);
  modelObj.position.setZ(snappedPosition.y);*/

  return true;
}

/**
 * This function snaps origPos to a 2D grid with element size vector gridSize, offsetting the result snapOffset
 * from the nearest grid node; it returns the snapped position vector.
 * @param {THREE.Vector2} origPos
 * @param {THREE.Vector2} gridSize
 * @param {THREE.Vector2} snapOffset
 * @returns {THREE.Vector2}
 */
function getGridSnapPosition2D(origPos, gridSize, snapOffset)
{
  return new THREE.Vector2(
    Math.round(origPos.x / gridSize.x) * gridSize.x + snapOffset.x,
    Math.round(origPos.y / gridSize.y) * gridSize.y + snapOffset.y
  );
}

/**
 * Gets the numeric position value for a basis from which to position grid snapping
 * @param {Model.SnapBasis} snapBasis
 * @param {number} minValue
 * @param {number} maxValue
 */
function getSnapBasisValue(snapBasis, minValue, maxValue)
{
  switch (snapBasis) {
    case Model.SnapBasis.BASIS_MIN:
      return minValue;
    case Model.SnapBasis.BASIS_MAX:
      return maxValue;
    case Model.SnapBasis.BASIS_CENTER:
      return (minValue + maxValue) / 2;
  }
}

/**
 * This function moves objToMove to a grid-snapped position.
 * @param {THREE.Mesh} objToMove
 */
function moveToSnappedPosition(objToMove)
{
  objToMove.geometry.computeBoundingBox();
  let partID = objToMove.userData.modelType;
  let gridOffset = new THREE.Vector2(allModels[partID].snapOffsetX, allModels[partID].snapOffsetZ);

  let snapPoint = (new THREE.Vector3(
    getSnapBasisValue(allModels[partID].snapOffsetBasisX, objToMove.geometry.boundingBox.min.x, objToMove.geometry.boundingBox.max.x),
    0,
    getSnapBasisValue(allModels[partID].snapOffsetBasisZ, objToMove.geometry.boundingBox.min.z, objToMove.geometry.boundingBox.max.z)
  )).add(new THREE.Vector3(
    allModels[partID].snapOffsetX * TILE_DIMENSIONS.x,
    0,
    allModels[partID].snapOffsetZ * TILE_DIMENSIONS.y
  )).applyEuler(objToMove.rotation);

  let origCornerPos = new THREE.Vector2(
    objToMove.position.x + snapPoint.x,
    objToMove.position.z + snapPoint.z
  );

  let snappedCornerPos = getGridSnapPosition2D(origCornerPos, TILE_DIMENSIONS, new THREE.Vector2(0, 0));
  objToMove.position.x += (snappedCornerPos.x - origCornerPos.x);
  objToMove.position.z += (snappedCornerPos.y - origCornerPos.y);
}

/**
 * The wheel position needs to be determined separately as 
 * the interaction between the pins, tires, and rims act differently
 * @param {*} modelObj 
 * @param {*} intersect
 * @param {*} dim 
 */
function determineWheelPosition(modelObj, intersect, dim) {
  let interPos = intersect.object.position;
  let collisionModel = intersect.object.userData.obj;
  let rotation = (modelObj.rotation.z / (Math.PI / 2)) % 4;
  let rotationMatrix = determineRotationMatrix(intersect, rotation);  

  let typeColl = collisionModel.name.split(' ');
  let typeModel = allModels[modelObj.userData.modelType].name.split(' ');
  if (typeColl.length == 1) {
    scene.remove(modelObj);
    return false;
  }

  if ((typeColl[1] == 'Pin' || typeColl[1] == 'Double') && typeModel[0] == 'Rim') {
    return attachRimToPin(modelObj, intersect, dim);
  }

  if (typeColl[0] == 'Rim' && typeModel[0] == 'Tire' && typeColl[1] == typeModel[1]) {
    return attachTireToRim(modelObj, intersect, dim);
  }

  scene.remove(modelObj);
  return false;
}

function attachRimToPin(modelObj, intersect, dim) {
  modelObj.geometry.computeBoundingBox();
  let modelDims = (new THREE.Vector3()).copy(modelObj.geometry.boundingBox.max).sub(modelObj.geometry.boundingBox.min);
  let collisionPos = intersect.object.position;
  let dimensions = intersect.object.userData.dimensions;
  if (Math.abs(dim.z) == 1 || Math.abs(dim.x) == 1) {
    modelObj.position.x = dim.x != 0 ? collisionPos.x + dimensions.x / 2 * dim.x : collisionPos.x;
    modelObj.position.y = collisionPos.y + (dimensions.y - modelDims.y) / 2;
    modelObj.position.z = dim.z != 0 ? collisionPos.z + dimensions.z / 2 * dim.z : collisionPos.z;
  }
  else {
    scene.remove(modelObj);
    return false;
  }
  return true;
}

function attachTireToRim(modelObj, intersect, dim) {
  modelObj.geometry.computeBoundingBox();
  let modelDims = (new THREE.Vector3()).copy(modelObj.geometry.boundingBox.max).sub(modelObj.geometry.boundingBox.min);
  let collisionPos = intersect.object.position;
  let dimensions = intersect.object.userData.dimensions;
  if (Math.abs(dim.z) == 1 || Math.abs(dim.x) == 1) {
    modelObj.position.y = collisionPos.y + (dimensions.y - modelDims.y) / 2;
    modelObj.position.x = collisionPos.x;
    modelObj.position.z = collisionPos.z;
  }
  else {
    scene.remove(modelObj);
    return false;
  }
  return true;
}

/**
 * The models have the possiblePlacement attributes that are relative to the global orientation
 * so when the objects get rotated, their placement attributes do not. 
 * I rotate them so that the placement attributes match the objects orientation
 * @param {THREE.Intersection} intersect 
 * @param {Number} rotation 
 */
function determineRotationMatrix(intersect, rotation) {
  let userData = intersect.object.userData.obj;
  let possiblePlacement = [userData.front, userData.right, userData.back, userData.left];
  let adjustedArray = [];

  possiblePlacement.forEach((elem, i) => {
    adjustedArray[mod(i + rotation, possiblePlacement.length)] = elem;
  });
  
  return adjustedArray;
}

/**
 * Apparently Javascript is super dumb and doesn't want to handle negative modulo operations
 * @param {Number} m
 * @param {Number} n
 */
function mod(n, m) {
  return (((n % m) + m) % m);
}

/**
 * A lot of the models have different center points
 * so I need to make sure all they link correctly with the plane and other models
 */

/*
function determineModelYTranslation() {
  // whoever made these retarded models needs to learn about consistency
  return -((new THREE.Box3()).setFromObject(rollOverMesh).min.y);
  let y = rollOverMesh.userData.dimensions.y;
  switch(currentObj.name) {
    case 'Steering Wheel': return y / 2 - 9;
    case '2x3x2': return y - 7;
    case 'Tire 1':
    case 'Tire 2':
    case 'Tire 3':
    case 'Rim 1':
    case 'Rim 2':
    case 'Rim 3': return y / 2 + 2;
  }
  switch(currentObj.yTranslation) {
    case 1: return y - 5.5;
    case 0: return y / 2;
    case -1: return 0;
  }
}
 */

/*
function fixModelCollisionPosition(cube, modelObj, size, xModifier, yModifier, zModifier) {
  cube.position.copy(modelObj.position);
  // some of these models are stupid and require special treatment ...
  cube.position.y -= determineModelYTranslation() - size.y / 2 + yModifier - 2;
  // i swear ... i should have modeled these pieces myself
  if (Math.abs(modelObj.rotation.z) % Math.PI == 0) {
    // some models need to have their collision cube rotated
    let multiplier = Math.floor(modelObj.rotation.z / Math.PI) % 2 != 0 ? -1 : 1;
    switch(modelObj.userData.modelType) {
      case '2x3x2': cube.position.x += (size.x / 2 - xModifier) * multiplier; break;
      case '1x2 Pin': cube.position.z += (size.z / 2 - 12) * multiplier; break;      
      case '2x2 Pin': cube.position.x += (size.x / 6 - 3) * multiplier; break;
      case '2x2x2 Pin': cube.position.x += (size.x / 6) * multiplier; break;
      case 'Windshield': cube.position.z += (size.z / 4) * multiplier; break;
      case 'Lego Man': cube.position.z += 2 * multiplier; break;
    }
  }
  else {
    let multiplier = Math.floor((modelObj.rotation.z / (Math.PI / 2) - 1) / 2) % 2 != 0 ? -1 : 1;
    switch(modelObj.userData.modelType) {
      case '2x3x2': cube.position.z -= (size.z / 2 - xModifier) * multiplier; break;
      case '1x2 Pin': cube.position.x += (size.x / 2 - 12) * multiplier; break;
      case '2x2 Pin': cube.position.z -= (size.z / 6 - 3) * multiplier; break;
      case '2x2x2 Pin': cube.position.z -= (size.z / 6) * multiplier; break;
      case 'Windshield': cube.position.x += (size.x / 4) * multiplier; break;
      case 'Lego Man': cube.position.x += 2 * multiplier; break;
    }
  }
}
 */


// I decided that I didn't really like the snapping
// I might come back to it later though
/**
 * Changes position of passed in object so that it snaps to grid
 * This is to avoid overlapping that can happen if two objects are too close
 * This allows the plane to handle the different sized legos
 * @param {THREE.Mesh} obj 
 * @param {THREE.Object3D} intersect
 * @param {THREE.Vector3} size
 */
/*
function changeObjPosOnPlane(obj, intersect, size) {
  // QUICK MAFFS
  let normalizedCoord = {};
  normalizedCoord.x = Math.floor(intersect.point.x);
  normalizedCoord.z = Math.floor(intersect.point.z);
  normalizedCoord.x += normalizedCoord.x < 0 ? size.x / 2 : size.x / -2;
  normalizedCoord.z += normalizedCoord.z < 0 ? size.z / 2 : size.z / -2;
  normalizedCoord.x = Math.floor(normalizedCoord.x / size.x);
  normalizedCoord.z = Math.floor(normalizedCoord.z / size.z);
  //obj.position.copy(intersect.point).add(intersect.face.normal);
  obj.position.x = size.x / 2 + size.x * normalizedCoord.x;
  obj.position.z = size.z / 2 + size.z * normalizedCoord.z;
}
*/