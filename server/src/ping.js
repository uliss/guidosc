var utils = require('./utils');
node_path = utils.node_path;
cli_path = utils.cli_path;

function ping_bind_socket(app_global, socket) {
    socket.on(node_path('/ping'), function() {
        app_global.io.emit(cli_path('/pong'));
    });
}


module.exports.bindSocket = ping_bind_socket;
