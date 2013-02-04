/*
Audia: <audio> implemented using the Web Audio API
by Matt Hackett of Lost Decade Games
*/

// ig.Audia = (function () {
ig.module(
    'plugins.audia'
)
.requires(
    'impact.impact',
    'plugins.audia-web-audio',
    'plugins.audia-audio'
)
.defines(function(){

ig.Audia = ig.Class.extend({

    delegate: null,

    audioContext: null,
    // var Audia;
    hasWebAudio: null,

    use: true,
    
    init: function() {
        // Got Web Audio API?
        this.got_audio = !!document.createElement('audio').canPlayType;
        
        if (typeof webkitAudioContext !== 'undefined') {
            // console.log('Audia::WebKitAudioContext');
            this.audioContext = new webkitAudioContext();
        }
        else if (typeof AudioContext !== 'undefined') {
            // console.log('Audia::AudioContext');
            this.audioContext = new AudioContext();
        }
        else if (!!document.createElement('audio').canPlayType) {
            // console.log('Audia::Impact');
            // Use Impacts audio stuff
            this.use = false;
            if (navigator.userAgent.match(/OS 5(_\d)+ like Mac OS X/i)) {
                ig.Sound.enabled = false;
            }
        }
        else {
            // console.log('Audia::N/A');
            ig.Sound.enabled = false;
            this.use = false;
        }

        this.hasWebAudio = Boolean(this.audioContext);
    },

    load: function(src) {
        var config = {
            preventErrors: true,
            hasWebAudio: this.hasWebAudio,
            audioContext: this.audioContext
        };

        // Which approach are we taking?…
        if (this.hasWebAudio) {
            this.delegate = new ig.AudiaWebAudio(src, config);
        } else {
            this.delegate = new ig.AudiaAudio(src, config);
        }

        return this.delegate;
    }

});
});
