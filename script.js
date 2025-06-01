import * as THREE from './node_modules/three/build/three.module.js';
import { OrbitControls } from './vendor_mods/three/examples/jsm/controls/OrbitControls.js';

// Scene, Camera, Renderer
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
const renderer = new THREE.WebGLRenderer();
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Add Orbit Controls
const controls = new OrbitControls(camera, renderer.domElement);
camera.position.z = 2.5;
controls.update();

// Cube Outline
const geometry = new THREE.BoxGeometry();
const edges = new THREE.EdgesGeometry(geometry);
const lineMaterial = new THREE.LineBasicMaterial({ color: 0x00ff00 });
const outlineCube = new THREE.LineSegments(edges, lineMaterial);
let gridGroup = new THREE.Group(); // Add a group to store grid lines
scene.add(outlineCube); // Add cube to scene

// Variables for Triangle Navigation
let triangles = []; // Array to store all triangles
let currentTriangleIndex = 0; // Index of the currently displayed triangle
let triangleMesh = null; // Mesh for the current triangle

function createLine(sx, sy, sz, ex, ey, ez) {
    const LineGeometry = new THREE.BufferGeometry().setFromPoints([
        new THREE.Vector3(sx,sy,sz),
        new THREE.Vector3(ex,ey,ez),
    ]);
    const Lines = new THREE.Line(LineGeometry, new THREE.LineBasicMaterial({ color: 0x5555ff }));
    gridGroup.add(Lines);
}

// Function to create grids for the NxNxN cube
function createGrids(n) {
    // Clear previous grids
    if (gridGroup) {
        scene.remove(gridGroup);
    }
    gridGroup = new THREE.Group();

    const step = 1 / n; // Size of each grid cell
    for (let i = 0; i <= n; i++) {
        for (let j = 0; j <= n; j++){
            const ypos = (-1/2) + i * step;
            const zpos = (-1/2) + j * step;
            if ((i != 0 && j != 0 && i != n && j != n) ||
            ((i == 0 || i == n) && j != 0 && j != n) || 
            ((j == 0 || j == n) && i != 0 && i != n)
            ){
                createLine(-1/2, ypos, zpos, 1/2, ypos, zpos);
                createLine(zpos, ypos, -1/2, zpos, ypos, 1/2);
                createLine(ypos, -1/2, zpos, ypos, 1/2, zpos);
            }
        }
    }
    // Add the grid group to the scene
    scene.add(gridGroup);
}

function setTriangle(x1, y1, x2, y2, x3, y3, z1, z2){
    const p00 = new THREE.Vector3(x1, y1, z1);
    const p01 = new THREE.Vector3(x2, y2, z1);
    const p02 = new THREE.Vector3(x3, y3, z1);

    const p10 = new THREE.Vector3(x1, y1, z2);
    const p11 = new THREE.Vector3(x2, y2, z2);
    const p12 = new THREE.Vector3(x3, y3, z2);

    return [
        p00, p10, p00,
        p01, p11, p01,
        p02, p12, p02, p00,
        p10, p11, p12, p10
    ]
}

// Function to Create and Add Triangles
function createTriangles(n) {
    // Clear previous triangles
    if (triangleMesh) scene.remove(triangleMesh);
    triangles = [];

    const step = 1 / n;
    const z1 = 1 / 2; // Place triangles in the middle of the cube
    const x = 0, y = 0;
    // for (let i = n; i > 0; i--){
    for (let i = 1; i <= n; i++){
        const x0 = x * step * i - 1 / 2;
        const y0 = y * step * i - 1 / 2;
        const x1 = (x + 1) * step * i - 1 / 2;
        const y1 = (y + 1) * step * i - 1 / 2;
        const midX = (x0 + x1) / 2;
        const midY = (y0 + y1) / 2;
        const z2 = z1 - step * i;
        
        // Define the triangle points for this cell
        triangles.push(setTriangle(x0, y0, x1, y0, x0, y1, z1, z2));
        triangles.push(setTriangle(x0, y0, x1, y0, x1, y1, z1, z2));
        triangles.push(setTriangle(x0, y0, x1, y1, x0, y1, z1, z2));
        triangles.push(setTriangle(x1, y0, x0, y1, x1, y1, z1, z2));
        triangles.push(setTriangle(x0, y0, midX, midY, x1, y0, z1, z2));
        triangles.push(setTriangle(x0, y0, midX, midY, x0, y1, z1, z2));
        triangles.push(setTriangle(x1, y1, midX, midY, x0, y1, z1, z2));
        triangles.push(setTriangle(x1, y1, midX, midY, x1, y0, z1, z2));
    }

    displayTriangle(0); // Display the first triangle
}

// Function to Display a Single Triangle
function displayTriangle(index) {
    if (triangleMesh) scene.remove(triangleMesh); // Remove the previous triangle
    if (index < triangles.length) {
        const triangleGeometry = new THREE.BufferGeometry().setFromPoints(triangles[index]);
        triangleMesh = new THREE.Line(triangleGeometry, new THREE.LineBasicMaterial({ color: 0xff0000 }));
        scene.add(triangleMesh);
        // createGrids((triangles.length / 8) - Math.floor(index / 8));
    }
}
// Function to Display Triangle Counts
// Function to Display Triangle Counts
function displayTriangleCounts(n) {
    const triangleCountList = document.getElementById("triangleCountList");
    const totalTrianglesElement = document.getElementById("totalTriangles");
    triangleCountList.innerHTML = ""; // Clear previous counts
    let totalTriangles = 0;

    for (let size = 1; size <= n; size++) {
        const count = calculateTriangleCount(n - size + 1); // Replace with your formula
        totalTriangles += count;

        const listItem = document.createElement("li");
        listItem.textContent = `ขนาด ${size}x${size}x${size}: ${count} รูป`;
        listItem.dataset.size = size; // Store the triangle size
        listItem.addEventListener("click", () => {
            displayTrianglesOfSize(size); // Display triangles of this size
        });

        triangleCountList.appendChild(listItem);
    }

    totalTrianglesElement.textContent = `จำนวนปริซึมสามเหลี่ยมหน้าจั่วทั้งหมด ${totalTriangles} รูป`;
}

// Function to Display Triangles of Selected Size
function displayTrianglesOfSize(size) {
    displayTriangle(8 * (size - 1))
    currentTriangleIndex = 8 * (size - 1);
}

// Placeholder for your formula to calculate triangle counts
function calculateTriangleCount(size) {
    return size * size * size * 8; // Example for demonstration
}
// Button Event Listener for Generating Cube and Updating Counts
document.getElementById("generate").addEventListener("click", () => {
    const n = parseInt(document.getElementById("gridSize").value);
    if (n > 0) {
        createTriangles(n);
        displayTriangleCounts(n);
        createGrids(n);
    }
});

document.getElementById("prev").addEventListener("click", () => {
    if (triangles.length > 0) {
        currentTriangleIndex = (currentTriangleIndex - 1 + triangles.length) % triangles.length;
        displayTriangle(currentTriangleIndex);
    }
});

document.getElementById("next").addEventListener("click", () => {
    if (triangles.length > 0) {
        currentTriangleIndex = (currentTriangleIndex + 1) % triangles.length;
        displayTriangle(currentTriangleIndex);
    }
});

// Render Loop
function animate() {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(animate);
}

animate();

// Handle Window Resize
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});
