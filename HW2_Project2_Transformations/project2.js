// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The transformation first applies scale, then rotation, and finally translation.
// The given rotation value is in degrees.
function GetTransform(positionX, positionY, rotation, scale) {
  // Convertir la rotación a radianes
  let radians = rotation * Math.PI / 180;
  
  // Matriz de escala: [scale, 0, 0, 0, scale, 0, 0, 0, 1]
  let scaleMatrix = [
    scale, 0, 0,
    0, scale, 0,
    0, 0, 1
  ];
  
  // Matriz de rotación (para vectores columna en formato column-major):
  // La fórmula de rotación es:
  // [ cosθ  -sinθ   0 ]
  // [ sinθ   cosθ   0 ]
  // [  0      0     1 ]
  // En column-major se guarda como:
  // [ cosθ, sinθ, 0, -sinθ, cosθ, 0, 0, 0, 1 ]
  let rotationMatrix = [
    Math.cos(radians), Math.sin(radians), 0,
    -Math.sin(radians), Math.cos(radians), 0,
    0, 0, 1
  ];
  
  // Matriz de traslación: queremos que la tercera columna tenga la traslación.
  // [ 1   0  positionX ]
  // [ 0   1  positionY ]
  // [ 0   0      1     ]
  // En column-major: [1,0,0, 0,1,0, positionX, positionY, 1]
  let translationMatrix = [
    1, 0, 0,
    0, 1, 0,
    positionX, positionY, 1
  ];
  
  // Queremos T * R * S.
  // Usamos ApplyTransform de forma que:
  //   ApplyTransform(A, B) devuelve B * A (es decir, primero se aplica A y luego B).
  // Entonces:
  //   tempMatrix = ApplyTransform(scaleMatrix, rotationMatrix) -> tempMatrix = rotationMatrix * scaleMatrix = R * S
  //   resultado = ApplyTransform(tempMatrix, translationMatrix) -> = translationMatrix * (R * S) = T * R * S
  let tempMatrix = ApplyTransform(scaleMatrix, rotationMatrix);
  return ApplyTransform(tempMatrix, translationMatrix);
}

// Returns a 3x3 transformation matrix as an array of 9 values in column-major order.
// The arguments are transformation matrices in the same format.
// The returned transformation first applies trans1 and then trans2.
// Es decir, el resultado debe ser: resultado = trans2 * trans1
function ApplyTransform(trans1, trans2) {
  let result = new Array(9);
  // Recordar: el elemento en la fila i, columna j se encuentra en result[i + j*3]
  // Para cada columna (j) y cada fila (i):
  for (let j = 0; j < 3; j++) {
    for (let i = 0; i < 3; i++) {
      result[i + j * 3] = 0;
      for (let k = 0; k < 3; k++) {
        // Multiplicamos según: result[i,j] = sum_k { trans2[i,k] * trans1[k,j] }
        // Recordando que trans2[i,k] está en trans2[i + k*3] y trans1[k,j] en trans1[k + j*3]
        result[i + j * 3] += trans2[i + k * 3] * trans1[k + j * 3];
      }
    }
  }
  return result;
}
