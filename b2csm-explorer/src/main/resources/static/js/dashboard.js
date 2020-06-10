$(document).ready(function () {
    var defaultChannel = "b2csm-honeypots";
    loadEnterprises(defaultChannel);
    loadOrderers(defaultChannel);
    loadPeers(defaultChannel);
    loadCAs(defaultChannel);
    loadChannels(defaultChannel);
    loadBlocks(defaultChannel);
    loadTransactions(defaultChannel);
    loadChaincodes(defaultChannel);
    $("#channelSelection").change(function () {
        var currentChannelName = $("#channelSelection").val();
        loadEnterprises(currentChannelName);
        loadOrderers(currentChannelName);
        loadPeers(currentChannelName);
        loadCAs(currentChannelName);
        loadChannels(currentChannelName);
        loadBlocks(currentChannelName);
        loadTransactions(currentChannelName);
        loadChaincodes(currentChannelName);
    });
});

function loadEnterprises(currentChannelName) {
    var enterprisesAmount = {};
    enterprisesAmount["channelName"] = currentChannelName;
    enterprisesAmount["fcn"] = "enterprisesAmount";
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(enterprisesAmount),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            $('#enterprisesResult').html(JSONObject["result"]);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#enterprisesResult').html("-");
        }
    });
}

function loadOrderers(currentChannelName) {
    var orderersAmount = {};
    orderersAmount["fcn"] = "orderersAmount";
    orderersAmount["channelName"] = currentChannelName;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(orderersAmount),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            //console.log("data: ", JSONObject["result"]);
            var ordererJsonObj = JSON.parse(JSONObject["result"]);
            //console.log("Orderer JSON: ", ordererJsonObj);
            var orderersSize = ordererJsonObj["orderersAmount"];
            $('#orderersResult').html(orderersSize);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#orderersResult').html("-");
        }
    });
}

function loadPeers(currentChannelName) {
    var peersAmount = {};
    peersAmount["fcn"] = "peersAmount";
    peersAmount["channelName"] = currentChannelName;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(peersAmount),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            var peerJsonObj = JSON.parse(JSONObject["result"]);
            var peersSize = peerJsonObj["peersAmount"];
            $('#peersResult').html(peersSize);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#peersResult').html("-");
        }
    });
}

function loadCAs(currentChannelName) {
    var casAmount = {};
    casAmount["fcn"] = "casAmount";
    casAmount["channelName"] = currentChannelName;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(casAmount),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            var caJsonObj = JSON.parse(JSONObject["result"]);
            var casSize = caJsonObj["casAmount"];
            $('#casResult').html(casSize);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#casResult').html("-");
        }
    });
}


function loadChannels(currentChannelName) {
    var channelsAmount = {};
    channelsAmount["fcn"] = "channelsAmount";
    channelsAmount["channelName"] = currentChannelName;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(channelsAmount),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            var chResult = JSON.parse(JSONObject["result"]);
            $('#channelsResult').html(chResult["channelAmount"]);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#channelsResult').html("-");
        }
    });
}

function loadBlocks(currentChannelName) {
    var blocksAmount = {};
    blocksAmount["fcn"] = "blocksAmount";
    blocksAmount["channelName"] = currentChannelName;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(blocksAmount),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            $('#blocksResult').html(JSONObject["result"]);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#blocksResult').html("-");
        }
    });
}

function loadTransactions(currentChannelName) {
    var transactionsAmount = {};
    transactionsAmount["fcn"] = "transactionsAmount";
    transactionsAmount["channelName"] = currentChannelName;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(transactionsAmount),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            $('#transactionsResult').html(JSONObject["result"]);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#transactionsResult').html("-");
        }
    });
}

function loadChaincodes(currentChannelName) {
    var chaincodesAmount = {};
    chaincodesAmount["fcn"] = "chaincodesAmount";
    chaincodesAmount["channelName"] = currentChannelName;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(chaincodesAmount),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            $('#chaincodesResult').html(JSONObject["result"]);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#chaincodesResult').html("-");
        }
    });
}