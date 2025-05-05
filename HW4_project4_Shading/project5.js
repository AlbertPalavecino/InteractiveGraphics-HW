// This function takes the translation and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// You can use the MatrixMult function defined in project5.html to multiply two 4x4 matrices in the same format.
function GetModelViewMatrix( translationX, translationY, translationZ, rotationX, rotationY )
{
	// [TO-DO] Modify the code below to form the transformation matrix.
	// 1.create the rotation matrix around the Y axis (horizontal rotation)
	var rotationYMatrix = [
		Math.cos(rotationY), 0, -Math.sin(rotationY), 0,
		0, 1, 0, 0,
		Math.sin(rotationY), 0, Math.cos(rotationY), 0,
		0, 0, 0, 1
	];

	//2. create the rotation matrix around the X axis (vertical rotation)
	// invert the sign to make the up movement rotate up and down movement rotate down
	var rotationXMatrix = [
			1, 0, 0, 0,
			0, Math.cos(rotationX), Math.sin(rotationX), 0,
			0, -Math.sin(rotationX), Math.cos(rotationX), 0,
			0, 0, 0, 1
	];

	// 3. create the translation matrix
	var trans = [
			1, 0, 0, 0,
			0, 1, 0, 0,
			0, 0, 1, 0,
			translationX, translationY, translationZ, 1
	];
	// 4. combine the translation and rotation matrices
	const rotationMatrix = MatrixMult(rotationYMatrix, rotationXMatrix);
	const mv = MatrixMult(trans, rotationMatrix);
	return mv;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
	constructor()
	{
		// [TO-DO] initializations
		this.prog = InitShaderProgram(meshVS, meshFS);
		this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
		this.posLoc = gl.getAttribLocation(this.prog, 'pos');
		this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');

		this.normalLoc  = gl.getAttribLocation(this.prog, 'normal');
		this.mvLoc       = gl.getUniformLocation(this.prog, 'uMV');
		this.normalMatLoc= gl.getUniformLocation(this.prog, 'uNormalMatrix');
		this.lightDirLoc = gl.getUniformLocation(this.prog, 'uLightDir');
		this.shininessLoc= gl.getUniformLocation(this.prog, 'uShininess');
		
		this.showTexLoc  = gl.getUniformLocation(this.prog, 'uShowTex');
		this.samplerLoc  = gl.getUniformLocation(this.prog, 'uTex');

		this.positionBuffer = gl.createBuffer();
		this.texCoordBuffer = gl.createBuffer();

		this.normalBuffer   = gl.createBuffer();

		this.numTriangles = 0;

		this.swap = false;
		this.swapMatrix = [
			1, 0, 0, 0,
			0, 0, 1, 0,
			0, 1, 0, 0,
			0, 0, 0, 1
		];

		// create the empty texture
		this.texture = gl.createTexture();
		// for default we show the texture
		this.showTextureOn = true;
		this.hasTexture = false;
	
	}
	
	// This method is called every time the user opens an OBJ file.
	// The arguments of this function is an array of 3D vertex positions,
	// an array of 2D texture coordinates, and an array of vertex normals.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex and every three consecutive 
	// elements in the normals array form a vertex normal.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords, normals )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;
		// vinculate and fill the buffer of vertex positions
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// vinculate and fill the buffer of texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
		
		// vinculate and fill the buffer of normals
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(normals), gl.STATIC_DRAW);
	
	}
	
	// This method is called when the user changes the state of the
	// "Swap Y-Z Axes" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	swapYZ( swap )
	{
		// [TO-DO] Set the uniform parameter(s) of the vertex shader
		this.swap = swap;
	}
	
	// This method is called to draw the triangular mesh.
	// The arguments are the model-view-projection transformation matrixMVP,
	// the model-view transformation matrixMV, the same matrix returned
	// by the GetModelViewProjection function above, and the normal
	// transformation matrix, which is the inverse-transpose of matrixMV.
	draw( matrixMVP, matrixMV, matrixNormal )
	{
		// [TO-DO] Complete the WebGL initializations before drawing
		// apply swap matrix if needed
		let mvp = matrixMVP, mv = matrixMV;
		if ( this.swap ) {
			mvp = MatrixMult(matrixMVP, this.swapMatrix);
			mv  = MatrixMult(matrixMV,  this.swapMatrix);
		}
	
		gl.useProgram(this.prog);

		// uniforms of matrices
		gl.uniformMatrix4fv(this.mvpLoc,       false, mvp);
		gl.uniformMatrix4fv(this.mvLoc,        false, mv);
		gl.uniformMatrix3fv(this.normalMatLoc, false, matrixNormal);

		// uniforms of texture
		gl.uniform1i(this.showTexLoc, (this.showTextureOn && this.hasTexture) ? 1 : 0);
    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.uniform1i(this.samplerLoc, 0);

		// position
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.enableVertexAttribArray(this.posLoc);
		gl.vertexAttribPointer(this.posLoc, 3, gl.FLOAT, false, 0, 0);
		// texCoord
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.enableVertexAttribArray(this.texCoordLoc);
		gl.vertexAttribPointer(this.texCoordLoc, 2, gl.FLOAT, false, 0, 0);
		// normals
		gl.bindBuffer(gl.ARRAY_BUFFER, this.normalBuffer);
		gl.enableVertexAttribArray(this.normalLoc);
		gl.vertexAttribPointer(this.normalLoc, 3, gl.FLOAT, false, 0, 0);

		gl.drawArrays( gl.TRIANGLES, 0, this.numTriangles );
	}
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
		// [TO-DO] Bind the texture
		gl.bindTexture(gl.TEXTURE_2D, this.texture);

		// You can set the texture image data using the following command.
		gl.texImage2D( gl.TEXTURE_2D, 0, gl.RGB, gl.RGB, gl.UNSIGNED_BYTE, img );

		// [TO-DO] Now that we have a texture, it might be a good idea to set
		// some uniform parameter(s) of the fragment shader, so that it uses the texture.
		gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR_MIPMAP_LINEAR);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
    gl.generateMipmap(gl.TEXTURE_2D);
		this.hasTexture = true;
	}
	
	// This method is called when the user changes the state of the
	// "Show Texture" checkbox. 
	// The argument is a boolean that indicates if the checkbox is checked.
	showTexture( show )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify if it should use the texture.
		this.showTextureOn = show;
	}
	
	// This method is called to set the incoming light direction
	setLightDir( x, y, z )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the light direction.
		gl.useProgram(this.prog);
		gl.uniform3fv(this.lightDirLoc, new Float32Array([ x, y, z ]));
	}
	
	// This method is called to set the shininess of the material
	setShininess( shininess )
	{
		// [TO-DO] set the uniform parameter(s) of the fragment shader to specify the shininess.
		gl.useProgram(this.prog);
		gl.uniform1f(this.shininessLoc, shininess);
	}
}


