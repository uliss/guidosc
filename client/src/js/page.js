var server = require('./server.js');
var PATH = '/guido/module/client/broadcast';

function page_handle() {
    server.on(PATH, function(msg) {
        msg = JSON.parse(msg);
        var cmd = msg[0];

        console.log(cmd);

        switch (msg[0]) {
            case 'css':
                {
                    console.log(msg);
                    if (msg.length == 4)
                        $(msg[1]).css(msg[2], msg[3]);
                    if (msg.length == 3)
                        $(msg[1]).css(JSON.parse(msg[2]));
                }
                break;
            case 'reload':
                window.location.reload();
                break;
            default:
                {
                    console.log("unknown command: " + cmd + msg);
                }
        }
    });

    // handle redirect
    server.on('/cli/redirect', function(msg) {
        console.log("redirect to: " + msg);
        window.location.href = msg;
    });

    // handle reload
    server.on('/cli/reload', function() {
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
