import * as THREE from 'https://unpkg.com/three@0.172.0/build/three.module.js';
import { OrbitControls } from './OrbitControls.js';

/**
 * PrismatiCubic - Interactive 3D Cube and Prism Visualizer
 * Main application class that manages the 3D scene, cube generation, and prism visualization
 */
class PrismatiCubic {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.controls = null;
        this.outlineCube = null;
        this.gridGroup = null;
        this.triangleMesh = null;
        
        // Prism management
        this.prisms = [];
        this.currentPrismIndex = 0;
        this.currentCubeSize = 3;
        
        // UI elements
        this.gridSizeInput = null;
        this.generateButton = null;
        this.nextButton = null;
        this.prevButton = null;
        this.prismCountList = null;
        this.totalPrismsElement = null;
        
        this.init();
    }

    /**
     * Initialize the application
     */
    init() {
        this.setupScene();
        this.setupCamera();
        this.setupRenderer();
        this.setupControls();
        this.setupCubeOutline();
        this.setupUI();
        this.setupEventListeners();
        this.startRenderLoop();
        this.handleWindowResize();
    }

    /**
     * Setup Three.js scene
     */
    setupScene() {
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0xf0f8ff); // Light blue background
    }

    /**
     * Setup camera with proper perspective
     */
    setupCamera() {
        this.camera = new THREE.PerspectiveCamera(
            75, // Field of view
            window.innerWidth / window.innerHeight, // Aspect ratio
            0.1, // Near clipping plane
            1000 // Far clipping plane
        );
        this.camera.position.set(2.5, 2.5, 2.5);
        this.camera.lookAt(0, 0, 0);
    }

    /**
     * Setup WebGL renderer
     */
    setupRenderer() {
        this.renderer = new THREE.WebGLRenderer({ 
            antialias: true,
            alpha: true 
        });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
        document.body.appendChild(this.renderer.domElement);
    }

    /**
     * Setup orbit controls for camera manipulation
     */
    setupControls() {
        this.controls = new OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true;
        this.controls.dampingFactor = 0.05;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 1;
        this.controls.maxDistance = 10;
        this.controls.maxPolarAngle = Math.PI;
    }

    /**
     * Create the cube outline wireframe
     */
    setupCubeOutline() {
        const geometry = new THREE.BoxGeometry(1, 1, 1);
        const edges = new THREE.EdgesGeometry(geometry);
        const lineMaterial = new THREE.LineBasicMaterial({ 
            color: 0xaf1e2d, // Using brand color
            linewidth: 2
        });
        this.outlineCube = new THREE.LineSegments(edges, lineMaterial);
        this.scene.add(this.outlineCube);
    }

    /**
     * Setup UI elements and references
     */
    setupUI() {
        this.gridSizeInput = document.getElementById("gridSize");
        this.generateButton = document.getElementById("generate");
        this.nextButton = document.getElementById("next");
        this.prevButton = document.getElementById("prev");
        this.prismCountList = document.getElementById("triangleCountList");
        this.totalPrismsElement = document.getElementById("totalTriangles");
        
        // Set initial values
        this.gridSizeInput.value = this.currentCubeSize;
    }

    /**
     * Setup event listeners for user interactions
     */
    setupEventListeners() {
        this.generateButton.addEventListener("click", () => this.generateCube());
        this.nextButton.addEventListener("click", () => this.showNextPrism());
        this.prevButton.addEventListener("click", () => this.showPreviousPrism());
        
        // Handle window resize
        window.addEventListener("resize", () => this.handleWindowResize());
    }

    /**
     * Generate cube with specified grid size
     */
    generateCube() {
        const gridSize = parseInt(this.gridSizeInput.value);
        
        // if (gridSize <= 0 || gridSize > 10) {
        //     this.showError("Please enter a valid grid size between 1 and 10");
        //     return;
        // }

        this.currentCubeSize = gridSize;
        this.createPrisms(gridSize);
        this.displayPrismCounts(gridSize);
        this.createGridLines(gridSize);
        this.showPrism(0); // Show first prism
    }

    /**
     * Create grid lines for the cube
     * @param {number} gridSize - Size of the grid (NxNxN)
     */
    createGridLines(gridSize) {
        // Remove previous grid
        if (this.gridGroup) {
            this.scene.remove(this.gridGroup);
        }
        
        this.gridGroup = new THREE.Group();
        const step = 1 / gridSize;
        
        // Create grid lines for each face
        for (let i = 0; i <= gridSize; i++) {
            for (let j = 0; j <= gridSize; j++) {
                const yPos = (-0.5) + i * step;
                const zPos = (-0.5) + j * step;
                
                // Only create lines for internal grid cells
                if (this.shouldCreateGridLine(i, j, gridSize)) {
                    this.createGridLine(-0.5, yPos, zPos, 0.5, yPos, zPos); // X direction
                    this.createGridLine(zPos, yPos, -0.5, zPos, yPos, 0.5); // Y direction  
                    this.createGridLine(yPos, -0.5, zPos, yPos, 0.5, zPos); // Z direction
                }
            }
        }
        
        this.scene.add(this.gridGroup);
    }

    /**
     * Determine if a grid line should be created at given position
     * @param {number} i - Row index
     * @param {number} j - Column index
     * @param {number} gridSize - Total grid size
     * @returns {boolean} Whether to create the grid line
     */
    shouldCreateGridLine(i, j, gridSize) {
        return (i !== 0 && j !== 0 && i !== gridSize && j !== gridSize) ||
               ((i === 0 || i === gridSize) && j !== 0 && j !== gridSize) ||
               ((j === 0 || j === gridSize) && i !== 0 && i !== gridSize);
    }

    /**
     * Create a single grid line
     * @param {number} startX - Start X coordinate
     * @param {number} startY - Start Y coordinate
     * @param {number} startZ - Start Z coordinate
     * @param {number} endX - End X coordinate
     * @param {number} endY - End Y coordinate
     * @param {number} endZ - End Z coordinate
     */
    createGridLine(startX, startY, startZ, endX, endY, endZ) {
        const geometry = new THREE.BufferGeometry().setFromPoints([
            new THREE.Vector3(startX, startY, startZ),
            new THREE.Vector3(endX, endY, endZ)
        ]);
        
        const material = new THREE.LineBasicMaterial({ 
            color: 0xffa382, // Using brand color
            transparent: true,
            opacity: 0.6
        });
        
        const line = new THREE.Line(geometry, material);
        this.gridGroup.add(line);
    }

    /**
     * Create prism vertices and faces for a given cell
     * @param {number} x1 - First X coordinate
     * @param {number} y1 - First Y coordinate
     * @param {number} x2 - Second X coordinate
     * @param {number} y2 - Second Y coordinate
     * @param {number} x3 - Third X coordinate
     * @param {number} y3 - Third Y coordinate
     * @param {number} z1 - First Z coordinate
     * @param {number} z2 - Second Z coordinate
     * @returns {Object} Object containing vertices and faces for the prism
     */
    createPrismVertices(x1, y1, x2, y2, x3, y3, z1, z2) {
        const p00 = new THREE.Vector3(x1, y1, z1);
        const p01 = new THREE.Vector3(x2, y2, z1);
        const p02 = new THREE.Vector3(x3, y3, z1);
        const p10 = new THREE.Vector3(x1, y1, z2);
        const p11 = new THREE.Vector3(x2, y2, z2);
        const p12 = new THREE.Vector3(x3, y3, z2);

        // Define the faces of the prism
        const faces = [
            // Bottom face (triangle)
            [p00, p01, p02],
            // Top face (triangle)
            [p10, p12, p11],
            // Side face 1 (rectangle)
            [p00, p10, p11, p01],
            // Side face 2 (rectangle)
            [p01, p11, p12, p02],
            // Side face 3 (rectangle)
            [p02, p12, p10, p00]
        ];

        return {
            vertices: [p00, p01, p02, p10, p11, p12],
            faces: faces
        };
    }

    /**
     * Create all prisms for the cube
     * @param {number} gridSize - Size of the grid
     */
    createPrisms(gridSize) {
        // Clear previous prisms
        if (this.triangleMesh) {
            this.scene.remove(this.triangleMesh);
        }
        this.prisms = [];
        this.currentPrismIndex = 0;

        const step = 1 / gridSize;
        const z1 = 0.5; // Top face of cube

        // Generate prisms for each cell
        for (let i = 1; i <= gridSize; i++) {
            const x0 = -0.5;
            const y0 = -0.5;
            const x1 = (step * i) - 0.5;
            const y1 = (step * i) - 0.5;
            const midX = (x0 + x1) / 2;
            const midY = (y0 + y1) / 2;
            const z2 = z1 - step * i;

            // Create 8 different prism configurations for each cell
            const prismConfigurations = [
                this.createPrismVertices(x0, y0, x1, y0, x0, y1, z1, z2),
                this.createPrismVertices(x0, y0, x1, y0, x1, y1, z1, z2),
                this.createPrismVertices(x0, y0, x1, y1, x0, y1, z1, z2),
                this.createPrismVertices(x1, y0, x0, y1, x1, y1, z1, z2),
                this.createPrismVertices(x0, y0, midX, midY, x1, y0, z1, z2),
                this.createPrismVertices(x0, y0, midX, midY, x0, y1, z1, z2),
                this.createPrismVertices(x1, y1, midX, midY, x0, y1, z1, z2),
                this.createPrismVertices(x1, y1, midX, midY, x1, y0, z1, z2)
            ];

            this.prisms.push(...prismConfigurations);
        }
    }

    /**
     * Display a specific prism
     * @param {number} index - Index of the prism to display
     */
    showPrism(index) {
        if (index < 0 || index >= this.prisms.length) {
            return;
        }

        // Remove previous prism
        if (this.triangleMesh) {
            this.scene.remove(this.triangleMesh);
        }

        // Create new prism geometry with colored faces
        const prismData = this.prisms[index];
        const group = new THREE.Group();
        
        // Define colors for different faces
        const colors = [
            0xaf1e2d, // Bottom face - brand red
            0xffa382, // Top face - brand orange
            0xff6b35, // Side face 1 - darker orange
            0xff8c42, // Side face 2 - medium orange
            0xffd700  // Side face 3 - gold
        ];

        // Create each face with its own color
        prismData.faces.forEach((face, faceIndex) => {
            const geometry = new THREE.BufferGeometry();
            const vertices = [];
            
            // For triangular faces (bottom and top), use all 3 vertices
            if (face.length === 3) {
                face.forEach(vertex => {
                    vertices.push(vertex.x, vertex.y, vertex.z);
                });
            }
            // For rectangular faces (sides), create two triangles to form a rectangle
            else if (face.length === 4) {
                // First triangle: vertices 0, 1, 2
                vertices.push(
                    face[0].x, face[0].y, face[0].z,
                    face[1].x, face[1].y, face[1].z,
                    face[2].x, face[2].y, face[2].z
                );
                // Second triangle: vertices 0, 2, 3
                vertices.push(
                    face[0].x, face[0].y, face[0].z,
                    face[2].x, face[2].y, face[2].z,
                    face[3].x, face[3].y, face[3].z
                );
            }
            
            geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
            
            // Create material with face color
            const material = new THREE.MeshBasicMaterial({
                color: colors[faceIndex],
                transparent: true,
                opacity: 0.8,
                side: THREE.DoubleSide
            });
            
            // Create mesh for this face
            const faceMesh = new THREE.Mesh(geometry, material);
            group.add(faceMesh);
        });

        this.triangleMesh = group;
        this.scene.add(this.triangleMesh);
        this.currentPrismIndex = index;
    }

    /**
     * Show the next prism in sequence
     */
    showNextPrism() {
        if (this.prisms.length > 0) {
            const nextIndex = (this.currentPrismIndex + 1) % this.prisms.length;
            this.showPrism(nextIndex);
        }
    }

    /**
     * Show the previous prism in sequence
     */
    showPreviousPrism() {
        if (this.prisms.length > 0) {
            const prevIndex = (this.currentPrismIndex - 1 + this.prisms.length) % this.prisms.length;
            this.showPrism(prevIndex);
        }
    }

    /**
     * Display prism counts for each size
     * @param {number} gridSize - Size of the grid
     */
    displayPrismCounts(gridSize) {
        this.prismCountList.innerHTML = "";
        let totalPrisms = 0;

        for (let size = 1; size <= gridSize; size++) {
            const count = this.calculatePrismCount(gridSize - size + 1);
            totalPrisms += count;

            const listItem = document.createElement("li");
            listItem.textContent = `Size ${size}x${size}x${size}: ${count} Prisms`;
            listItem.dataset.size = size;
            
            // Add click event to show prisms of this size
            listItem.addEventListener("click", () => {
                this.showPrismsOfSize(size);
            });

            this.prismCountList.appendChild(listItem);
        }

        this.totalPrismsElement.textContent = `Total Prisms: ${totalPrisms}`;
    }

    /**
     * Show prisms of a specific size
     * @param {number} size - Size of prisms to show
     */
    showPrismsOfSize(size) {
        const startIndex = 8 * (size - 1);
        this.showPrism(startIndex);
    }

    /**
     * Calculate the number of prisms for a given size
     * @param {number} size - Size of the cube
     * @returns {number} Number of prisms
     */
    calculatePrismCount(size) {
        return size * size * size * 8; // 8 prisms per cell
    }

    /**
     * Handle window resize events
     */
    handleWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    /**
     * Show error message to user
     * @param {string} message - Error message to display
     */
    showError(message) {
        console.error(message);
        // You could implement a proper error display UI here
        alert(message);
    }

    /**
     * Start the render loop
     */
    startRenderLoop() {
        const animate = () => {
            requestAnimationFrame(animate);
            this.controls.update();
            this.renderer.render(this.scene, this.camera);
        };
        animate();
    }
}

// Initialize the application when the DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new PrismatiCubic();
});
