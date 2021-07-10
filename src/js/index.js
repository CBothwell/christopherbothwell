import * as THREE from 'three';
import Ammo from 'ammo.js';

let physicsWorld, scene, camera, renderer, clock;

let rigidBodies = [];
let tmpTrans;

Ammo().then( function(Ammo) {

  function setupPhysicsWorld () {
    const collisionConfiguration  = new Ammo.btDefaultCollisionConfiguration(),
          dispatcher              = new Ammo.btCollisionDispatcher(collisionConfiguration),
          overlappingPairCache    = new Ammo.btDbvtBroadphase(),
          solver                  = new Ammo.btSequentialImpulseConstraintSolver();

    physicsWorld = new Ammo.btDiscreteDynamicsWorld(dispatcher, overlappingPairCache, solver, collisionConfiguration);
    physicsWorld.setGravity(new Ammo.btVector3(0, -10, 0));
  }

  function setupGraphics () {
    clock = new THREE.Clock();
    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xFFFFFF );

    camera = new THREE.PerspectiveCamera(60, window.innerWidth / window.innerHeight, 0.2, 5000);
    camera.position.set( 0, 30, 70 );
    camera.lookAt(new THREE.Vector3(0, 0, 0));

    const pointLight = new THREE.PointLight(0xffffff);
    pointLight.position.set(5, 5, 5);

    const ambiantLight = new THREE.AmbientLight(0xffffff);
    scene.add(pointLight, ambiantLight);

    renderer = new THREE.WebGLRenderer({
      canvas: document.querySelector("#bg")
    }); 

    renderer.setPixelRatio( window.devicePixelRatio );
    renderer.setSize( window.innerWidth, window.innerHeight );

    renderer.render(scene, camera);
  }

  function renderFrame() {
    let deltaTime = clock.getDelta();
    updatePhysics(deltaTime);

    renderer.render( scene, camera );

    requestAnimationFrame( renderFrame );
  }

  function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize( window.innerWidth, window.innerHeight );
  }
  window.addEventListener( 'resize', onWindowResize, false );

  function start() {
    tmpTrans = new Ammo.btTransform();
    setupPhysicsWorld();

    setupGraphics();
    createBlock();
    createBall();

    renderFrame();
  }

  function createBlock() {
    let pos = {x: 0, y: 0, z: 0};
    let scale = {x: 50, y: 2, z: 50};
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 0;

    //threeJS Section
    let blockPlane = new THREE.Mesh(new THREE.BoxBufferGeometry(), new THREE.MeshPhongMaterial({color: 0xa0afa4}));

    blockPlane.position.set(pos.x, pos.y, pos.z);
    blockPlane.scale.set(scale.x, scale.y, scale.z);

    blockPlane.castShadow = true;
    blockPlane.receiveShadow = true;

    scene.add(blockPlane);

    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btBoxShape( new Ammo.btVector3( scale.x * 0.5, scale.y * 0.5, scale.z * 0.5 ) );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body );
  }

  function createBall() {
    let pos = {x: 0, y: 20, z: 0};
    let radius = 2;
    let quat = {x: 0, y: 0, z: 0, w: 1};
    let mass = 1;

    //threeJS Section
    let ball = new THREE.Mesh(new THREE.SphereBufferGeometry(radius), new THREE.MeshPhongMaterial({color: 0xff0505}));

    ball.position.set(pos.x, pos.y, pos.z);

    ball.castShadow = true;
    ball.receiveShadow = true;

    scene.add(ball);

    //Ammojs Section
    let transform = new Ammo.btTransform();
    transform.setIdentity();
    transform.setOrigin( new Ammo.btVector3( pos.x, pos.y, pos.z ) );
    transform.setRotation( new Ammo.btQuaternion( quat.x, quat.y, quat.z, quat.w ) );
    let motionState = new Ammo.btDefaultMotionState( transform );

    let colShape = new Ammo.btSphereShape( radius );
    colShape.setMargin( 0.05 );

    let localInertia = new Ammo.btVector3( 0, 0, 0 );
    colShape.calculateLocalInertia( mass, localInertia );

    let rbInfo = new Ammo.btRigidBodyConstructionInfo( mass, motionState, colShape, localInertia );
    let body = new Ammo.btRigidBody( rbInfo );


    physicsWorld.addRigidBody( body );

    ball.userData.physicsBody = body;
    rigidBodies.push(ball);
  }

  function updatePhysics( deltaTime ){
      // Step world
      physicsWorld.stepSimulation( deltaTime, 10 );

      // Update rigid bodies
      for ( let i = 0; i < rigidBodies.length; i++ ) {
          let objThree = rigidBodies[ i ];
          let objAmmo = objThree.userData.physicsBody;
          let ms = objAmmo.getMotionState();
          if ( ms ) {

              ms.getWorldTransform( tmpTrans );
              let p = tmpTrans.getOrigin();
              let q = tmpTrans.getRotation();
              objThree.position.set( p.x(), p.y(), p.z() );
              objThree.quaternion.set( q.x(), q.y(), q.z(), q.w() );

          }
      }
  }
  start();
});

