/**
 * author: Daniel Kovalevich
 * purpose: Created for research project with Dr. Aqlan of PSU
 */

'use strict';

/**
 * ================================================================
 *          INITIALIZE SCENE AND STATE VARIABLES
 * ================================================================
 */

if (!Detector.webgl)
  Detector.addGetWebGLMessage();
var container;
var camera, scene, renderer, controls;
var plane, cube;
var mouse, raycaster, isCtrlDown = false, isShiftDown = false;
var rollOverMesh = null, material, collisionBox;
let partModelCache = {};
const TILE_DIMENSIONS = new THREE.Vector2(24, 24);
var objects = [], collisionObjects = [];
var currentObj = null;
// var group = new THREE.Group();

// Kicks off the program
$(function() {
  init();
  animate();
  render();
});

function init() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0xf0f0f0);
  createEnvironment(() => {
    createGridAndPlane(scene.getObjectByName('Environment').getObjectByName('Room')
      .getObjectByName('Workbenches').children[0]);
  }, checkPieces);

  //objects.push(plane);
  raycaster = new THREE.Raycaster();
  mouse = new THREE.Vector2();
  addSceneLights();
  initCamera();
  // Event listeners
  document.addEventListener('mousemove', onDocumentMouseMove, false);
  document.addEventListener('mousedown', onDocumentMouseDown, false);
  document.addEventListener('keydown', onDocumentKeyDown, false);
  document.addEventListener('keyup', onDocumentKeyUp, false);
  renderer.domElement.addEventListener('wheel', onRendererMouseWheel, false);
  window.addEventListener('resize', onWindowResize, false);
  window.addEventListener('beforeunload', onBeforePageUnload);
  window.addEventListener('unload', onPageUnload);
}

// Initializes the camera -- Allows to use mouse wheel to zoom
function initCamera() {
  //camera = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight + (window.innerHeight * .1)), 1, 10000);
  camera = new THREE.PerspectiveCamera(60, $(renderer.domElement).width() / $(renderer.domElement).height(), 1, 100000);
  camera.position.set(0, 500, 800);
  camera.lookAt(new THREE.Vector3());
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  // controls.addEventListener( 'change', render );
  controls.rotateSpeed = 1.0;
  controls.zoomSpeed = 1;
  controls.panSpeed = 0.8;
  controls.enableZoom = true;
  controls.enablePan = true;
  controls.enableDamping = false;
  controls.dampingFactor = 0.75;
  controls.minDistance = 200;
	controls.maxDistance = 10000;
}

function computeRendererSize()
{
  return {
    width: window.innerWidth,
    height: (window.innerHeight - $(renderer.domElement).offset().top)
  };
}

// Adds header information at the top of the page
/*function generateHeaderInfo() {
  container = document.createElement('div');
  document.body.appendChild(container);
  var info = document.createElement('div');
  info.style.position = 'relative';
  info.style.backgroundColor = '0xf0f0f0';
  //info.style.top = '10px';
  info.style.width = '100%';
  info.style.textAlign = 'center';
  info.innerHTML = 
    '' +
    '' + 
    '';
  container.appendChild(info);
}*/

function addSceneLights() {
  container = document.createElement('div');
  document.body.appendChild(container);
  var ambientLight = new THREE.AmbientLight(0x606060);
  scene.add(ambientLight);
  var directionalLight = new THREE.DirectionalLight(0xffffff);
  directionalLight.position.set(1, 0.75, 0.5).normalize();
  scene.add(directionalLight);
  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setPixelRatio(window.devicePixelRatio);
  container.appendChild(renderer.domElement);

  let initialRendererSize = computeRendererSize();
  renderer.setSize(initialRendererSize.width, initialRendererSize.height);
}

function makeGrid(startX, startZ, endX, endZ, elemSizeX, elemSizeZ)
{
  let geometry = new THREE.Geometry();

  for(let i = 0; (startX + (i - 0.5) * elemSizeX) < endX; i++)
  {
    let thisX = startX + (i * elemSizeX);
    geometry.vertices.push(new THREE.Vector3(thisX, 0, startZ));
    geometry.vertices.push(new THREE.Vector3(thisX, 0, endZ));
  }

  for(let i = 0; (startZ + (i - 0.5) * elemSizeZ) < endZ; i++)
  {
    let thisZ = startZ + (i * elemSizeZ);
    geometry.vertices.push(new THREE.Vector3(startX, 0, thisZ));
    geometry.vertices.push(new THREE.Vector3(endX, 0, thisZ));
  }

  return new THREE.LineSegments(geometry, new THREE.LineBasicMaterial({
    color: "#000000",
    linewidth: 1
  }))
}

