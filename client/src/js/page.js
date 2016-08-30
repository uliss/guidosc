var server = require('./server.js');
var PATH = '/guido/module/client/broadcast';

function handle_css(msg) {
    if (msg.length == 4)
        $(msg[1]).css(msg[2], msg[3]);
    if (msg.length == 3)
        $(msg[1]).css(JSON.parse(msg[2]));
}

function handle_reload(msg) {
    window.location.reload();
}

function handle_redirect(msg) {
    if (msg.length != 2) {
        console.log("redirect: invalid arguments");
        return;
    }

    console.log("redirect to: " + msg[1]);
    window.location.href = msg[1];
}

function handle_title(msg) {
    if (msg.length == 2) {
        $("#title").text(msg[1]);
    }

    if (msg.length == 3) {
        $("#title").text(msg[1]);
        document.title = msg[2];
    }
}

function handle_alert(msg) {
    var type = msg[1];
    var title = msg[2];
    var text = msg[3];

    var show_error = function() {
        $('#ui_modal_error_title').text(title);
        $('#ui_modal_error_text').text(text);
        $('#ui_modal_error').modal({});
    };

    var show_ok = function() {
        $('#ui_modal_ok_title').text(title);
        $('#ui_modal_ok_text').text(text);
        $('#ui_modal_ok').modal({});
    };

    var show_info = function() {
        $('#ui_modal_info_title').text(title);
        $('#ui_modal_info_text').text(text);
        $('#ui_modal_info').modal({});
    };

    switch (type) {
        case 'error':
            show_error();
            break;
        case 'ok':
            show_ok();
            break;
        case 'info':
            show_info();
            break;
        default:
            {
                console.log('unknown alert type: ' + type);
            }
    }
}

function page_handle() {
    server.on(PATH, function(msg) {
        var cmd = msg[0];

        console.log(cmd);

        switch (msg[0]) {
            case 'css':
                handle_css(msg);
                break;
            case 'reload':
                handle_reload(msg);
                break;
            case 'redirect':
                handle_redirect(msg);
                break;
            case 'title':
                handle_title(msg);
                break;
            case 'alert':
                handle_alert(msg);
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
