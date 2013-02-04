# Audia

Audia reimplements and extends the [HTML5 Audio][1] object using the [Web Audio API][2].

## ImpactJS module

This fork is Audia restructured to be an [ImpactJS](http://impactjs.com) module. It works, but might contain bugs since it hasn't been properly tested. It's being used at [http://jippi.no](http://jippi.no), but since Jippi doesn't use all of the features, it wasn't necessary to test everything.

It had to be made into an ImpactJS module because of the way we baked the source files in the Jippi project.

### How to use

The current implementation is messy, but I'll refine it for the next project.

Initialize Audia like any other module: this.audia = new Audia();

I used Impact's sound class for HTML Audio, since it was already there and I know it worked. Because of that, I made changes in impact/sound.js to make sure Impact would load and play sounds via Audia when possible.

impact/sound.js, function load()

After line "for( var i = this.clips[path].length; i < ig.Sound.channels; i++ ) {":

```javascript
var a;

if (ig.audia.use) {
    a = ig.audia.load(realPath);
} else {
    a = new Audio(realPath);
    a.load();
}

this.clips[path].push( a );
```

Before line "if (loadCallback) {":

```javascript
var clip;
if (ig.audia.use) {
    clip = ig.audia.load(realPath);
} else {
    clip = new Audio(realPath);
}
```

Now you can use ImpactJS's methods for playing sound, just like you used to.

### Future implementation

I'd like to make it so that you don't have to make changes in impact/sound.js, and rather simply decide which module to use by including the module you'd like (in the require() part of the module definitions).

## Benefits

* Future-proof
* Fails gracefully
* Consistent API with HTML5 Audio which you probably already know
* Fixes bugs in some Audio implementations

* Implementation of `Audio` is weak across the board. Even in the best browers
* this is future-proof. you get Audio which is the best you can get for now, then later down the road you get web audio api
* and seriously, you'll need a wrapper for WAI anyway

A complete write-up on this project can be found on the [Lost Decade Games blog][2].

## API Documentation

Everything is identical to the HTML5 Audio spec. Anything not working as it should? File an issue! :)

In fact in many cases Audia is BETTER than the browser's native Audio implementation, even if it doesn't also support Web Audio API.

### Global Audia object

TODO: Provide thin wrappers around the base code.
* Audia (global object)

* **version**: `String` The version of Audia being run. (Example: `"0.1.0"`)
* **canPlayType**: you can pass in mp3, ogg (helpers since normally it wants audio/ogg audio/mp3)

## Gimme some sugar baby

Audia also has the below API. If any of the below functionality is not supported by the client, Audia will fail silently.

### Audia instances

Example: `var sound = new Audia();`

#### Properties

Each Audia instance has the following properties:

* **currentTime**: `Number` The playback point of the sound (in seconds).
* **duration**: `Number` The length of the current sound buffer in seconds. (Read-only)
* **loop**: `Boolean` If set to true, the audio will play again when it reaches the end of playback. (default: `false`)
* **muted**: `Boolean` True if the sound has been muted, otherwise false.
* **paused**: `Boolean` True if the sound is paused, false if it's playing. (Read-only)
* **src**: `String` The URL of a sound file to load.
* **volume**: `Number` The volume of the playback where `0` is muted and `1` is normal volume. (arbitrary maximum = `10`), (default: `1`)
* **onended**: `Function` Gets called when playback reaches the end of the buffer.
* **onload**: `Function` Gets called when a sound file (requested by setting `src`) is done loading.

_* The italicized properties are only available if the client supports Web Audio API (otherwise they fail silently)._

#### Methods

* **play**: Begins playback of the sound buffer. Arguments: `currentTime` (optional) Sets the `currentTime` property before playing.
* **pause**: Pauses sound playback (retaining `currentTime`).
* **stop**: Stops sound playback (resetting `currentTime` to `0`).
// TODO: it's actually .muted (Boolean)
* **mute**: Silences playback of the sound buffer.
* **unmute**: Restores audible playback of the sound buffer.

## Examples

### Create a sound object and play an mp3

```javascript
var sound = new Audia();
sound.src = "onslaught.mp3";
sound.play();
```
### Create sounds with some sugar

```javascript
var backgroundMusic = new Audia("joshua_morse.mp3");
var battleMusic = new Audia({
	src: "a_recurring_conflict.mp3",
	loop: true
});
```

### Move the playback pointer to 30 seconds into the sound buffer

```javascript
sound.currentTime = 30;
```

### Calculate the percentage of song that's played

```javascript
var percentage = (sound.currentTime / sound.duration) * 100;
```

### Stop it if it's playing

```javascript
if (sound.playing) {
	sound.stop();
}
```

### Play it when it loads

```javascript
sound.onload = function () {
	doSomething();
};
sound.src = "new_song.mp3";
```

[1]: http://www.whatwg.org/specs/web-apps/current-work/#the-audio-element
[2]: https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html
[3]: http://www.lostdecadegames.com/audia-is-a-library-for-simplifying-the-web-audio-api/
