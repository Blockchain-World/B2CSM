$(document).ready(function () {
    var defaultChannel = "b2csm-honeypots";
    getHeight(defaultChannel);
    $("#blockChannelSelection").change(function () {
        $("#blocksTable tbody").html("");
        var currentChannelName = $("#blockChannelSelection").val();
        getHeight(currentChannelName);
    });
});

function getHeight(channelName) {
    var blockchainHeight = {};
    blockchainHeight["fcn"] = "blocksAmount";
    blockchainHeight["channelName"] = channelName;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(blockchainHeight),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            console.log("Block Height: ", JSONObject["result"]);
            $('#blockResults').html(JSONObject["result"]);
            var blockNumbers = JSONObject["result"];
            for (var i = blockNumbers - 1; i >= 0 ; i--){
                var block = getBlocks(channelName, i);
                var fillBlock = JSON.stringify(block, null, 4);
                var fillBlockJson = JSON.parse(fillBlock);
                var previousHash;
                if (fillBlockJson["previousHash"] == ""){
                    previousHash = "GENESIS BLOCK";
                }else {
                    previousHash = fillBlockJson["previousHash"];
                }
                $("#blocksTable tbody").append(
                    '<tr>' +
                    '<td> <span class="btn btn-primary btn-rounded">' + fillBlockJson["height"] +'</span></td>' +
                    '<td>' + fillBlockJson["blockHash"] + '</td>' +
                    '<td>' + fillBlockJson["envelopeCount"] + '</td>' +
                    '<td>' + previousHash + '</td>' +
                    '</tr>');
                }
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#blockResults').html("-");
        }
    });
}

function getBlocks(channelName, blockNumber) {
    var blockInfo = {};
    var blockDataJsonObj = "";
    blockInfo["fcn"] = "queryBlockByNumber";
    blockInfo["channelName"] = channelName;
    blockInfo["traceId"] = blockNumber;
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/trace",
        data: JSON.stringify(blockInfo),
        async: false,
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            var height = JSONObject["data"]["blockNumber"];
            var blockHash = JSONObject["data"]["calculateBlockHash"];
            var envelopeCount = JSONObject["data"]["envelopeCount"];
            var previousHash = JSONObject["data"]["previousHashID"];
            var blockData = {
                "height": height,
                "blockHash": blockHash,
                "envelopeCount": envelopeCount,
                "previousHash": previousHash
            };
            var blockDataJson = JSON.stringify(blockData, null, 4);
            blockDataJsonObj = JSON.parse(blockDataJson);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#blockResults').html("-");
        }
    });
    return blockDataJsonObj;
}