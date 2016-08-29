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
                    if (msg.length == 4)
                        $(msg[1]).css(msg[2], msg[3]);
                    if (msg.length == 3)
                        $(msg[1]).css(JSON.parse(msg[2]));
                }
                break;
            case 'reload':
                window.location.reload();
                break;
            case 'redirect': {
                if(msg.length != 2) {
                    console.log("redirect: invalid arguments");
                    return;
                }

                console.log("redirect to: " + msg[1]);
                window.location.href = msg[1];
            }
            break;
            case 'title': {
                if(msg.length == 2) {
                    $("#title").text(msg[1]);
                }

                if(msg.length == 3) {
                    $("#title").text(msg[1]);
                    document.title = msg[2];
                }
            }
            break;
            default:
                {
                    console.log("unknown command: " + cmd + msg);
                }
        }
    });
}

function init() {
    $(document).ready(function() {
        page_handle();
    });
}

module.exports.init = init;
