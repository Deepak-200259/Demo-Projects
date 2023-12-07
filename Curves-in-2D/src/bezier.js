// Import necessary Three.js modules
import * as THREE from "three";

// Create scene and camera
const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(
	window.innerWidth / -2,
	window.innerWidth / 2,
	window.innerHeight / 2,
	window.innerHeight / -2,
	0.1,
	1000,
);
camera.position.z = 5;

// Create renderer
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

// Number of points
const numPoints = 12;

// Array to store control points
const controlPoints = [];

// Generate control points with random distances and heights
for (let i = 0; i < numPoints; i++) {
	const distance = i > 0 ? Math.random() * 50 : 0; // Random distance, but 0 for the first point
	const height =
		Math.sin((i / (numPoints - 1)) * Math.PI) * 50 * (1 + distance / 50); // Adjust height based on position and distance
	controlPoints.push(
		new THREE.Vector3((i - (numPoints - 1) / 2) * 100 + distance, height, 0),
	);
}
console.log(controlPoints);
// Set y-coordinate to 0 for all points to form a horizontal line
controlPoints.forEach((point) => (point.y = 0));

// Array to store curves
const curves = [];

// Generate curves
for (let i = 0; i < numPoints - 1; i++) {
	const curve = new THREE.CubicBezierCurve(
		controlPoints[i],
		new THREE.Vector3(controlPoints[i].x, 100, controlPoints[i].z),
		new THREE.Vector3(controlPoints[i + 1].x, 100, controlPoints[i + 1].z),
		controlPoints[i + 1],
	);
	curves.push(curve);
}

// Array to store points along the curves
const allPoints = [];

// Generate points along the curves
curves.forEach((curve) => {
	const points = curve.getPoints(50);
	allPoints.push(...points);
});

console.log(allPoints);

// Create geometry and add points to the geometry

const beziarGeometry = new THREE.BufferGeometry().setFromPoints(allPoints);
const underlineGeometry = new THREE.BufferGeometry().setFromPoints([
	controlPoints[0],
	controlPoints[controlPoints.length - 1],
]);

const pointsGeometry = new THREE.CircleGeometry(5);
const pointsMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff });
const points = [];

for (let i = 0; i < controlPoints.length; i++) {
	const point = new THREE.Mesh(pointsGeometry, pointsMaterial);
	point.position.set(
		controlPoints[i].x,
		controlPoints[i].y,
		controlPoints[i].z,
	);
	points.push(point);
}

scene.add(...points);

// Create material for the line
const lineMaterial = new THREE.LineBasicMaterial({});

// Create the line and add it to the scene
const curveLine = new THREE.Line(beziarGeometry, lineMaterial.clone());
curveLine.material.color = new THREE.Color(0x00ff00);
const straightLine = new THREE.Line(underlineGeometry, lineMaterial.clone());
straightLine.material.color = new THREE.Color(0xff0000);
scene.add(curveLine, straightLine);

// Render loop
function animate() {
	stats.begin();
	stats.end();
	requestAnimationFrame(animate);
	renderer.render(scene, camera);
}

const resize = () => {
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();

	// update renderer
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
	renderer.render(scene, camera);
};

window.addEventListener("resize", () => {
	resize();
});

// Run the animation loop
animate();
