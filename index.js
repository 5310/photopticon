var markup = [];
var albumNames = Object.getOwnPropertyNames( albums );
for ( var i = 0; i < albumNames.length; i++ ) {
	var albumName = albumNames[i];
	markup.push( 
		[ 'div.album',
		 [ 'a', 
		  [ 'div.crop', 
		   [ 'img', { src: albums[albumName][0] } ] ],
		   [ 'label', albumName ],
		  { href: 'photopticon.html?album='+albumName }
		 ]
		]
	);
}
markup.unshift( 'div#albums' );

shaven(	[ document.body, [ 'main', markup ] ] );