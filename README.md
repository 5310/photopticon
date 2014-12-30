# Photopticon

Photopticon is a web-based VR photo-viewing environment made for the Google Cardboard.

Seeing how well, within reasons, the [Chrome Experiments for Cardboard](http://vr.chromeexperiments.com/) ran, I decided to try making something VR-y for myself _"as a learning experience."_ Didn't have any feasible ideas, and so I listened to the simplest suggestion I could find.

## Usage

Currently, the apps is just a static web-app for viewing the demo photos. And a local Node "server" that crawls a specific directory for photo folders and can display them as albums.

A static demonstration of the app can be found here:

-  github.io/5310/photopticon

And the app can be ran locally, for viewing local photos, by downloading this repository and running the server, and then opening the served app.

1.	Run the server with: `$ node server.js`
2.	Copy folders of photos inside the `photos` directory.
3.  Open [localhost:8000](localhost:8000) on the device.

When the app is opened, it will show a list of all available albums.

1.	Click on an album to launch the viewer with that album loaded.
2.	Turn your head around to see the photos randomly distributed around you.
	-	Actually, the  photos are distributed roughly in alphabetical order from the starting point _rightwise._
3.	Hover over a photo to bring it to the front.
	-	The cursor will hidden behind the photo in focus.
4.	Look away from the photo to put it back.
	-	The cursor will become visible if you look away from the photo.
5.	Hover over the top and bottom buttons to change pages within the album.
	-	This has a brief timeout: The hover has to linger over the button for a while.
	-	The cursor will shrink to signify the action.
	-	After the cursors vanishes and then resets, you'll see the current page move out of the scene and the new page appear.
6.	Go back on your browser to return to the album index.

## Requirements

The web-app that runs on anything that can run the [Chrome Experiments for Cardboard](http://vr.chromeexperiments.com/). 

-	This includes Chrome on a modern (think JB+) Android device with gyroscopes. 
-	I think it should also run on Firefox for Android, it certainly ran on Firefox desktop (that's my dev browser.)

The local server for viewing local photos runs on any system with [Node.js](http://nodejs.org/) installed.

## Future Plans

-	A VR-enabled album-index.
-	Using the portrait mode to go back to the album-index, and from there to go back to the non-VR index.
-	Opening albums from the gallery on Android.
-	Opening arbitrary local folders.
-	Packaging a standalone app for Android with Cordova or Crosswalk.

## Attribution

All the photos included with the demo are from [Kevin Dooley](https://www.flickr.com/photos/pagedooley/), CC-BY.
