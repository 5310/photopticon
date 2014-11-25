//// Reference cube.
//var geomBox = new THREE.BoxGeometry( 100, 100, 100 ); 
//var matWire = new THREE.MeshBasicMaterial( { color: 0xff0000, wireframe: true } );
//var meshBox = new THREE.Mesh( geomBox, matWire ); 
//scene.add( meshBox );

// Interaction globals.
var projector = new THREE.Projector();
var raycaster = new THREE.Raycaster();
var getSelection = function( intersectables ) {
	var gaze = new THREE.Vector3(0, 0, 1);
	projector.unprojectVector(gaze, camera);
	raycaster.set( camera.position, gaze.sub( camera.position ).normalize() );
	return raycaster.intersectObjects( intersectables, true );
};
var getUrlParameter = function( name ) {
	name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
	var regexS = "[\\?&]"+name+"=([^&#]*)";
	var regex = new RegExp( regexS );
	var results = regex.exec( location.href );
	if ( results === null ) {
		return null;
	} else {
		return results[1];
	}
};

// Cursor class and generation.
var Cursor = function( camera ) {
	var geometry = new THREE.RingGeometry(
		0.6 * Cursor.SIZE, 1 * Cursor.SIZE, 32
	);
	var material = new THREE.MeshBasicMaterial(
		{
			color: 0xffffff,
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide
		}
	);
	THREE.Mesh.call(this, geometry, material);
	this.position.z = -Cursor.DISTANCE;
	camera.add(this);
	camera.cursor = this;
	this.lookAt(camera.position);
};
Cursor.prototype = Object.create(THREE.Mesh.prototype);
Cursor.prototype.constructor = Cursor;
Cursor.SIZE = 2;
Cursor.DISTANCE = 50;

var cursor = new Cursor( camera );

// Photo class.
var Photo = function( i, yaw, pitch, size, distance ) {

	//DEBUG: console.log( "Creating photo: " + i );

	THREE.Object3D.call(this);

	yaw = yaw ? yaw : 0;
	pitch = pitch ? pitch : 0;
	size = size ? size : 50;
	distance = distance ? distance : 100;

	var offset = 0;
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

		self._photo._photo = self;

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
			offset = ( Photo.FOCUSDISTANCE - this.distance ) * focus;
			if ( this._photo ) {
				this._photo.position.x = distance + offset;
			}
		}
	});

};
Photo.prototype = Object.create(THREE.Object3D.prototype);
Photo.prototype.constructor = Photo;
Photo.FOCUSDISTANCE = 20;

