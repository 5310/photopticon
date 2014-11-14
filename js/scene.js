// Reference cube.
var geomBox = new THREE.BoxGeometry( 100, 100, 100 ); 
var matWire = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
var meshBox = new THREE.Mesh( geomBox, matWire ); 
scene.add( meshBox );

// Photo class.
var Photo = function( i, yaw, pitch, size, distance ) {
	
	THREE.Object3D.call(this);
	
	yaw = yaw ? yaw : 0;
	pitch = pitch ? pitch : 0;
	size = size ? size : 50;
	distance = distance ? distance : 100;
	
	var offset = offset ? offset : 0;
	var focus = 0;

	this.rotation.order = "ZYX";
	this.rotation.z = yaw;
	this.rotation.y = pitch;
	
	var self = this;
	var image = THREE.ImageUtils.loadTexture( i, undefined, function() {
		
		image.anisotropy = renderer.getMaxAnisotropy();
		
		var diagonal = Math.atan2( image.image.height, image.image.width );
		var x = Math.cos( diagonal );
		var y = Math.sin( diagonal );

		self._photo = new THREE.Mesh( new THREE.PlaneGeometry( x, y ), new THREE.MeshBasicMaterial( { map: image } ) );	
		self._photo.rotation.y = -Math.PI/2;
		self._photo.rotation.z = -Math.PI/2;
		self._photo.position.x = distance;
		self._photo.scale.set( size, size, size );
		self.add( self._photo );
	
	} );
	
	Object.defineProperty(this, 'yaw', {
		get: function() {
			return this.rotation.z;
		},
		set: function( value ) {
			this.rotation.z = value;
		}
	});	
	Object.defineProperty(this, 'pitch', {
		get: function() {
			return this.rotation.y;
		},
		set: function( value ) {
			this.rotation.y = value;
		}
	});	
	Object.defineProperty(this, 'size', {
		get: function() {
			if ( this._photo ) {
				return this._photo.scale.x;
			}
		},
		set: function( value ) {
			if ( this._photo ) {
				this._photo.scale.set( value, value, value );
			}
		}
	});
	Object.defineProperty(this, 'distance', {
		get: function() {
			return distance;
		},
		set: function( value ) {
			distance = value;
			if ( this._photo ) {
				this._photo.position.x = distance + offset;
			}
		}
	});
	Object.defineProperty(this, 'focus', {
		get: function() {
			return focus;
		},
		set: function( value ) {
			focus = value;
			offset = ( Photo.focusDistance - this.distance ) * focus;
			if ( this._photo ) {
				this._photo.position.x = distance + offset;
			}
		}
	});
	
};
Photo.prototype = Object.create(THREE.Object3D.prototype);
Photo.focusDistance = 20;

// Generate photos.

var photos = [];
for ( var i in photoUrls ) {
	console.log( "Loading "+photoUrls[i]);
	var photo = new Photo( "textures/photos/"+photoUrls[i], Math.random()*Math.PI*2, (Math.random()*2-1)*1, 50, 100+Math.random()*20 );
	photos.push( photo );
	scene.add( photo );
}

// Tick function override.
var time = 0;
function tick( dt ) {
	time += dt*10;
}