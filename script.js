import * as THREE from 'https://unpkg.com/three@0.172.0/build/three.module.js';
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

// Function to create grids for the NxNxN cube
function createGrids(n) {
    // Clear previous grids
    if (gridGroup) {
        scene.remove(gridGroup);
    }
    gridGroup = new THREE.Group();

    const size = 1; // Cube size
    const step = size / n; // Size of each grid cell

    // Add grid lines for each axis
    for (let i = 0; i <= n; i++) {
        const position = -size / 2 + i * step;

        // Horizontal grid lines (X-Y plane)
        const horizontalGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(-size / 2, position, size / 2),
            new THREE.Vector3(size / 2, position, size / 2),
        ]);
        const horizontalLine = new THREE.Line(horizontalGeometry, new THREE.LineBasicMaterial({ color: 0x5555ff }));
        gridGroup.add(horizontalLine);

        const verticalGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(position, -size / 2, size / 2),
            new THREE.Vector3(position, size / 2, size / 2),
        ]);
        const verticalLine = new THREE.Line(verticalGeometry, new THREE.LineBasicMaterial({ color: 0x5555ff }));
        gridGroup.add(verticalLine);

        // Depth grid lines (Z axis)
        const depthGeometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(position, position, -size / 2),
            new THREE.Vector3(position, position, size / 2),
        ]);
        const depthLine = new THREE.Line(depthGeometry, new THREE.LineBasicMaterial({ color: 0x5555ff }));
        gridGroup.add(depthLine);
    }

    // Add the grid group to the scene
    scene.add(gridGroup);
}

// Function to Create and Add Triangles
function createTriangles(n) {
    // Clear previous triangles
    if (triangleMesh) scene.remove(triangleMesh);
    triangles = [];

    const size = 1; // Cube size
    const step = size / n;
    const zPosition = 0.5; // Place triangles in the middle of the cube
    const x = 0, y = 0;
    // for (let i = n; i > 0; i--){
    for (let i = 1; i <= n; i++){
        // const step = size / i; // Size of each grid cell

        // Generate Right-Angled Triangles for the Middle Plane (z = 0)
        // for (let x = 0; x < 1; x++) {
            // for (let y = 0; y < 1; y++) {
                // const x0 = x * step - size / 2;
                // const y0 = y * step - size / 2;
                // const x1 = (x + 1) * step - size / 2;
                // const y1 = (y + 1) * step - size / 2;
                const x0 = x * step * i - size / 2;
                const y0 = y * step * i - size / 2;
                const x1 = (x + 1) * step * i - size / 2;
                const y1 = (y + 1) * step * i - size / 2;
                const midX = (x0 + x1) / 2;
                const midY = (y0 + y1) / 2;
    
                // Define the 8 triangles for this cell
                triangles.push([new THREE.Vector3(x0, y0, zPosition), new THREE.Vector3(x1, y0, zPosition), new THREE.Vector3(x0, y1, zPosition), new THREE.Vector3(x0, y0, zPosition)]);
                triangles.push([new THREE.Vector3(x0, y0, zPosition), new THREE.Vector3(x1, y0, zPosition), new THREE.Vector3(x1, y1, zPosition), new THREE.Vector3(x0, y0, zPosition)]);
                triangles.push([new THREE.Vector3(x0, y0, zPosition), new THREE.Vector3(x1, y1, zPosition), new THREE.Vector3(x0, y1, zPosition), new THREE.Vector3(x0, y0, zPosition)]);
                triangles.push([new THREE.Vector3(x1, y0, zPosition), new THREE.Vector3(x0, y1, zPosition), new THREE.Vector3(x1, y1, zPosition), new THREE.Vector3(x1, y0, zPosition)]);
                triangles.push([new THREE.Vector3(x0, y0, zPosition), new THREE.Vector3(midX, midY, zPosition), new THREE.Vector3(x1, y0, zPosition), new THREE.Vector3(x0, y0, zPosition)]);
                triangles.push([new THREE.Vector3(x0, y0, zPosition), new THREE.Vector3(midX, midY, zPosition), new THREE.Vector3(x0, y1, zPosition), new THREE.Vector3(x0, y0, zPosition)]);
                triangles.push([new THREE.Vector3(x1, y1, zPosition), new THREE.Vector3(midX, midY, zPosition), new THREE.Vector3(x0, y1, zPosition), new THREE.Vector3(x1, y1, zPosition)]);
                triangles.push([new THREE.Vector3(x1, y1, zPosition), new THREE.Vector3(midX, midY, zPosition), new THREE.Vector3(x1, y0, zPosition), new THREE.Vector3(x1, y1, zPosition)]);
            // }
        // }
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
        listItem.textContent = `${size}x${size} Triangles: ${count}`;
        listItem.dataset.size = size; // Store the triangle size
        listItem.addEventListener("click", () => {
            displayTrianglesOfSize(size); // Display triangles of this size
        });

        triangleCountList.appendChild(listItem);
    }

    totalTrianglesElement.textContent = `Total Triangles: ${totalTriangles}`;
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
