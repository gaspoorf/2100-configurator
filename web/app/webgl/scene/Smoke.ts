import * as THREE from "three";

export function createPollutionCloud(options = { count: 150, radius: 30, height: 10, color: "#888888", opacity: 0, size: 15 }) {

    const canvas = document.createElement('canvas');
    canvas.width = 32;
    canvas.height = 32;
    const ctx = canvas.getContext('2d');
    
    if (ctx) {
        const grad = ctx.createRadialGradient(16, 16, 0, 16, 16, 16);
        grad.addColorStop(0, 'rgba(255, 255, 255, 1)'); 
        grad.addColorStop(0.4, 'rgba(255, 255, 255, 0.2)');
        grad.addColorStop(1, 'rgba(255, 255, 255, 0)');
        
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, 32, 32);

    }
    const texture = new THREE.CanvasTexture(canvas);

    const geometry = new THREE.BufferGeometry();
    const positions = [];

    for (let i = 0; i < options.count; i++) {

        const r = Math.random() * options.radius;
        const theta = Math.random() * Math.PI * 2;
        
        const x = r * Math.cos(theta);
        const z = r * Math.sin(theta);
        
        const y = (Math.random() * options.height) + 2; 

        positions.push(x, y, z);

    }

    geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));

    const material = new THREE.PointsMaterial({
        color: options.color,
        map: texture,
        size: options.size,
        transparent: true,
        opacity: options.opacity,
        depthWrite: false, 
        depthTest: true, 
        blending: THREE.NormalBlending, 
        sizeAttenuation: true
    });

    const points = new THREE.Points(geometry, material);
    points.name = "PollutionCloud";
    

    points.position.set(0, 0, 0); 
    points.renderOrder = 1; 

    return points;
}