function createGridAndPlane(workbenchObj) {
  workbenchObj.geometry.computeBoundingBox();
  let minCorner = (new THREE.Vector3()).copy(workbenchObj.position).add(workbenchObj.geometry.boundingBox.min),
      maxCorner = (new THREE.Vector3()).copy(workbenchObj.position).add(workbenchObj.geometry.boundingBox.max);
  let startX = Math.trunc(minCorner.x / TILE_DIMENSIONS.x) * TILE_DIMENSIONS.x,
      endX = Math.trunc(maxCorner.x / TILE_DIMENSIONS.x) * TILE_DIMENSIONS.x,
      endZ = Math.trunc(maxCorner.z / TILE_DIMENSIONS.y) * TILE_DIMENSIONS.y,
      startZ = endZ - (TILE_DIMENSIONS.y * 24);
  let gridHelper = makeGrid(startX, startZ, endX, endZ, TILE_DIMENSIONS.x, TILE_DIMENSIONS.y);// new THREE.GridHelper(PLANE_LENGTH, NUM_GRID_TILES);
  scene.add(gridHelper);
  let geometry = new THREE.PlaneBufferGeometry(endX - startX, endZ - startZ);
  geometry.rotateX(-Math.PI / 2);
  plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({visible: false}));
  plane.position.set((startX + endX) / 2, 0, (startZ + endZ) / 2);
  plane.name = 'plane';
  scene.add(plane);
  collisionObjects.push(plane);
}

function addMeshRow(templateMesh, newMeshParent, startX, yPos, zPos, spacing, numMeshes)
{
  templateMesh.geometry.computeBoundingBox();
  let posMultiplier = (templateMesh.geometry.boundingBox.max.x - templateMesh.geometry.boundingBox.min.x) + spacing;

  for(let i = 0; i < numMeshes; i++)
  {
    let thisMesh = templateMesh.clone();
    thisMesh.position.copy(new THREE.Vector3(startX + i * posMultiplier, yPos, zPos));

    newMeshParent.add(thisMesh);
  }
}

