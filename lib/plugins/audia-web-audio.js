ig.module(
    'plugins.audia-web-audio'
)
.requires(
    'impact.impact',
    'plugins.audia-delegate'
)
.defines(function(){
ig.AudiaWebAudio = ig.AudiaDelegate.extend({
    // Reimplement Audio using Web Audio API…

    // Load audio helper
    buffersCache: {},
    gainNodeMaster: null,
    gainNode: null,

    init: function(src, config) {
        this.parent(config);
        
        // Setup a master gain node
        this.gainNodeMaster = this.audioContext.createGainNode();
        this.gainNodeMaster.gain.value = 1;
        this.gainNodeMaster.connect(this.audioContext.destination);

        this.id = this.addAudiaObject(this);

        // Setup
        this._listenerId = 0;
        this._listeners = {};

        // Audio properties
        this._autoplay = false;
        this._buffered = []; // TimeRanges
        this._currentSrc = "";
        this._currentTime = 0;
        this._defaultPlaybackRate = 1;
        this._duration = NaN;
        this._loop = false;
        this._muted = false;
        this._paused = true;
        this._playbackRate = 1;
        this._played = []; // TimeRanges
        this._preload = 'auto';
        this._seekable = []; // TimeRanges
        this._seeking = false;
        this._src = '';
        this._volume = 1;

        // Create gain node
        this.gainNode = this.audioContext.createGainNode();
        this.gainNode.gain.value = this._volume;

        // Connect to master gain node
        this.gainNode.connect(this.gainNodeMaster);

        // Support for new Audia(src)
        if (typeof src !== 'undefined') {
            // this.src = src;
            this.src(src);
        }

        return this;
    },

    loadAudioFile: function (audia, url) {
        var onLoad = function (buffer) {
            // Duration
            if (buffer.duration !== audia._duration) {
                audia._duration = buffer.duration;
                audia.dispatchEvent('durationchange' /*, TODO*/);
            }

            audia.dispatchEvent('canplay' /*, TODO*/);
            audia.dispatchEvent('canplaythrough' /*, TODO*/);
            audia.dispatchEvent('load' /*, TODO*/);

            audia._autoplay && audia.play();
        };

        // Got a cached buffer or should we fetch it?
        if (url in this.buffersCache) {
            onLoad(this.buffersCache[url]);
        }
        else {
            var xhr = new XMLHttpRequest();
            xhr.open('GET', url, true);
            xhr.responseType = 'arraybuffer';
            var xhrOnload = function () {
                var a = this;
                this.audioContext.decodeAudioData(xhr.response, function (buffer) {
                    a.buffersCache[url] = buffer;
                    onLoad(buffer);
                });
            };
            xhr.onload = xhrOnload.bind(this);
            xhr.send();
        }
    },

    refreshBufferSource: function (object) {
        // Create (or replace) buffer source
        object.bufferSource = this.audioContext.createBufferSource();

        var src = object.src();

        // Attach buffer to buffer source
        object.bufferSource.buffer = this.buffersCache[src];

        // Connect to gain node
        object.bufferSource.connect(object.gainNode);

        // Update settings
        object.bufferSource.loop = object._loop;
    },

    load: function () {
        // TODO: find out what it takes for this to fire
        // proably just needs src set right?
        this._src && loadAudioFile(this, this._src);
    },

    play: function () {
        // console.log('AudiaWebAudio:play');
        // TODO: restart from this.currentTime
        this._paused = false;

        this.refreshBufferSource(this);
        this.bufferSource.noteOn(0);
    },

    pause: function () {
        if (this._paused) { return; }
        this._paused = true;

        this.bufferSource.noteOff(0);
    },

    stop: function () {
        if (this._paused) { return; }

        this.pause();
        this.currentTime = 0;
    },

    // addEventListener: function (eventName, callback, capture) {
    addEventListener: function (eventName, callback) {
        this._listeners[++this._listenerKey] = {
            eventName: eventName,
            callback: callback
        };
    },

    dispatchEvent: function (eventName, args) {
        for (var id in this._listeners) {
            var listener = this._listeners[id];
            if (listener.eventName == eventName) {
                listener.callback && listener.callback.apply(listener.callback, args);
            }
        }
    },

    // removeEventListener: function (eventName, callback, capture) {
    removeEventListener: function (eventName, callback) {
        // Get the id of the listener to remove
        var listenerId = null;
        for (var id in this._listeners) {
            var listener = this._listeners[id];
            if (listener.eventName === eventName) {
                if (listener.callback === callback) {
                    listenerId = id;
                    break;
                }
            }
        }

        // Delete the listener
        if (listenerId !== null) {
            delete this._listeners[listenerId];
        }
    },

    // autoplay (Boolean)
    autoplay: function(value) {
        if (typeof value !== 'undefined')
            this._autoplay = value;
        return this._autoplay;
    },

    // buffered (TimeRanges)
    buffered: function() {
        return this._buffered;
    },

    // currentSrc (String)
    currentSrc: function() {
        return this._currentSrc;
    },

    // currentTime (Number)
    // TODO: throw errors appropriately (eg DOM error)
    currentTime: function(value) {
        if (typeof value !== 'undefined')
            this._currentTime = value;
        return this._currentTime;
    },

    // defaultPlaybackRate (Number) (default: 1)
    defaultPlaybackRate: function(value) {
        if (typeof value !== 'undefined')
            this._defaultPlaybackRate = value;
        return Number(this._defaultPlaybackRate);
    },

    // duration (Number)
    duration: function() {
        return this._duration;
    },

    // loop (Boolean)
    loop: function(value) {
        if (typeof value !== 'undefined') {
            // TODO: buggy, needs revisit
            if (this._loop === value) { return; }
            this._loop = value;

            if (!this.bufferSource) { return; }

            if (this._paused) {
                this.refreshBufferSource(this);
                this.bufferSource.loop = value;
            } else {
                this.pause();
                this.refreshBufferSource(this);
                this.bufferSource.loop = value;
                this.play();
            }
        }
        return this._loop;
    },

    // muted (Boolean)
    muted: function(value) {
        if (typeof value !== 'undefined') {
            this._muted = value;
            this.gainNode.gain.value = value ? 0 : this._volume;
        }
        return this._muted;
    },

    // paused (Boolean)
    paused: function() {
        return this._paused;
    },

    // playbackRate (Number) (default: 1)
    playbackRate: function(value) {
        if (typeof value !== 'undefined')
            this._playbackRate = value;
        return this._playbackRate;
    },

    // played (Boolean)
    played: function(value) {
        return this._played;
    },

    // preload (String)
    preload: function(value) {
        if (typeof value !== 'undefined')
            this._preload = value;
        return this._preload;
    },

    // seekable (Boolean)
    seekable: function(value) {
        return this._seekable;
    },

    // seeking (Boolean)
    seeking: function(value) {
        return this._seeking;
    },

    // src (String)
    src: function(value) {
        if (typeof value !== 'undefined') {
            this._src = value;
            this.loadAudioFile(this, value);
        }
        return this._src;
    },

    // volume (Number) (range: 0-1) (default: 1)
    volume: function(value) {
        if (typeof value !== 'undefined') {
            // Emulate Audio by throwing an error if volume is out of bounds
            if (!this.preventErrors) {
                if (this.clamp(value, 0, 1) !== value) {
                    // TODO: throw DOM error
                }
            }

            if (value < 0) { value = 0; }
            this._volume = value;

            // Don't bother if we're muted!
            if (this._muted) { return; }

            this.gainNode.gain.value = value;

            // this.dispatchEvent('volumechange'/*, TODO*/);
            this.dispatchEvent('volumechange');
        }
        return this._volume;
    }
});
});