// === Reemplaza completamente estas dos definiciones en project5.js ===

// Vertex shader para el mesh
var meshVS = `
  attribute vec3 pos;
  attribute vec2 texCoord;
  attribute vec3 normal;

  // coincide con this.mvpLoc = getUniformLocation('mvp')
  uniform mat4 mvp;
  // coincide con this.mvLoc = getUniformLocation('uMV')
  uniform mat4 uMV;
  // coincide con this.normalMatLoc = getUniformLocation('uNormalMatrix')
  uniform mat3 uNormalMatrix;

  varying vec2 vTex;
  varying vec3 vNormalCam;
  varying vec3 vPositionCam;

  void main() {
    // posición en clip‐space
    gl_Position   = mvp * vec4(pos, 1.0);

    // posición en espacio cámara (para el vector V)
    vec4 posCam   = uMV * vec4(pos, 1.0);
    vPositionCam  = posCam.xyz;

    // normal transformada a espacio cámara
    vNormalCam    = normalize(uNormalMatrix * normal);

    // coord de textura
    vTex          = texCoord;
  }
`;

// Fragment shader Blinn-Phong
var meshFS = `
  precision mediump float;

  varying vec2 vTex;
  varying vec3 vNormalCam;
  varying vec3 vPositionCam;

  // coincide con this.showTexLoc = getUniformLocation('uShowTex')
  uniform bool       uShowTex;
  // coincide con this.samplerLoc = getUniformLocation('uTex')
  uniform sampler2D  uTex;
  // coincide con this.lightDirLoc = getUniformLocation('uLightDir')
  uniform vec3       uLightDir;
  // coincide con this.shininessLoc = getUniformLocation('uShininess')
  uniform float      uShininess;

  void main() {
    // normal y vista
    vec3 N    = normalize(vNormalCam);
    vec3 V    = normalize(-vPositionCam);

    // componente difusa
    float diff = max(dot(N, uLightDir), 0.0);

    // componente especular (Blinn)
    vec3 H    = normalize(uLightDir + V);
    float spec = pow(max(dot(N, H), 0.0), uShininess);

    // Kd = blanco o textura
    vec3 Kd = vec3(1.0);
    if (uShowTex) {
      Kd = texture2D(uTex, vTex).rgb;
    }

    vec3 Ks = vec3(1.0);
    vec3 ambient = vec3(0.1);

    vec3 color = ambient + Kd * diff + Ks * spec;
    gl_FragColor = vec4(color, 1.0);
  }
`;