function createEnvironment(onRoomCompleted, onBinsCompleted)
{
  let modelLoader = new THREE.STLLoader();
  modelLoader.load('../objects/environment/workbench.stl', function(workbenchGeometry) {
    workbenchGeometry.scale(30, 30, 30);
    workbenchGeometry.computeBoundingBox();

    let material = new THREE.MeshPhongMaterial({
      color: '#8b5a2b',
      shininess: 30,
      specular: '#ffb245'
    });

    /*let testGeom = new THREE.PlaneBufferGeometry(200, 200, 1, 1);
    let testMesh = new THREE.Mesh(testGeom, material);
    scene.add(testMesh);*/

    // assignUVs(workbenchGeometry);
    let workbenchTemplateMesh = new THREE.Mesh(workbenchGeometry, material);

    let bboxSize = new THREE.Vector3();
    workbenchGeometry.boundingBox.getSize(bboxSize);
    // workbenchTemplateMesh.position.copy(new THREE.Vector3(-(bboxSize.x / 2), 925, -1000));
    // workbenchTemplateMesh.userData.envObject = true;

    let envGroup = new THREE.Group();
    envGroup.name = 'Environment';
    scene.add(envGroup);

    let roomGroup = new THREE.Group();
    roomGroup.name = 'Room';
    envGroup.add(roomGroup);

    let workbenchGroup = new THREE.Group();
    workbenchGroup.name = 'Workbenches';
    roomGroup.add(workbenchGroup);

    const cornerWorkbenchPos = new THREE.Vector3(-(bboxSize.x / 2), 925, -1000);
    addMeshRow(workbenchTemplateMesh, workbenchGroup, cornerWorkbenchPos.x, cornerWorkbenchPos.y, cornerWorkbenchPos.z, 200, 3);
    // scene.add(workbenchTemplateMesh);

    modelLoader.load('../objects/environment/part_bin.stl', function(binGeometry) {
      let binStartX = 175; // -(bboxSize.x / 2) + 175;
      let backBinZ = -450,
      frontBinZ = 75;

      let binMaterial = new THREE.MeshPhongMaterial({
        color: "#0000ff",
        shininess: 5,
        specular: "#d6d0ff"
      });

      let binTemplateMesh = new THREE.Mesh(binGeometry, binMaterial);
      binTemplateMesh.name = "partBin";

      addMeshRow(binTemplateMesh, workbenchGroup.children[0], binStartX, -cornerWorkbenchPos.y, frontBinZ, 50, 12);
      addMeshRow(binTemplateMesh, workbenchGroup.children[0], binStartX, -cornerWorkbenchPos.y, backBinZ, 50, 12);
      addMeshRow(binTemplateMesh, workbenchGroup.children[0], binStartX, 0, backBinZ, 50, 7);

      if(onBinsCompleted) {
        onBinsCompleted();
      }
    }, undefined, function(ex) {
      console.trace(ex);
    });

    let workbenchCorner = (new THREE.Vector3()).copy(cornerWorkbenchPos).add(workbenchGeometry.boundingBox.min);

    let texLoader = new THREE.TextureLoader();
    texLoader.load('../images/Door_Texture.jpg', (doorTexture => {
      const roomHeight = 8000;
      const doorWidth = (doorTexture.image.width / doorTexture.image.height) * roomHeight;

      let doorGeometry = new THREE.PlaneBufferGeometry(doorWidth, roomHeight);
      let doorMaterial = new THREE.MeshBasicMaterial({
        map: doorTexture
      });
      let doorMesh = new THREE.Mesh(doorGeometry, doorMaterial);
      doorMesh.position.set(workbenchCorner.x + (doorWidth / 2), workbenchCorner.y + (roomHeight / 2), workbenchCorner.z + 16000);
      doorMesh.rotateY(Math.PI);
      roomGroup.add(doorMesh);

      const wallParams = [
        {
          position: new THREE.Vector3(workbenchCorner.x, workbenchCorner.y, workbenchCorner.z + 8000),
          rotation: new THREE.Euler(0, (Math.PI / 2), 0),
          size: new THREE.Vector2(16000, roomHeight)
        },
        {
          position: new THREE.Vector3(workbenchCorner.x + 16000, workbenchCorner.y, workbenchCorner.z),
          rotation: new THREE.Euler(0, 0, 0),
          size: new THREE.Vector2(32000, roomHeight)
        },
        {
          position: new THREE.Vector3(workbenchCorner.x + 32000, workbenchCorner.y, workbenchCorner.z + 8000),
          rotation: new THREE.Euler(0, -(Math.PI / 2), 0),
          size: new THREE.Vector2(16000, roomHeight)
        },
        {
          position: new THREE.Vector3(workbenchCorner.x + 16000 + (doorWidth / 2), workbenchCorner.y, workbenchCorner.z + 16000),
          rotation: new THREE.Euler(0, Math.PI, 0),
          size: new THREE.Vector2(32000 - doorWidth, roomHeight)
        }
      ];

      texLoader.load('../images/Wall_Texture.jpg', (wallTemplateTexture => {
        const imageWorldSize = new THREE.Vector2(1000, 1000);
        wallTemplateTexture.wrapS = wallTemplateTexture.wrapT = THREE.RepeatWrapping;

        wallParams.forEach((elem) => {
          let thisWallTexture = wallTemplateTexture.clone();
          thisWallTexture.repeat = new THREE.Vector2(
            elem.size.x / imageWorldSize.x,
            elem.size.y / imageWorldSize.y
          );

          let thisWallMaterial = new THREE.MeshBasicMaterial({
            map: thisWallTexture
          });
          thisWallTexture.needsUpdate = true;
          let thisWallGeometry = new THREE.PlaneBufferGeometry(elem.size.x, elem.size.y);

          let thisWallMesh = new THREE.Mesh(thisWallGeometry, thisWallMaterial);
          thisWallMesh.position.copy(elem.position);
          thisWallMesh.position.y += (elem.size.y / 2);
          thisWallMesh.setRotationFromEuler(elem.rotation);

          roomGroup.add(thisWallMesh);
        });

        if(onRoomCompleted) {
          onRoomCompleted();
        }
      }), undefined, function (ex) {
        console.trace(ex);
      });
    }), undefined, function(ex) {
      console.trace(ex);
    });

    texLoader.load('../images/Floor_Texture.jpg', (floorTexture) => {
      const floorImageWorldSize = new THREE.Vector2(1500, 1500);
      const floorSize = new THREE.Vector2(32000, 16000);

      floorTexture.repeat.set(
        floorSize.x / floorImageWorldSize.x,
        floorSize.y / floorImageWorldSize.y
      );
      floorTexture.wrapS = floorTexture.wrapT = THREE.RepeatWrapping;
      floorTexture.needsUpdate = true;

      let floorGeometry = new THREE.PlaneBufferGeometry(floorSize.x, floorSize.y);
      let floorMaterial = new THREE.MeshBasicMaterial({
        map: floorTexture
      });

      let floorMesh = new THREE.Mesh(floorGeometry, floorMaterial);
      floorMesh.position.set(workbenchCorner.x + 16000, workbenchCorner.y, workbenchCorner.z + 8000);
      floorMesh.rotateX(-(Math.PI / 2));
      roomGroup.add(floorMesh);
    }, undefined, function(ex) {
      console.trace(ex);
    });

  }, undefined, function(ex) {
    console.trace(ex);
  });
}

function onWindowResize() {
  let newRendererSize = computeRendererSize();

  camera.aspect = newRendererSize.width / newRendererSize.height;
  camera.updateProjectionMatrix();
  renderer.setSize(newRendererSize.width, newRendererSize.height);
}

function render() { renderer.render(scene, camera); }

function animate() {
  controls.update();
  render();
  requestAnimationFrame(animate);
}