// Album class.
var Album = function( photoUrls ) {

	this.totalPages = Math.ceil( photoUrls.length / Album.MAXPHOTOPERPAGE );

	this.photoUrls = []
	var i, j;
	var k = 0;
	var photosPerPages = Math.floor( photoUrls.length / this.totalPages ); 
	for ( i = 0; i < this.totalPages; i++ ) {
		var photoUrlsOnPage = [];
		for ( j = 0; j < photosPerPages; j++ ) {
			photoUrlsOnPage.push( photoUrls[ i*photosPerPages + j ] );
			k++;
		}
		this.photoUrls.push( photoUrlsOnPage );
	}
	for ( k; k < photoUrls.length; k++ ) {
		this.photoUrls[ this.photoUrls.length-1 ].push( photoUrls[k] );
	}

	this.activePageIndex = 0;

	this.state = 0;
	
	var geometry = new THREE.CircleGeometry( 16, 8	);
	var materialNext = new THREE.MeshBasicMaterial(
		{
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			map: THREE.ImageUtils.loadTexture( 'assets/label_next.png' )
		}
	);
	var materialPrev = new THREE.MeshBasicMaterial(
		{
			blending: THREE.AdditiveBlending,
			side: THREE.DoubleSide,
			map: THREE.ImageUtils.loadTexture( 'assets/label_prev.png' )
		}
	);

	this.scrollTimer = 0;
	this.nextTarget = new THREE.Mesh( geometry, materialNext );
	scene.add( this.nextTarget );
	this.nextTarget.direction = 1;
	this.nextTarget.position.z = -100;
	this.previousTarget = new THREE.Mesh( geometry, materialPrev );
	scene.add( this.previousTarget );
	this.previousTarget.position.z = 100;
	this.previousTarget.rotation.x = Math.PI;
	this.previousTarget.direction = -1;
	
};
Album.prototype.update = function( dt ) {
	// State logic.
	switch ( this.state ) {
		case 0: // Load currently active page.
			this._create();
			this.state = 1;
			break;
		case 1:
			this._show( dt );
			if ( this.page.show === 1 ) this.state = 2;
			break;
		case 2:
			this._focus( dt );
			this._scroll( dt );
			break;
		case 3: // This state is achieved externally. Just set the new active photos list and then set in motion.
			this._hide( dt );
			if ( this.page.hide === 1 ) this.state = 0;
			break;
		case 4: // This state is achieved externally. Just set the new active photos list and then set in motion.
			this._hide( dt, true ); // Reversed direction.
			if ( this.page.hide === 1 ) this.state = 0;
			break;
	};
	// Enspriten targets.
	this.nextTarget.rotation.z = camera.rotation.z;
	this.previousTarget.rotation.z = camera.rotation.z;
};
Album.prototype.next = function() {
	this.activePageIndex++;
	this.activePageIndex %= this.totalPages;
	this.state = 4;
};
Album.prototype.previous = function() {
	this.activePageIndex--;
	this.activePageIndex += this.totalPages;
	this.activePageIndex %= this.totalPages;
	this.state = 3;
};
Album.prototype._create = function() { // The photos to load for this "page." Has to be less than the maximum that fits in a page, 28. Preferably a slice.

	var photos = this.photoUrls[ this.activePageIndex ].slice(0);

	var total = 4*7;
	var indices = [];
	for ( var i = 0; i < total; i++ ) {
		indices[i] = true;
	}
	var count = photos.length;
	while ( count ) {
		var index = Math.floor( Math.random() * (total+1) );
		if ( indices[index] ) {
			indices[index] = false;
			count--;
		}
	}
	for ( var i = 0; i < total; i++ ) {
		if ( indices[i] ) {
			indices[i] = photos.shift();
		}
	}
	var page = [];
	for ( var i = 0 ; i < 4; i++ ) {
		var index = i*7;
		var center = - Math.PI*2/4 * i;
		if ( indices[index] ) {
			var p = new Photo( 
				indices[index], 
				center + Math.cos( Math.random()*Math.PI*2 ) * 0.15, 
				0 + Math.sin( Math.random()*Math.PI*2 ) * 0.15, 
				0.1,
				100+Math.random()*50
			);
			scene.add( p );
			p.img = indices[index];
			page.push( p );
		}
		var rotation = Math.random()*Math.PI*2/6;
		for ( var j = 0; j < 6; j++ ) {
			index = i*7 + 1 + j;
			if ( indices[index] ) {
				var p = new Photo( 
					indices[index], 
					center + Math.cos( Math.PI*2/6 * j + rotation ) * 0.5 + Math.cos( Math.random()*Math.PI*2 ) * 0.15, 
					Math.sin( Math.PI*2/6 * j + rotation ) * 0.5 + Math.sin( Math.random()*Math.PI*2 ) * 0.15, 
					0.1,
					100+Math.random()*50
				);
				scene.add( p );
				p.img = indices[index];
				page.push( p );
			}
		}
	}

	this.page = page;

};
Album.prototype._show = function( dt ) {

	if ( !this.page.show ) {
		this.page.show = 0;
	}

	if ( this.page.show < 1 ) {
		this.page.show += dt*10 * Album.SHOWSPEEDMULTIPLIER;
		if ( this.page.show > 1 ) this.page.show = 1;
		var interpolation;
		var step = 0.5 / this.page.length;
		for ( var i = 0; i < this.page.length; i++ ) {
			var photo = this.page[i];
			photo.size = Math.sqrt( this.page.show ) * Album.PHOTOSIZE;
		}
	}

};
Album.prototype._focus = function( dt ) {
	// Get focal photo.
	var selection = getSelection( this.page );
	if ( selection.length ) {
		selection = selection[0].object._photo;
	} else {
		selection = null;
	}
	for ( var i = 0; i < this.page.length; i++ ) {
		var photo = this.page[i];
		if ( photo !== selection ) {
			// Reset focus.
			photo.focus *= 1 - 0.3 * dt * 60 * 20 ;
			if ( photo.focus <= 0 ) {
				photo.focus = 0;
			}
		} else {
			// Increase focus.
			if ( photo.focus < 0.01 ) {
				photo.focus = 0.01;
			} else {
				photo.focus += ( 1 - photo.focus ) / ( 5 * dt * 60 * 20 );
			}			
			if ( photo.focus > 1 ) {
				photo.focus = 1;
			}
		}		
	}
};
Album.prototype._hide = function( dt, reverse ) {

	if ( !this.page.hide ) {
		this.page.hide = 0;
	}

	var height = reverse ? -500 : 500;

	if ( this.page.hide < 1 ) {
		var interpolation;
		var step = 0.5 / this.page.length;
		for ( var i = 0; i < this.page.length; i++ ) {
			var photo = this.page[i];
			if ( this.page.hide > step*i ) {
				interpolation = ( this.page.hide - step*i ) * 2;
			} else {
				interpolation = 0;
			}
			if ( interpolation < 1 ) {
				photo.position.z += ( height - photo.position.z ) * interpolation;
				var s = photo.size * ( 1 - interpolation*0.9 );
				if ( s > 0.1 ) photo.size = s;
			}
		}
		this.page.hide += dt*10 * Album.HIDESPEEDMULTIPLIER;
	} else {
		this.page.hide = 1;
		for ( var i = 0; i < this.page.length; i++ ) {
			var photo = this.page[i];
			photo.remove( photo._photo );
			scene.remove( photo );
		}
		while( this.page.length > 0 ) {
			this.page.pop();
		}
	}

};
Album.prototype._scroll = function( dt ) {
	// Get scroll direction.
	var selection = getSelection( [ this.nextTarget, this.previousTarget ] );
	if ( selection.length ) {
		selection = selection[0].object.direction;
	} else {
		selection = null;
	}
	// Increment or reset the scrollTimer.
	if ( selection ) {
		this.scrollTimer += dt * 10 * Album.SCROLLTIMERMULTIPLIER;
	} else {
		this.scrollTimer = 0;
	}
	if ( this.scrollTimer >= 1 ) {
		this.scrollTimer = 0; // Delay the scrollTimer.
		switch ( selection ) {
			case -1:
				this.previous();
				break;
			case 1:
				this.next();
				break;
		}
	}
	// Shrink cursor if hovering.
	if ( selection ) {
		cursor.scale.set( 1-this.scrollTimer, 1-this.scrollTimer, 1-this.scrollTimer );
	} else {
		cursor.scale.set( 1, 1, 1 );
	}
};
Album.MAXPHOTOPERPAGE = 28;
Album.PHOTOSIZE = 50;
Album.SHOWSPEEDMULTIPLIER = 1.25;
Album.HIDESPEEDMULTIPLIER = 3;
Album.SCROLLTIMERMULTIPLIER = 3;



// Album generation.
var albumUrls = albums[ getUrlParameter( 'album' ) ];
if ( !albumUrls ) {
	var albumNames = Object.getOwnPropertyNames( albums );
	albumUrls = albums[ albumNames[ Math.floor( Math.random() * albumNames.length ) ] ];
}
var album = new Album( albumUrls );

// Tick function override.
function tick( dt ) {
	album.update( dt );
}