// Import necessary Three.js modules
import * as THREE from "three";
import Stats from "stats.js";

var stats = new Stats();
stats.showPanel(1); // 0: fps, 1: ms, 2: mb, 3+: custom
document.body.appendChild(stats.dom);

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

// Static Control Points

const controlPoints = [
	new THREE.Vector3(-700, 0, 0),
	new THREE.Vector3(-650, 0, 0),
	new THREE.Vector3(-570, 0, 0),
	new THREE.Vector3(-450, 0, 0),
	new THREE.Vector3(-430, 0, 0),
	new THREE.Vector3(-270, 0, 0),
	new THREE.Vector3(-100, 0, 0),
	new THREE.Vector3(-10, 0, 0),
	new THREE.Vector3(40, 0, 0),
	new THREE.Vector3(50, 0, 0),
	new THREE.Vector3(65, 0, 0),
	new THREE.Vector3(700, 0, 0),
];

// Number of points
const numPoints = 12;

// Dynamic Control Points

// Array to store control points
// const controlPoints = [];
// const bezierCurveArrayIndex = [];
const maxDistance = 200;
// // Generate control points with random distances and heights
// for (let i = 0; i < numPoints; i++) {
// 	const distance = i > 0 ? Math.random() * 50 : 0; // Random distance, but 0 for the first point
// 	const height =
// 		Math.sin((i / (numPoints - 1)) * Math.PI) * 50 * (1 + distance / 50); // Adjust height based on position and distance
// 	if (i == 5 || i == 8) {
// 		bezierCurveArrayIndex.push(5);
// 		controlPoints.push(
// 			new THREE.Vector3((i - (numPoints - 1) / 2) * 500 + distance, height, 0),
// 		);
// 	} else
// 		controlPoints.push(
// 			new THREE.Vector3((i - (numPoints - 1) / 2) * 150 + distance, height, 0),
// 		);
// }
// console.log(controlPoints);
// // Set y-coordinate to 0 for all points to form a horizontal line
// controlPoints.forEach((point) => (point.y = 0));

// Array to store curves
const curves = [];

function calculateDistanceAndMidpoint(point1, point2) {
	// Extract coordinates of each point
	const { x: x1, y: y1, z: z1 } = point1;
	const { x: x2, y: y2, z: z2 } = point2;

	// Calculate distance
	const distance = Math.sqrt(
		Math.pow(x2 - x1, 2) + Math.pow(y2 - y1, 2) + Math.pow(z2 - z1, 2),
	);

	// Calculate midpoint
	const midpoint = {
		x: (x1 + x2) / 2,
		y: (y1 + y2) / 2,
		z: (z1 + z2) / 2,
	};

	return { distance, midpoint };
}

const centerPoints = [];

// Generate curves
for (let i = 0; i < numPoints - 1; i++) {
	const { distance, midpoint } = calculateDistanceAndMidpoint(
		controlPoints[i],
		controlPoints[i + 1],
	);
	centerPoints.push({ distance: distance, midpoint: midpoint });
}

for (let i = 0; i < centerPoints.length; i++) {
	let curve;
	if (centerPoints[i].distance < maxDistance) {
		curve = new THREE.EllipseCurve(
			centerPoints[i].midpoint.x,
			centerPoints[i].midpoint.y,
			centerPoints[i].distance / 2,
			centerPoints[i].distance / 2,
			0,
			Math.PI,
			false,
			0,
		);
		curves.push(curve);
	} else {
		console.log(
			"Bezier Curve Needed at : ",
			i,
			"index as distance between points is : ",
			centerPoints[i].distance,
		);

		curve = new THREE.CubicBezierCurve(
			controlPoints[i],
			new THREE.Vector3(controlPoints[i].x, maxDistance, controlPoints[i].z),
			new THREE.Vector3(
				controlPoints[i + 1].x,
				maxDistance,
				controlPoints[i + 1].z,
			),
			controlPoints[i + 1],
		);
		curves.push(curve);
	}
}

// Array to store points along the curves
const allPoints = [];

// Generate points along the curves
curves.forEach((curve) => {
	const points = curve.getPoints(50);
	allPoints.push(...points);
});

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
scene.add(straightLine);

scene.add(curveLine);

// Render loop
function animate() {
	stats.begin();
	renderer.render(scene, camera);
	stats.end();
	requestAnimationFrame(animate);
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
