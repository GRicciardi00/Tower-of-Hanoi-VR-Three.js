async function AmmoPhysics() {

	if ( 'Ammo' in window === false ) {
 
		console.error( 'AmmoPhysics: Couldn\'t find Ammo.js' );
		return;

	}

	const AmmoLib = await Ammo(); // eslint-disable-line no-undef

	const frameRate = 60;

	const collisionConfiguration = new AmmoLib.btDefaultCollisionConfiguration();
	const dispatcher = new AmmoLib.btCollisionDispatcher( collisionConfiguration );
	const broadphase = new AmmoLib.btDbvtBroadphase();
	const solver = new AmmoLib.btSequentialImpulseConstraintSolver();
	const world = new AmmoLib.btDiscreteDynamicsWorld( dispatcher, broadphase, solver, collisionConfiguration );
	world.setGravity( new AmmoLib.btVector3( 0, - 9.8, 0 ) );

	const worldTransform = new AmmoLib.btTransform();

	//

	function getShape( geometry, id = 0 ) {

		const parameters = geometry.parameters;

		// TODO change type to is*

		if ( geometry.type === 'BoxGeometry' ) {

			const sx = parameters.width !== undefined ? parameters.width / 2 : 0.5;
			const sy = parameters.height !== undefined ? parameters.height / 2 : 0.5;
			const sz = parameters.depth !== undefined ? parameters.depth / 2 : 0.5;

			const shape = new AmmoLib.btBoxShape( new AmmoLib.btVector3( sx, sy, sz ) );
			shape.setMargin( 0.05 );

			return shape;

		} else if ( geometry.type === 'ExtrudeGeometry') {

		let radius = 0;
        const height = 1;
		if (id === 1){
			console.log("disk1")
			radius = 0.6;
		}
		if (id === 2){
			console.log("disk2")
			radius = 0.4;
		}
		if(id ===3){
			console.log("disk3")
			radius = 0.2;
		}
			// Create the Ammo.js shape for the main body of the disk using spheres
			const diskShape = createDiskShape(radius, height);
			return diskShape;

		}
		else if ( geometry.type === 'CylinderGeometry'){
			// Handle cylinders
			const radius = 0.04;
			const height = 0.6;
			const cylinderShape = new AmmoLib.btCylinderShape(new AmmoLib.btVector3(radius, height, radius));
	
			return cylinderShape;
		}

		return null;

	}

	const meshes = [];
	const meshMap = new WeakMap();

	function addScene( scene ) {
		console.log(scene)
		scene.traverse( function ( child ) {

			if ( child.isMesh ) {

				const physics = child.userData.physics;

				if ( physics ) {

					addMesh( child, physics.mass );

				}

			}

		} );

	}

	function addMesh( mesh, mass = 0 ) {

		const shape = getShape( mesh.geometry, mesh.userData.id );

		if ( shape !== null ) {
				
			if ( mesh.isInstancedMesh ) {
				handleInstancedMesh( mesh, mass, shape );

			} else if ( mesh.isMesh ) {
				handleMesh( mesh, mass, shape );

			}

		}

	}

	function handleMesh( mesh, mass, shape ) {

		const position = mesh.position;
		const quaternion = mesh.quaternion;

		const transform = new AmmoLib.btTransform();
		transform.setIdentity();
		transform.setOrigin( new AmmoLib.btVector3( position.x, position.y, position.z ) );
		transform.setRotation( new AmmoLib.btQuaternion( quaternion.x, quaternion.y, quaternion.z, quaternion.w ) );

		const motionState = new AmmoLib.btDefaultMotionState( transform );

		const localInertia = new AmmoLib.btVector3( 0, 0, 0 );
		shape.calculateLocalInertia( mass, localInertia );

		const rbInfo = new AmmoLib.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );

		const body = new AmmoLib.btRigidBody( rbInfo );
		// body.setFriction( 4 );
		world.addRigidBody( body );

		if ( mass > 0 ) {
			meshes.push( mesh );
			meshMap.set( mesh, body );

		}


	}

	function handleInstancedMesh( mesh, mass, shape ) {

		const array = mesh.instanceMatrix.array;

		const bodies = [];

		for ( let i = 0; i < mesh.count; i ++ ) {

			const index = i * 16;

			const transform = new AmmoLib.btTransform();
			transform.setFromOpenGLMatrix( array.slice( index, index + 16 ) );

			const motionState = new AmmoLib.btDefaultMotionState( transform );

			const localInertia = new AmmoLib.btVector3( 0, 0, 0 );
			shape.calculateLocalInertia( mass, localInertia );

			const rbInfo = new AmmoLib.btRigidBodyConstructionInfo( mass, motionState, shape, localInertia );

			const body = new AmmoLib.btRigidBody( rbInfo );
			world.addRigidBody( body );

			bodies.push( body );

		}

		if ( mass > 0 ) {

			meshes.push( mesh );

			meshMap.set( mesh, bodies );

		}

	}

	//

	function setMeshPosition( mesh, position, index = 0 ) {

		if ( mesh.isInstancedMesh ) {

			const bodies = meshMap.get( mesh );
			const body = bodies[ index ];

			body.setAngularVelocity( new AmmoLib.btVector3( 0, 0, 0 ) );
			body.setLinearVelocity( new AmmoLib.btVector3( 0, 0, 0 ) );

			worldTransform.setIdentity();
			worldTransform.setOrigin( new AmmoLib.btVector3( position.x, position.y, position.z ) );
			body.setWorldTransform( worldTransform );

		} else if ( mesh.isMesh ) {

			const body = meshMap.get( mesh );

			body.setAngularVelocity( new AmmoLib.btVector3( 0, 0, 0 ) );
			body.setLinearVelocity( new AmmoLib.btVector3( 0, 0, 0 ) );

			worldTransform.setIdentity();
			worldTransform.setOrigin( new AmmoLib.btVector3( position.x, position.y, position.z ) );
			body.setWorldTransform( worldTransform );

		}

	}

	//Added by me
	function removeMesh(mesh) {
		const body = meshMap.get(mesh);
		console.log("remove")
		if (body !== undefined) {
			world.removeRigidBody(body);
	
			// Remove references from arrays and maps
			const index = meshes.indexOf(mesh);
			if (index !== -1) meshes.splice(index, 1);
	
			meshMap.delete(mesh);
	
			// If the mesh is an instanced mesh, handle the removal
			if (mesh.isInstancedMesh) {
				const bodies = meshMap.get(mesh);
				for (const body of bodies) {
					world.removeRigidBody(body);
				}
				meshMap.delete(mesh);
			}
		}
	}

	//Added by me
	function applyCentralImpulse(object, velocity) {
        const body = meshMap.get(object);

        if (body !== undefined) {
            const impulse = new AmmoLib.btVector3(velocity.x, velocity.y, velocity.z);
            body.applyCentralImpulse(impulse);
        }
    }
	//Added by me
	//Function to apply angular damping to an object
    function applyAngularDamping(object, dampingFactor) {
        const body = meshMap.get(object);

        if (body !== undefined) {
            const angularFactor = new AmmoLib.btVector3(dampingFactor, dampingFactor, dampingFactor);
            body.setAngularFactor(angularFactor);
        }
	}
	let lastTime = 0;

	function step() {

		const time = performance.now();

		if ( lastTime > 0 ) {

			const delta = ( time - lastTime ) / 1000;

			world.stepSimulation( delta, 10 );

			//

			for ( let i = 0, l = meshes.length; i < l; i ++ ) {

				const mesh = meshes[ i ];

				if ( mesh.isInstancedMesh ) {

					const array = mesh.instanceMatrix.array;
					const bodies = meshMap.get( mesh );

					for ( let j = 0; j < bodies.length; j ++ ) {

						const body = bodies[ j ];

						const motionState = body.getMotionState();
						motionState.getWorldTransform( worldTransform );

						const position = worldTransform.getOrigin();
						const quaternion = worldTransform.getRotation();

						compose( position, quaternion, array, j * 16 );

					}

					mesh.instanceMatrix.needsUpdate = true;
					mesh.computeBoundingSphere();

				} else if ( mesh.isMesh ) {

					const body = meshMap.get( mesh );

					const motionState = body.getMotionState();
					motionState.getWorldTransform( worldTransform );

					const position = worldTransform.getOrigin();
					const quaternion = worldTransform.getRotation();
					mesh.position.set( position.x(), position.y(), position.z() );
					mesh.quaternion.set( quaternion.x(), quaternion.y(), quaternion.z(), quaternion.w() );

				}

			}

		}

		lastTime = time;

	}
	function createDiskShape(radius, height) {
		const compoundShape = new AmmoLib.btCompoundShape();
	
		// Number of spheres to approximate the disk
		const numSpheres = 16;
	
		// Angle between each sphere
		const angleIncrement = (2 * Math.PI) / numSpheres;
	
		// Radius of the spheres
		const sphereRadius = height / 8; //cause height / 2 is to big
	
		for (let i = 0; i < numSpheres; i++) {
			const angle = i * angleIncrement;
	
			// Calculate the position of each sphere on the circumference -> polar coordinates to cartesian coordinates
			const spherePosX = radius * Math.cos(angle); // x = r * cos(angle)
			const spherePosY = radius * Math.sin(angle); // y = r * sin(angle)
	
			// Create a sphere shape
			const sphereShape = new AmmoLib.btSphereShape(sphereRadius);
	
			// Create a transform for the sphere
			const sphereTransform = new AmmoLib.btTransform();
			sphereTransform.setIdentity();
			sphereTransform.setOrigin(new AmmoLib.btVector3(spherePosX, spherePosY, 0));
	
			// Add the sphere to the compound shape
			compoundShape.addChildShape(sphereTransform, sphereShape);
		}
	
		return compoundShape;
	}
	// animate

	setInterval( step, 1000 / frameRate );

	return {
		addScene: addScene,
		addMesh: addMesh,
		setMeshPosition: setMeshPosition,
		removeMesh: removeMesh,
		applyCentralImpulse: applyCentralImpulse,
		applyAngularDamping: applyAngularDamping,
		// addCompoundMesh
	};

}

function compose( position, quaternion, array, index ) {

	const x = quaternion.x(), y = quaternion.y(), z = quaternion.z(), w = quaternion.w();
	const x2 = x + x, y2 = y + y, z2 = z + z;
	const xx = x * x2, xy = x * y2, xz = x * z2;
	const yy = y * y2, yz = y * z2, zz = z * z2;
	const wx = w * x2, wy = w * y2, wz = w * z2;

	array[ index + 0 ] = ( 1 - ( yy + zz ) );
	array[ index + 1 ] = ( xy + wz );
	array[ index + 2 ] = ( xz - wy );
	array[ index + 3 ] = 0;

	array[ index + 4 ] = ( xy - wz );
	array[ index + 5 ] = ( 1 - ( xx + zz ) );
	array[ index + 6 ] = ( yz + wx );
	array[ index + 7 ] = 0;

	array[ index + 8 ] = ( xz + wy );
	array[ index + 9 ] = ( yz - wx );
	array[ index + 10 ] = ( 1 - ( xx + yy ) );
	array[ index + 11 ] = 0;

	array[ index + 12 ] = position.x();
	array[ index + 13 ] = position.y();
	array[ index + 14 ] = position.z();
	array[ index + 15 ] = 1;

}


export { AmmoPhysics };
