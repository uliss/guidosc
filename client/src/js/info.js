var socket = io();

function get_info() {
    $(".info .clients").text("...");
    socket.emit('/nodejs/info');
}

$(document).ready(function() {
    function set_poll_state(state) {
        var obj = $("#poll-info");
        if(state == 1) {
            obj.addClass("btn-info");
            obj.text("ON");
            obj.attr("value", 1);
        } else {
            obj.removeClass("btn-info");
            obj.text("OFF");
            obj.attr("value", 0);
        }
    }

    $("#poll-info").click(function(){
        if($(this).attr("value") == 1) {
            set_poll_state(0);
            socket.emit("/info/poll", 0);
        }
        else {
            set_poll_state(1);
            socket.emit("/info/poll", 1);
        }
    });

    socket.on('/info/poll/update', function(msg){
        set_poll_state(msg);
    });

    socket.on('/nodejs/info/update', function(msg){
        $(".info .clients").text(msg.clientsCount);
        $(".info .remote-address").text(msg.remoteAddress);
    });

    socket.on("/info/sc/stat/update", function(obj){
        var opts = obj.serverOptions;

        $("#running-servers").text(obj.runningServers.join());
        $("#peak-cpu").text(obj.peakCPU ? (obj.peakCPU).toFixed(2) : "");
        $("#avg-cpu").text(obj.avgCPU ? (obj.avgCPU).toFixed(2) : "");
        $("#sample-rate").text(opts.sampleRate);

        if(obj.runningServers.length > 0) {
            $("#state-icon").attr("class", "glyphicon glyphicon-volume-up");
        }
        else {
            $("#state-icon").attr("class", "glyphicon glyphicon-volume-off");
            $("#peak-cpu").text("...");
            $("#avg-cpu").text("...");
        }

        var ul = $('<ul/>');
        $("#midi-devices").html(ul);
        $.each(obj.midiDevices, function(i) {
            var li = $('<li/>').text(obj.midiDevices[i]);
            li.appendTo(ul);
        });

        var audio_ul = $('<ul/>');
        $("#audio-devices").html(audio_ul);
        $.each(obj.audioDevices, function(i) {
            var li = $('<li/>').text(obj.audioDevices[i]);
            li.appendTo(audio_ul);
        });
    });
});
