var express = require( 'express' );
var chokidar = require( 'chokidar' );
var photosToAlbums = require( './photos-to-albums.js' );

// Convert photos folder to albums.
photosToAlbums();

// Update albums if photos folder changes.
var changed = false;
chokidar.watch(
	'./photos', 
	{ 
		ignoreInitial: true,
		interval: 1000
	}
).on( 'all', function( event, path ) {
	if ( /\.(jpg|jpeg|png|webp|gif)$/i.test( path ) ) {
		//DEBUG: console.log(event, path);
		changed = true;
	}
} );
setInterval( function() {
	if ( changed ) {
	console.log( "Updating albums." );
		photosToAlbums();
		changed = false;
	}	
}, 1000 );
console.log( "Watching the photos folder for albums." );


// Serve app statically.
var photopticon = express();
photopticon.use( express.static( __dirname ) );
var port = process.env.PORT || 8000;
photopticon.listen( port );
console.log( "Running the app on port " + port + ". Press Ctrl+C to stop." );