ig.module(
    'plugins.audia-audio'
)
.requires(
    'impact.impact',
    'plugins.audia-delegate'
)
.defines(function(){
ig.AudiaAudio = ig.AudiaDelegate.extend({
    // Create a thin wrapper around the Audio object…

    // Constructor
    init: function(src, config) {
    	this.parent(config);

		this.id = this.addAudiaObject(this);
        this._audioNode = new Audio();

        // Support for new Audia(src)
        if (typeof src !== 'undefined') {
            this.src = src;
        }

        return this;
    },

    load: function (type) {
        this._audioNode.load();
    },

    play: function (currentTime) {
        if (typeof currentTime !== 'undefined') {
            this._audioNode.currentTime = currentTime;
        }
        this._audioNode.play();
    },

    pause: function () {
        this._audioNode.pause();
    },

    stop: function () {
        this._audioNode.pause();
        this._audioNode.currentTime = 0;
    },

    addEventListener: function (eventName, callback, capture) {
        this._audioNode.addEventListener(eventName, callback, capture);
    },

    removeEventListener: function (eventName, callback, capture) {
        this._audioNode.removeEventListener(eventName, callback, capture);
    },

    // Properties

    // autoplay (Boolean)
    autoplay: function(value) {
    	if (typeof value !== 'undefined')
        	this._audioNode.autoplay = value;
        return this._audioNode.autoplay;
    },

    // buffered (TimeRanges)
    buffered: function() {
        return this._audioNode.buffered;
    },

    // currentSrc (String)
    currentSrc: function() {
        return this._audioNode.src;
    },

    // currentTime (Number)
    currentTime: function(value) {
    	if (typeof value !== 'undefined')
            this._audioNode.currentTime = value;
        return this._audioNode.currentTime;
    },

    // defaultPlaybackRate (Number) (default: 1)
    // TODO: not being used ATM
    defaultPlaybackRate: function(value) {
    	if (typeof value !== 'undefined')
            this._audioNode.defaultPlaybackRate = value;
        return this._audioNode.defaultPlaybackRate;
    },

    // duration (Number)
    duration: function() {
        return this._audioNode.duration;
    },

    // loop (Boolean)
    loop: function(value) {
    	if (typeof value !== 'undefined') {
            // Fixes a bug in Chrome where audio will not play if currentTime
            // is at the end of the song
            if (this._audioNode.currentTime >= this._audioNode.duration) {
                this._audioNode.currentTime = 0;
            }
            this._audioNode.loop = value;
    	}
        return this._audioNode.loop;
    },

    // muted (Boolean)
    muted: function(value) {
    	if (typeof value !== 'undefined')
            this._audioNode.muted = value;
        return this._audioNode.muted;
    },

    // paused (Boolean)
    paused: function() {
        return this._audioNode.paused;
    },

    // playbackRate (Number) (default: 1)
    playbackRate: function(value) {
    	if (typeof value !== 'undefined')
            this._audioNode.playbackRate = value;
        return this._audioNode.playbackRate;
    },

    // played (Boolean)
    played: function() {
        return this._audioNode.played;
    },

    // preload (String)
    preload: function(value) {
    	if (typeof value !== 'undefined')
            this._audioNode.preload = value;
        return this._audioNode.preload;
    },

    // seekable (Boolean)
    seekable: function() {
        return this._audioNode.seekable;
    },

    // seeking (Boolean)
    seeking: function() {
        return this._audioNode.seeking;
    },

    // src (String)
    src: function(value) {
    	if (typeof value !== 'undefined')
            this._audioNode.src = value;
        return this._audioNode.src;
    },

    // volume (Number) (range: 0-1) (default: 1)
    volume: function(value) {
    	if (typeof value !== 'undefined') {
            if (this.preventErrors) {
                var value = this.clamp(value, 0, 1);
            }
            this._audioNode.volume = value;
    	}
        return this._audioNode.volume;
    }

});
});