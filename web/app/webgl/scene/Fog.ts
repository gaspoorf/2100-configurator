import * as THREE from "three";

export function addWorldSpaceFog(scene: THREE.Scene, options?: {
  fogColor?: THREE.Color;
  minFogDistance?: number;
  maxFogDistance?: number;
  fogDensity?: number;
}) {
  const fogColor = options?.fogColor || new THREE.Color(0xccdcff);
  const minFogDistance = options?.minFogDistance || 20;
  const maxFogDistance = options?.maxFogDistance || 50;
  const fogDensity = options?.fogDensity || 1.0;

  const patchMaterial = (material: THREE.Material) => {
    if (!material.userData.fogPatched) {
      material.userData.fogPatched = true;
      material.userData.originalOnBeforeCompile = material.onBeforeCompile;

      material.onBeforeCompile = (shader) => {
        if (material.userData.originalOnBeforeCompile) {
          material.userData.originalOnBeforeCompile(shader);
        }

        shader.uniforms.fogColor = { value: fogColor };
        shader.uniforms.minFogDist = { value: minFogDistance };
        shader.uniforms.maxFogDist = { value: maxFogDistance };
        shader.uniforms.fogDensity = { value: fogDensity };

        shader.vertexShader = 'varying vec3 vWorldPosition;\n' + shader.vertexShader;

        shader.vertexShader = shader.vertexShader.replace(
          '#include <begin_vertex>',
          `
          #include <begin_vertex>
          vec4 worldPos = modelMatrix * vec4(transformed, 1.0);
          vWorldPosition = worldPos.xyz;
          `
        );

        shader.fragmentShader = 'varying vec3 vWorldPosition;\n' + shader.fragmentShader;
        
        shader.fragmentShader = shader.fragmentShader.replace(
          'uniform vec3 diffuse;',
          `
          uniform vec3 diffuse;
          uniform vec3 fogColor;
          uniform float minFogDist;
          uniform float maxFogDist;
          uniform float fogDensity;
          `
        );

        shader.fragmentShader = shader.fragmentShader.replace(
          '#include <dithering_fragment>',
          `
          #include <dithering_fragment>

          float dist = length(vWorldPosition.xz);
          float normalizedDist = (dist - minFogDist) / (maxFogDist - minFogDist);
          float fogFactor = clamp(normalizedDist * fogDensity, 0.0, 1.0);
          fogFactor = pow(fogFactor, 0.8);
          
          gl_FragColor.rgb = mix(gl_FragColor.rgb, fogColor, fogFactor);
          `
        );

        material.userData.shader = shader;
      };

      material.needsUpdate = true;
    }
  };

  scene.traverse((object) => {
    if (object instanceof THREE.Mesh) {
      if (Array.isArray(object.material)) {
        object.material.forEach(patchMaterial);
      } else {
        patchMaterial(object.material);
      }
    }
  });

  return {
    updateFogColor: (color: THREE.Color) => {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const materials = Array.isArray(object.material) 
            ? object.material 
            : [object.material];
          
          materials.forEach(mat => {
            if (mat.userData.shader?.uniforms.fogColor) {
              mat.userData.shader.uniforms.fogColor.value = color;
            }
          });
        }
      });
    },
    
    updateFogDistance: (min: number, max: number) => {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const materials = Array.isArray(object.material) 
            ? object.material 
            : [object.material];
          
          materials.forEach(mat => {
            if (mat.userData.shader?.uniforms) {
              mat.userData.shader.uniforms.minFogDist.value = min;
              mat.userData.shader.uniforms.maxFogDist.value = max;
            }
          });
        }
      });
    },
    
    updateFogDensity: (density: number) => {
      scene.traverse((object) => {
        if (object instanceof THREE.Mesh) {
          const materials = Array.isArray(object.material) 
            ? object.material 
            : [object.material];
          
          materials.forEach(mat => {
            if (mat.userData.shader?.uniforms.fogDensity) {
              mat.userData.shader.uniforms.fogDensity.value = density;
            }
          });
        }
      });
    }
  };
}