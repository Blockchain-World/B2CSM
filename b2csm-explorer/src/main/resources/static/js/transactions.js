$(document).ready(function () {
    var defaultChannel = "b2csm-honeypots";
    getAllBlocks(defaultChannel);
    $("#transactionChannelSelection").change(function () {
        $("#txTable tbody").html("");
        var currentChannelName = $("#transactionChannelSelection").val();
        getAllBlocks(currentChannelName);
    });
});

function getAllBlocks(channelName) {
    var blockchainHeight = {};
    blockchainHeight["channelName"] = channelName;
    blockchainHeight["fcn"] = "blocksAmount";
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
            console.log("Blockchain Height: ", JSONObject["result"]);
            $('#blockResults').html(JSONObject["result"]);
            var blockNumbers = JSONObject["result"];
            //var block =  getTransactionsByBlocks(blockNumbers - 1);
            //console.log("returned transactions: " + JSON.stringify(block));
            for (var i = blockNumbers - 1; i >= 0 ; i--){
                 var transactions = getTransactionsByBlocks(channelName, i);
                 console.log("returned transactions: " + JSON.stringify(transactions));
                 var fillTx= JSON.stringify(transactions, null, 4);
                 var fillTxJson = JSON.parse(fillTx);
                 //console.log("fillTxJson length: " + fillTxJson.length);
                 //console.log("fillTxJson: " + fillTxJson[0]["txId"]);
                for (var j = 0; j < fillTxJson.length; j++){
                    var txId;
                    var mspId;
                    if(fillTxJson[j]["txId"] == ""){
                        txId = "Configuration transaction. No Tx ID";
                    } else {
                        txId = fillTxJson[j]["txId"];
                    }

                    if(fillTxJson[j]["mspId"] == ""){
                        mspId = "---";
                    }else {
                        mspId = fillTxJson[j]["mspId"];
                    }

                    $("#txTable tbody").append(
                        '<tr>' +
                        '<td>' + txId +'</td>' +
                        '<td>' + mspId + '</td>' +
                        '<td>' + fillTxJson[j]["block"] + '</td>' +
                        '<td>' + fillTxJson[j]["channelId"] + '</td>' +
                        '<td>' + fillTxJson[j]["timestamp"] + '</td>' +
                        '</tr>');
                }
            }
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#blockResults').html("-");
        }
    });
}

function getTransactionsByBlocks(channelName, blockNumber) {
    var blockInfo = {};
    var transactionDataJsonObj = [];
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
            var tempJsonArray = [];
            console.log("Block [" + blockNumber + "] info: ", JSONObject["data"]);
            var transactionLength = JSONObject["data"]["envelopes"].length;
            for (var i = 0; i < transactionLength; i++){
                var transactionsData = {
                    "txId": JSONObject["data"]["envelopes"][i]["transactionId"],
                    "mspId": JSONObject["data"]["envelopes"][i]["createMSPID"],
                    "block": JSONObject["data"]["blockNumber"],
                    "channelId": JSONObject["data"]["envelopes"][i]["channelId"],
                    "timestamp": JSONObject["data"]["envelopes"][i]["timestamp"]
                };
                tempJsonArray.push(transactionsData);
            }
            var transactionDataJson = JSON.stringify(tempJsonArray, null, 4);
            transactionDataJsonObj = JSON.parse(transactionDataJson);
            //$('#enterprisesResult').html(JSONObject["result"]);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#blockResults').html("-");
        }
    });
    return transactionDataJsonObj;
}