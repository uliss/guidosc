var latency = require('../latency.js');

function run() {
    // button
    $("#getLatency").click(function() {
        latency.measure_latency_avg(function(ms) {
            $("#latencyLabel").text(ms + ' ms');
        }, 5);
    });
}


function main() {
    $(document).ready(function() {
        run();
    });
}

module.exports.main = main;
