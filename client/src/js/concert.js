$(document).ready(function() {
    socket.emit("/concert/info/get", "get");

    socket.on("/concert/info", function(msg){
        $("h2").text(msg.date + " / " + msg.place);
        $("#pieces").html("<ol/>");
    });

    socket.on("/concert/add", function(msg){
        // console.log(msg);
        var ol = $("#pieces ol");
        var li = $("<li><span class=composer>" + msg.composer + "</span> / " +
        "<span class=title>" + msg.title + "</span></li>");

        var div = $("<div>").appendTo(li);
        var b = $("<button/>")
        .addClass("btn")
        .addClass("btn-primary")
        .attr("id", msg.id)
        .text("Start").
        click(function(e){
            var msg;
            var path = "/concert/control";
            if($(this).text() == "Start") {
                $(this).text("Stop");
                $(this).addClass("btn-success");
                $(this).removeClass("btn-primary");
                msg = "start";
            }
            else {
                $(this).removeClass("btn-success");
                $(this).addClass("btn-primary");
                $(this).text("Start");
                msg = "stop";
            }

            socket.emit(path, [this.id, msg]);
        })
        .appendTo(div);

        li.appendTo(ol);
    });
});
