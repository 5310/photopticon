var fs = require('fs');
var path = require('path');

// Returns an object containing albums by directory name and an array of all photos within that directory by parsing the 'photos' folder.
var parseAlbums = function( dirPath ) {

	// Recursively parses the photo folder and returns a nested array of the photos in any directory within.
	function getPhotosRecursively( dirPath ) {
		var albums = [];
		fs.readdirSync( dirPath ).forEach( function( filename ) {
			var filePath = dirPath+'/'+filename;
			var file = fs.statSync( filePath );
			if ( file.isFile() ) {
				if ( /\.(jpg|jpeg|png|webp|gif)$/i.test( filename ) ) {
					albums.push( filePath );
				}
			} else if ( file.isDirectory() ) {
				albums.push( getPhotosRecursively( filePath ) );
			}
		} );
		return albums;
	}

	// Receives the nested array of photos and flattens it into a set of albums by directory name and all photos within it.
	var flattenRecursivePhotosToAlbums = function( recursivePhotos ) {
		var albums = {};
		var queue = recursivePhotos.slice(0);
		while ( queue.length ) {
			var element = queue.shift();
			if ( typeof element === 'string' ) {
				var dirname = path.relative( 'photos', path.dirname( element ) );
				if ( !albums[dirname] ) {
					albums[dirname] = [];
				}
				albums[dirname].push( element );
			} else if ( element instanceof Array ) {
				element.forEach( function( innerElement ) {
					queue.push( innerElement );
				} );
			}
		}
		return albums;
	};

	// Actually does the thing.
	return flattenRecursivePhotosToAlbums( getPhotosRecursively( dirPath ) );

};

// Stores the parsed albums into a global object called 'albums' in a js file that will be linked by the frontend.
var storeAlbums = function( albums, filePath ) {
	fs.writeFile( 
		filePath, 
		"var albums = " + JSON.stringify( albums ) + ";", 
		function( err ) {
			if( err ) { 
				console.log( err ); 
			} else {
				console.log( "Albums parsed succesfully and saved to `photos/albums.js`." );
			}
		} 
	);
};

// Does the actual thing, for reals.
var photosToAlbums = function() {
	storeAlbums( parseAlbums( 'photos' ), "photos/albums.js" ) ;
};

// Exports.
module.exports = photosToAlbums;
module.exports.parseAlbums = parseAlbums;
module.exports.storeAlbums = storeAlbums;

// Invoke the actual thing if being ran directly.
if ( !module.parent ) {
    photosToAlbums();
} 