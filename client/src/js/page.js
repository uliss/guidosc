var server = require('./server.js');

function page_handle() {
    // handle css
    server.on('/cli/css', function(msg){
        $(msg[0]).css(msg[1], msg[2]);
    });

    // handle redirect
    server.on('/cli/redirect', function(msg) {
        console.log("redirect to: " + msg);
        window.location.href = msg;
    });

    // handle reload
    server.on('/cli/reload', function(){
        window.location.reload();
    });

    // handle title
    server.on('/cli/title', function(msg) {
        console.log(msg);
        $("#title").text(msg);
    });
}

function init() {
    $(document).ready(function() {
        page_handle();
    });
}

module.exports.init = init;
