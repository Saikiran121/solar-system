import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

// Scene setup
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(window.devicePixelRatio);
document.getElementById('app').appendChild(renderer.domElement);

// Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.set(0, 30, 50);
controls.update();

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.4); // Increased intensity
scene.add(ambientLight);

const sunLight = new THREE.PointLight(0xffffff, 3, 500); // Brighter sun light
scene.add(sunLight);

const hemisphereLight = new THREE.HemisphereLight(0xffffff, 0x000000, 0.3);
scene.add(hemisphereLight);

// Starfield
function addStarField() {
    const starGeometry = new THREE.BufferGeometry();
    const starMaterial = new THREE.PointsMaterial({ color: 0xffffff });
    const starVertices = [];
    for (let i = 0; i < 10000; i++) {
        const x = (Math.random() - 0.5) * 2000;
        const y = (Math.random() - 0.5) * 2000;
        const z = (Math.random() - 0.5) * 2000;
        starVertices.push(x, y, z);
    }
    starGeometry.setAttribute('position', new THREE.Float32BufferAttribute(starVertices, 3));
    const stars = new THREE.Points(starGeometry, starMaterial);
    scene.add(stars);
}
addStarField();

// Texture Loader
const textureLoader = new THREE.TextureLoader();
const sunTexture = textureLoader.load('/textures/sun.png');

// Helper to create a sphere
function createSphere(radius, segments, color, position = [0, 0, 0], emissive = 0x000000, texture = null) {
    const geometry = new THREE.SphereGeometry(radius, segments, segments);
    const materialOptions = {
        roughness: 0.9,
        metalness: 0.1
    };

    if (texture) {
        materialOptions.map = texture;
    } else {
        materialOptions.color = color;
    }

    if (emissive !== 0x000000) {
        materialOptions.emissive = emissive;
        materialOptions.emissiveIntensity = 1;
        if (texture) materialOptions.emissiveMap = texture;
    }

    const material = new THREE.MeshStandardMaterial(materialOptions);
    const sphere = new THREE.Mesh(geometry, material);
    sphere.position.set(...position);
    return sphere;
}

// Sun
const sun = createSphere(5, 64, 0xffff00, [0, 0, 0], 0xffff00, sunTexture);
scene.add(sun);

// Planet Data (Inner planets only for v1)
const planetData = [
    {
        name: 'Mercury', radius: 0.8, distance: 10, speed: 0.04,
        texture: textureLoader.load('/textures/mercury.png')
    },
    {
        name: 'Venus', radius: 1.2, distance: 15, speed: 0.015,
        texture: textureLoader.load('/textures/venus.png')
    },
    {
        name: 'Earth', radius: 1.3, distance: 20, speed: 0.01,
        texture: textureLoader.load('/textures/earth.png')
    },
    {
        name: 'Mars', radius: 1.1, distance: 25, speed: 0.008,
        texture: textureLoader.load('/textures/mars.png')
    }
];

const planets = [];

// Create Planets and Orbits
planetData.forEach((data) => {
    // Group for orbital rotation
    const orbitGroup = new THREE.Group();
    scene.add(orbitGroup);

    // Planet
    const planet = createSphere(data.radius, 32, 0xffffff, [data.distance, 0, 0], 0x000000, data.texture);
    orbitGroup.add(planet);

    // Orbit visual (ring)
    const orbitGeometry = new THREE.RingGeometry(data.distance - 0.05, data.distance + 0.05, 128);
    const orbitMaterial = new THREE.MeshBasicMaterial({ color: 0x444444, side: THREE.DoubleSide });
    const orbitRing = new THREE.Mesh(orbitGeometry, orbitMaterial);
    orbitRing.rotation.x = Math.PI / 2;
    scene.add(orbitRing);

    planets.push({
        mesh: planet,
        group: orbitGroup,
        speed: data.speed,
        rotationSpeed: 0.01 + Math.random() * 0.02
    });
});

// Window resize handler
window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

// Animation loop
function animate() {
    requestAnimationFrame(animate);

    // Sun rotation
    sun.rotation.y += 0.004;

    // Orbit and Planet rotation
    planets.forEach(p => {
        p.group.rotation.y += p.speed;
        p.mesh.rotation.y += p.rotationSpeed;
    });

    controls.update();
    renderer.render(scene, camera);
}

animate();
