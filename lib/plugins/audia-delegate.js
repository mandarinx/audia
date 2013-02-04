ig.module(
    'plugins.audia-delegate'
)
.requires(
    'impact.impact'
)
.defines(function(){
ig.AudiaDelegate = ig.Class.extend({

    preventErrors: false,
    hasWebAudio: null,
    audioContext: null,

    audioId: 0,
    audiaObjectsCache: {},

    init: function(config) {

        for (var key in config) {
            this[key] = config[key];
        }

        // Wrap all "on" properties up into the events
        var eventNames = [
            "abort",
            "canplay",
            "canplaythrough",
            "durationchange",
            "emptied",
            "ended",
            "error",
            "loadeddata",
            "loadedmetadata",
            "loadstart",
            "pause",
            "play",
            "playing",
            "progress",
            "ratechange",
            "seeked",
            "seeking",
            "stalled",
            "suspend",
            "timeupdate",
            "volumechange"
        ];

        for (var i = 0, j = eventNames.length; i < j; ++i) {

            var eventName = eventNames[i],
                fauxPrivateName = "_on" + eventName;
            this[fauxPrivateName] = null;
                
            this['on' + eventName] = (function() {
                return function() {
                    // Remove the old listener
                    if (this[fauxPrivateName]) {
                        this.removeEventListener(eventName, this[fauxPrivateName], false);
                    }

                    // Only set functions
                    if (typeof value == "function") {
                        this[fauxPrivateName] = value;
                        this.addEventListener(eventName, value, false);
                    } else {
                        this[fauxPrivateName] = null;
                    }

                    return this[fauxPrivateName];
                };
            }());
        }
    },

    addAudiaObject: function(object) {
        var id = ++this.audioId;
        this.audiaObjectsCache[id] = object;
        return id;
    },

    // Math helper
    clamp: function (value, min, max) {
        return Math.min(Math.max(Number(value), min), max);
    },

    // canPlayType helper
    // Can be called with shortcuts, e.g. "mp3" instead of "audio/mp3"
    canPlayType: function (type) {
        var audioNode = new Audio(),
            type = (type.match('/') === null ? 'audio/' : '') + type;
        return audioNode.canPlayType(type);
    }

});
});
