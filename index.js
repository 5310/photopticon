var markup = [];
var albumNames = Object.getOwnPropertyNames( albums );
for ( var i = 0; i < albumNames.length; i++ ) {
	var albumName = albumNames[i];
	markup.push( 
		[ 'li', 
		 [ 'div.album',
		  [ 'a', 
		   [ 'img', { src: albums[albumName][0] } ],
		   albumName, 
		   { href: 'photopticon.html?album='+albumName }
		  ]
		 ] 
		] 
	);
}
markup.unshift( 'ul' )
markup = [ 'div', markup ];

shaven(	[ document.body, markup ] );