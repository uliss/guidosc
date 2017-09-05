var fittext = require('fittext.js');
var server = require('../server.js');
var utils = require('../utils.js');
var cli_path = utils.cli_path;

function main() {
    $(document).ready(
        function(){
            server.on('/vmetro/bar', function(msg){
                $("#bar-number").html(msg);
            });

            server.on('/vmetro/numBeats', function(msg){
                $("#beats").empty();
                for(i = 0; i < msg; i++) {
                    $("#beats").append('<div id="beat_' + (i+1) + '">' + (i+1) + '</div> ');
                }

                $("#beats").append('<span class="stretch"></span>');
            });

            server.on('/vmetro/beat', function(msg){
                $("#beats div").removeClass("active");
                $("#beat_" + msg[0]).addClass("active");
                if(msg[1] > 0) {
                    $("#beat_" + msg[0]).effect("highlight", {}, msg[1]);
                }
            });

            server.on('/vmetro/mark', function(msg){
                $("#mark").html(msg);
            });

            server.on('/vmetro/css', function(msg){
                $(".vmetro").css(msg[0], msg[1]);
            });
        }
    );
}

module.exports.main = main;
