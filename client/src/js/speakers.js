// $(document).ready(function() {
//     $.widget( "custom.speaker", {
//         // default options
//         options: {
//             size: 100,
//             fontSize: 5,
//             state: 1,
//             rotate: 0,
//             // callbacks
//             change: null
//         },
//
//         // the constructor
//         _create: function() {
//             this.element
//             // add a class for theming
//             .addClass( "speaker" )
//             // prevent double click to select text
//             .disableSelection();
//
//             this.changer = $("<button>")
//             .appendTo(this.element)
//             .addClass("btn")
//             .css("width", this.options.size + "px")
//             .css("height", this.options.size + "px");
//
//             this.span = $('<span class="speaker-icon glyphicon">')
//             .css("font-size", this.options.fontSize + "em")
//             .css("transform", "rotate(" + this.options.rotate + "deg)")
//             .appendTo(this.changer);
//
//             // bind click events on the changer button to the random method
//             this._on( this.changer, {
//                 // _on won't call random when widget is disabled
//                 click: "toggle"
//             });
//             this._refresh();
//         },
//
//         // called when created, and later when changing options
//         _refresh: function() {
//             if(this.options.state === 0) {
//                 this.span.addClass("glyphicon-volume-off");
//                 this.span.removeClass("glyphicon-volume-up");
//             }
//             else {
//                 this.span.addClass("glyphicon-volume-up");
//                 this.span.removeClass("glyphicon-volume-off");
//             }
//         },
//
//         state: function(value) {
//             // No value passed, act as a getter.
//             if ( value === undefined ) {
//                 return this.options.state;
//             } else {
//                 this.options.state = value;
//                 this._refresh();
//             }
//         },
//
//         // a public method to change the color to a random value
//         // can be called directly via .colorize( "random" )
//         toggle: function( event ) {
//             if(this.options.state == 1) this.options.state = 0;
//             else this.options.state = 1;
//             this._refresh();
//             // trigger a callback/event
//             this._trigger("change", null, [this.options.state]);
//         },
//
//         // events bound via _on are removed automatically
//         // revert other modifications here
//         _destroy: function() {
//             // remove generated elements
//             this.changer.remove();
//             this.element.enableSelection();
//         },
//
//         // _setOptions is called with a hash of all options that are changing
//         // always refresh when changing options
//         _setOptions: function() {
//             // _super and _superApply handle keeping the right this-context
//             this._superApply( arguments );
//             this._refresh();
//         },
//     });
//
//     function speaker_send(id, state) {
//         socket.emit("/speakers/test", [id, state]);
//     }
//
//     // init icons
//     $("#speaker-front-l").speaker({state: 0,
//         size: 100,
//         rotate: 45,
//         change: function(e, k) { speaker_send(0, k);}
//     });
//
//     $("#speaker-front-r").speaker({state: 0,
//         size: 100,
//         rotate: 135,
//         change: function(e, k) { speaker_send(1, k); }
//     });
//
//     $("#speaker-back-l").speaker({state: 0,
//         size: 100,
//         rotate: -45,
//         change: function(e, k) { speaker_send(2, k);}
//     });
//
//     $("#speaker-back-r").speaker({state: 0,
//         size: 100,
//         rotate: -135,
//         change: function(e, k) { speaker_send(3, k);}
//     });
//
//     // update speakers
//     socket.on("/speakers/test/update", function(msg){
//         var lst = ["front-l", "front-r", "back-l", "back-r"];
//         var sel = "#speaker-" + lst[msg[0]];
//         $(sel).speaker("state", msg[1]);
//     });
//
//     function startSpeakerLoop(i) {
//         // var lst = ["front-l", "front-r", "back-l", "back-r"];
//         // var sel = "#speaker-" + lst[i % 4];
//         // // console.log(sel);
//         // $(sel).speaker("toggle");
//         // // if($(sel).speaker("state") === 1) {
//         // //     setTimeout(startSpeakerLoop, 500, i);
//         // // }
//         // // else {
//         //     setTimeout(startSpeakerLoop, 1500, i+1);
//         // // }
//     }
//
//     // Circular motion
//     $("#speaker-circular").click(function() {
//         if($(this).prop("checked"))
//         startSpeakerLoop(0);
//     });
// });
