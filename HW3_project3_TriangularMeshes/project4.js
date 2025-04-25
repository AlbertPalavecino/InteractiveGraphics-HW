// This function takes the projection matrix, the translation, and two rotation angles (in radians) as input arguments.
// The two rotations are applied around x and y axes.
// It returns the combined 4x4 transformation matrix as an array in column-major order.
// The given projection matrix is also a 4x4 matrix stored as an array in column-major order.
// You can use the MatrixMult function defined in project4.html to multiply two 4x4 matrices in the same format.
function GetModelViewProjection(projectionMatrix, translationX, translationY, translationZ, rotationX, rotationY) 
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

	// 4. multiply the rotation matrices
	var rotationMatrix = MatrixMult(rotationYMatrix, rotationXMatrix);

	// 5. aply the translation to the rotation matrix
	var modelMatrix = MatrixMult(trans, rotationMatrix);

	// 6. Finally, multiply the projection matrix with the model matrix
	var mvp = MatrixMult(projectionMatrix, modelMatrix);

	return mvp;
}


// [TO-DO] Complete the implementation of the following class.

class MeshDrawer
{
	// The constructor is a good place for taking care of the necessary initializations.
  constructor() {
    this.prog = InitShaderProgram(meshVS, meshFS);
    this.mvpLoc = gl.getUniformLocation(this.prog, 'mvp');
    this.posLoc = gl.getAttribLocation(this.prog, 'pos');
    this.texCoordLoc = gl.getAttribLocation(this.prog, 'texCoord');
    this.showTexLoc  = gl.getUniformLocation(this.prog, 'uShowTex');
    this.samplerLoc  = gl.getUniformLocation(this.prog, 'uTex');

    this.positionBuffer = gl.createBuffer();
    this.texCoordBuffer = gl.createBuffer();
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
	// The arguments of this function is an array of 3D vertex positions
	// and an array of 2D texture coordinates.
	// Every item in these arrays is a floating point value, representing one
	// coordinate of the vertex position or texture coordinate.
	// Every three consecutive elements in the vertPos array forms one vertex
	// position and every three consecutive vertex positions form a triangle.
	// Similarly, every two consecutive elements in the texCoords array
	// form the texture coordinate of a vertex.
	// Note that this method can be called multiple times.
	setMesh( vertPos, texCoords )
	{
		// [TO-DO] Update the contents of the vertex buffer objects.
		this.numTriangles = vertPos.length / 3;

		// vinculate and fill the buffer of vertex positions
		gl.bindBuffer(gl.ARRAY_BUFFER, this.positionBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertPos), gl.STATIC_DRAW);

		// vinculate and fill the buffer of texture coordinates
		gl.bindBuffer(gl.ARRAY_BUFFER, this.texCoordBuffer);
		gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(texCoords), gl.STATIC_DRAW);
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
	// The argument is the transformation matrix, the same matrix returned
	// by the GetModelViewProjection function above.
  draw(trans) {
		// apply swap matrix if needed
		let mvp = trans;
		if ( this.swap ) {
			mvp = MatrixMult( trans, this.swapMatrix );
		}

    gl.useProgram(this.prog);
		
    // uniforms
    gl.uniformMatrix4fv(this.mvpLoc, false, mvp);
    gl.uniform1i(this.showTexLoc, (this.showTextureOn && this.hasTexture) ? 1 : 0);
    // texture in unnit 0
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

    gl.drawArrays(gl.TRIANGLES, 0, this.numTriangles);
  }
	
	// This method is called to set the texture of the mesh.
	// The argument is an HTML IMG element containing the texture data.
	setTexture( img )
	{
    gl.bindTexture(gl.TEXTURE_2D, this.texture);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA,
                  gl.RGBA, gl.UNSIGNED_BYTE, img);
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
	
}

// to draw the mesh we need a shader program
var meshVS = `
  attribute vec3 pos;
  attribute vec2 texCoord;
  uniform mat4 mvp;
  varying vec2 vTex;
  void main() {
    vTex = texCoord;
    gl_Position = mvp * vec4(pos, 1.0);
  }
`;

// Fragment shader that choose depth color or the texture color
var meshFS = `
  precision mediump float;
  varying vec2 vTex;
  uniform sampler2D uTex;
  uniform bool uShowTex;
  void main() {
    if (uShowTex) {
      gl_FragColor = texture2D(uTex, vTex);
    } else {
      float d = gl_FragCoord.z * gl_FragCoord.z;
      gl_FragColor = vec4(1.0, d, 0.0, 1.0);
    }
  }
`;