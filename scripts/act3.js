//Act 3: Of the Fog
//By Chelsea Thompto

import * as THREE from '../build/three.module.js';

// Import add-ons
import { DragControls } from '../src/DragControls.js';
import { AsciiEffect } from '../src/AsciiEffect.js';

let container, effect;
let camera, scene, renderer;
let controls, group;
let enableSelection = false;

const objects = [];

const mouse = new THREE.Vector2(), raycaster = new THREE.Raycaster();

init();

function init() {

    container = document.createElement( 'div' );
    document.body.appendChild( container );

    camera = new THREE.PerspectiveCamera( 70, window.innerWidth / window.innerHeight, 0.1, 500 );
    camera.position.z = 25;

    scene = new THREE.Scene();
    scene.background = new THREE.Color( 0xf0f0f0 );

    scene.add( new THREE.AmbientLight( 0xaaaaaa, 3 ) );

    const light = new THREE.SpotLight( 0xffffff );
    light.position.set( 0, 25, 50 );
    light.angle = Math.PI / 9;

    light.castShadow = true;
    light.shadow.camera.near = 10;
    light.shadow.camera.far = 100;
    light.shadow.mapSize.width = window.innerWidth;
    light.shadow.mapSize.height = window.innerHeight;

    scene.add( light );

    group = new THREE.Group();
    scene.add( group );

    const geometry = new THREE.SphereGeometry();

    for ( let i = 0; i < 200; i ++ ) {

        const object = new THREE.Mesh( geometry, new THREE.MeshLambertMaterial( { color: Math.random() * 0xffffff } ) );

        object.position.x = Math.random() * 30 - 15;
        object.position.y = Math.random() * 15 - 7.5;
        object.position.z = Math.random() * 20 - 10;

        object.rotation.x = Math.random() * 2 * Math.PI;
        object.rotation.y = Math.random() * 2 * Math.PI;
        object.rotation.z = Math.random() * 2 * Math.PI;

        object.scale.x = Math.random() * 2 + 1;
        object.scale.y = Math.random() * 2 + 1;
        object.scale.z = Math.random() * 2 + 1;

        object.castShadow = true;
        object.receiveShadow = true;

        scene.add( object );

        objects.push( object );

    }

    renderer = new THREE.WebGLRenderer( { antialias: true } );
    //renderer.setPixelRatio( window.devicePixelRatio );
    //renderer.setSize( window.innerWidth, window.innerHeight );
    renderer.useLegacyLights = false;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;

    //ascii effects
    effect = new AsciiEffect(renderer, ' .,:;|-~=#', {
        scale: .92,
        resolution: 0.3,
        invert: false
    });
    effect.setSize(window.innerWidth * 0.9, window.innerHeight * 1.075);
    effect.domElement.style.color = 'white';
    effect.domElement.style.backgroundColor = 'black';
    effect.domElement.style.overflow = "hidden";

    container.appendChild(effect.domElement);
    //container.appendChild( renderer.domElement );

    // Identify the html divs for the overlays
    const blocker = document.getElementById("blocker");
    const instructions = document.getElementById("instructions");

    // Listen for clicks and respond by removing overlays and starting mouse look controls
    // Listen
    instructions.addEventListener("click", function() {
        instructions.style.display = "none";
        blocker.style.display = "none";
    });

    controls = new DragControls( [ ... objects ], camera, effect.domElement );
    controls.addEventListener( 'drag', render );

    //

    window.addEventListener( 'resize', onWindowResize );

    document.addEventListener( 'click', onClick );
    window.addEventListener( 'keydown', onKeyDown );
    window.addEventListener( 'keyup', onKeyUp );
    
    render();

}

function onWindowResize() {

    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    effect.setSize(window.innerWidth * 0.9, window.innerHeight * 1.075);
    //renderer.setSize( window.innerWidth, window.innerHeight );

    render();

}

function onKeyDown( event ) {

    enableSelection = ( event.keyCode === 16 ) ? true : false;

}

function onKeyUp( event ) {

    if (event.keyCode === 27 ) {
        instructions.style.display = "";
        blocker.style.display = "";
    };
    //enableSelection = false;

}

function onClick( event ) {

    event.preventDefault();

    if ( enableSelection === true ) {

        const draggableObjects = controls.getObjects();
        draggableObjects.length = 0;

        mouse.x = ( event.clientX / window.innerWidth ) * 2 - 1;
        mouse.y = - ( event.clientY / window.innerHeight ) * 2 + 1;

        raycaster.setFromCamera( mouse, camera );

        const intersections = raycaster.intersectObjects( objects, true );

        if ( intersections.length > 0 ) {

            const object = intersections[ 0 ].object;

            if ( group.children.includes( object ) === true ) {

                object.material.emissive.set( 0x000000 );
                scene.attach( object );

            } else {

                object.material.emissive.set( 0xaaaaaa );
                group.attach( object );

            }

            controls.transformGroup = true;
            draggableObjects.push( group );

        }

        if ( group.children.length === 0 ) {

            controls.transformGroup = false;
            draggableObjects.push( ...objects );

        }

    }

    render();

}

function render() {

    effect.render(scene, camera);
    //renderer.render( scene, camera );

}