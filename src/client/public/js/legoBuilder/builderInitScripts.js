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
var rollOverMesh, material, collisionBox;
const TILE_LENGTH = 24,
      NUM_GRID_TILES = 40;
const PLANE_LENGTH = TILE_LENGTH * NUM_GRID_TILES;
var objects = [], collisionObjects = [];
var currentObj = twoByTwo;
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
  createGridAndPlane();
  createEnvironment();
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
  window.addEventListener('resize', onWindowResize, false);
}

// Initializes the camera -- Allows to use mouse wheel to zoom
function initCamera() {
  //camera = new THREE.PerspectiveCamera(60, window.innerWidth / (window.innerHeight + (window.innerHeight * .1)), 1, 10000);
  camera = new THREE.PerspectiveCamera(60, $(renderer.domElement).width() / $(renderer.domElement).height(), 1, 100000);
  camera.position.set(0, 500, 800);
  camera.lookAt(new THREE.Vector3());
  controls = new THREE.OrbitControls(camera, renderer.domElement);
  controls.addEventListener( 'change', render );
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

function createGridAndPlane() {
  var gridHelper = makeGrid(-1920, -240, 1920, 240, 24, 24);// new THREE.GridHelper(PLANE_LENGTH, NUM_GRID_TILES);
  scene.add(gridHelper);
  var geometry = new THREE.PlaneBufferGeometry(1920 * 2, 240 * 2);
  geometry.rotateX(-Math.PI / 2);
  plane = new THREE.Mesh(geometry, new THREE.MeshBasicMaterial({visible: false}));
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

function createEnvironment()
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

    let workbenchGroup = new THREE.Group();
    workbenchGroup.name = 'WorkbenchGroup';
    envGroup.add(workbenchGroup);

    const cornerWorkbenchPos = new THREE.Vector3(-(bboxSize.x / 2), 925, -1000);
    addMeshRow(workbenchTemplateMesh, workbenchGroup, cornerWorkbenchPos.x, cornerWorkbenchPos.y, cornerWorkbenchPos.z, 200, 3);
    // scene.add(workbenchTemplateMesh);

    modelLoader.load('../objects/environment/part_bin.stl', function(binGeometry) {
      let binStartX = 175; // -(bboxSize.x / 2) + 175;
      let binZ = -450;

      let binMaterial = new THREE.MeshPhongMaterial({
        color: "#0000ff",
        shininess: 5,
        specular: "#d6d0ff"
      });

      let binTemplateMesh = new THREE.Mesh(binGeometry, binMaterial);

      addMeshRow(binTemplateMesh, workbenchGroup.children[0], binStartX, -cornerWorkbenchPos.y, binZ, 50, 12);
      addMeshRow(binTemplateMesh, workbenchGroup.children[0], binStartX, 0, binZ, 50, 10);
    }, undefined, function(ex) {
      console.trace(ex);
    });

    let roomGroup = new THREE.Group();
    roomGroup.name = "RoomGroup";
    envGroup.add(roomGroup);

    let workbenchCorner = (new THREE.Vector3()).copy(cornerWorkbenchPos).add(workbenchGeometry.boundingBox.min);
    const wallParams = [
      {
        position: new THREE.Vector3(workbenchCorner.x, workbenchCorner.y, workbenchCorner.z + 8000),
        rotation: new THREE.Euler(0, (Math.PI / 2), 0),
        size: new THREE.Vector2(16000, 8000)
      },
      {
        position: new THREE.Vector3(workbenchCorner.x + 16000, workbenchCorner.y, workbenchCorner.z),
        rotation: new THREE.Euler(0, 0, 0),
        size: new THREE.Vector2(32000, 8000)
      },
      {
        position: new THREE.Vector3(workbenchCorner.x + 32000, workbenchCorner.y, workbenchCorner.z + 8000),
        rotation: new THREE.Euler(0, -(Math.PI / 2), 0),
        size: new THREE.Vector2(16000, 8000)
      },
      {
        position: new THREE.Vector3(workbenchCorner.x + 16000, workbenchCorner.y, workbenchCorner.z + 16000),
        rotation: new THREE.Euler(0, Math.PI, 0),
        size: new THREE.Vector2(32000, 8000)
      }
    ];

    let wallTexLoader = new THREE.TextureLoader();
    wallTexLoader.load('../images/Wall_Texture.jpg', (texture => {
      const imageWorldSize = new THREE.Vector2(1000, 1000);
      texture.wrapS = texture.wrapT = THREE.RepeatWrapping;

      wallParams.forEach((elem) => {
        let thisWallTexture = texture.clone();
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
    }), undefined, function(ex) {
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
  requestAnimationFrame(animate);
  controls.update();
}