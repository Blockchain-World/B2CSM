$("#submitNIDSQ1").on("click", function () {
    nidsQ1();
});

$("#submitNIDSQ2").on("click", function () {
    nidsQ2();
});

$("#submitNIDSQ3").on("click", function () {
    nidsQ3();
});

function parseNodesInfo(callback) {
    $.getJSON('nodesInfo/nodesInfo.json', function (data) {
        callback(data);
    });
}

function hashOfArray(strArray) {
    if (strArray == null) {
        return "xxxxx";
    }
    let hash = 0;
    for (let i = 0; i < strArray.length; i++){
        for (let j = 0; j < strArray[i].length; j++){
            let character = strArray[i].charCodeAt(j);
            hash = ((hash<<5)-hash)+character;
            hash = hash & hash; // convert to 32-bit integer
        }
    }
    return hash;
}

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++){
        let character = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // convert to 32-bit integer
    }
    return hash;
}

function sendSigVerify(message, currentNodeID, signature) {
    return new Promise(function (resolve, reject) {
        let sigVerifyParam = {};
        console.log("In verify message: ", message);
        console.log("In verify node: ", currentNodeID);
        console.log("In verify sig", signature);
        sigVerifyParam["message"] = message;
        sigVerifyParam["pubkeyNodeIndex"] = currentNodeID;
        sigVerifyParam["signature"] = signature;

        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "http://10.102.2.84:8090/b2csm/sigverify",
            data: JSON.stringify(sigVerifyParam),
            dataType: 'json',
            cache: false,
            timeout: 600000,
            success: function (data) {
                console.log("==> Signature Verification: ", data);
                let json = JSON.stringify(data, null, 4);
                let JSONObject = JSON.parse(json);
                let sigVerify = JSONObject["data"];
                return resolve(sigVerify);
            },
            error: function () {
                console.log("==> Signature Verification Failed!");
                return reject("Signature verification error");
            }
        });
    });
}

// nodeParam = [containerName, nodeID]
let highlightNodeWithDelay = (nodeParam) => {
    return new Promise(function (resolve) {
        setTimeout(function () {
            console.log('start highlight node', nodeParam[1]);
            nodeParam[0].$('#' + nodeParam[1]).addClass('highlight');
        }, 1000);
        resolve('success');
    });
};

let highlightEdgeWithDelay = (edgeParam) => {
    return new Promise((resolve) => {
        setTimeout(function () {
            for(let i = 0; i < edgeParam[1].length; i++) {
                setTimeout(function () {
                    console.log('start to highlight the edges: ', edgeParam[1][i]);
                    edgeParam[0].$('#' + edgeParam[1][i]).addClass('highlight');
                }, (i + 1) * 1000);
            }
        }, 1000);
        resolve('highlight edges successful');
    });
};

String.prototype.escapeSpecialChars = function() {
    return this.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\&/g, "\\&")
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\/g, "")
        .replace(/"{/g, "{")
        .replace(/}"/g, "}")
        .replace(/\\f/g, "\\f");
};

String.prototype.escapeSpecialChars2 = function() {
    return this.replace(/\\n/g, "\\n")
        .replace(/\\'/g, "\\'")
        .replace(/\\"/g, '\\"')
        .replace(/\\r/g, "\\r")
        .replace(/\\t/g, "\\t")
        .replace(/\\b/g, "\\b")
        .replace(/\\/g, "")
        .replace(/]"/g, "]")
        .replace(/"\[/g, "[")
        .replace(/\\f/g, "\\f");
};

function sendAjaxRequestToMulNodesNIDSQ1(nidsParam, targetIP, tableName) {
    return new Promise(function (resolve, reject) {
        $('#'+ tableName + ' tr:last').after(
            '<tr style="border: 0;">' +
            '<td style="border: 0;">' + '<span>Start to query node ' + targetIP + ' ......</span><td>' +
            '</tr>');
        let resultDiv = document.getElementById('nidsResultDivQ1');
        resultDiv.scrollTop = resultDiv.scrollHeight;
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "http://" + targetIP + ":8089/b2csm/nids/query",
            data: JSON.stringify(nidsParam),
            dataType: 'json',
            cache: false,
            timeout: 600000,
            success: function (data) {
                let json = JSON.stringify(data, null, 4);
                let JSONObject = JSON.parse(json);
                console.log("JSONObject: " + json);
                let resultArray = new Array(6);
                let queryResult = JSONObject["result"];
                console.log("queryResult: " + queryResult);
                let querySignature = JSONObject["signature"];
                let queryVerifyResult = JSONObject["verifyResult"];
                let queryTxID = JSONObject["txid"];
                let returnedStatus = JSONObject["status"];
                if(returnedStatus === 40040){
                    resultArray[0] = JSONObject["error"].split('Messages:')[1].split('Was verified')[0]; // handled result
                    resultArray[1] = JSONObject["error"]; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = null;
                    resultArray[4] = null; // tx id
                    resultArray[5] = returnedStatus;
                    return resolve(resultArray);
                } else if(returnedStatus === 200){
                    if (queryResult == null || queryResult === "") {
                        resultArray[0] = ""; // handled result
                    } else{
                        resultArray[0] = queryResult.substr(0, 28) + "..."; // handled result
                    }
                    resultArray[1] = queryResult; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = queryVerifyResult;
                    resultArray[4] = queryTxID; // tx id
                    resultArray[5] = returnedStatus;
                    return resolve(resultArray);
                }
            },
            error: function () {
                return reject("No Network Connection");
            }
        });
    });
}

function sendAjaxRequestToMulNodesNIDSQ2(nidsParam, targetIP, tableName) {
    return new Promise(function (resolve, reject) {
        $('#'+ tableName + ' tr:last').after(
            '<tr style="border: 0;">' +
            '<td style="border: 0;">' + '<span>Start to query node ' + targetIP + ' ......</span><td>' +
            '</tr>');
        let resultDiv = document.getElementById('nidsResultDivQ2');
        resultDiv.scrollTop = resultDiv.scrollHeight;
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "http://" + targetIP + ":8089/b2csm/nids/query",
            data: JSON.stringify(nidsParam),
            dataType: 'json',
            cache: false,
            timeout: 600000,
            success: function (data) {
                let json = JSON.stringify(data, null, 4);
                let JSONObject = JSON.parse(json);
                console.log("JSONObject: " + json);
                let resultArray = new Array(6);
                let queryResult = JSONObject["result"];
                console.log("queryResult: " + queryResult);
                let querySignature = JSONObject["signature"];
                let queryVerifyResult = JSONObject["verifyResult"];
                let queryTxID = JSONObject["txid"];
                let returnedStatus = JSONObject["status"];
                if(returnedStatus === 40040){
                    resultArray[0] = JSONObject["error"].split('Messages:')[1].split('Was verified')[0]; // handled result
                    resultArray[1] = JSONObject["error"]; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = null;
                    resultArray[4] = null; // tx id
                    resultArray[5] = returnedStatus;
                    return resolve(resultArray);
                } else if(returnedStatus === 200){
                    if (queryResult == null || queryResult === "") {
                        resultArray[0] = ""; // handled result
                    } else{
                        resultArray[0] = queryResult.substr(0, 28) + "..."; // handled result
                    }
                    resultArray[1] = queryResult; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = queryVerifyResult;
                    resultArray[4] = queryTxID; // tx id
                    resultArray[5] = returnedStatus;
                    return resolve(resultArray);
                }
            },
            error: function () {
                return reject("No Network Connection");
            }
        });
    });
}

function sendAjaxRequestToMulNodesNIDSQ3(nidsParam, targetIP, tableName) {
    return new Promise(function (resolve, reject) {
        $('#'+ tableName + ' tr:last').after(
            '<tr style="border: 0;">' +
            '<td style="border: 0;">' + '<span>Start to query node ' + targetIP + ' ......</span><td>' +
            '</tr>');
        let resultDiv = document.getElementById('nidsResultDivQ3');
        resultDiv.scrollTop = resultDiv.scrollHeight;
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "http://" + targetIP + ":8089/b2csm/nids/query",
            data: JSON.stringify(nidsParam),
            dataType: 'json',
            cache: false,
            timeout: 600000,
            success: function (data) {
                let json = JSON.stringify(data, null, 4);
                let JSONObject = JSON.parse(json);
                console.log("JSONObject: " + json);
                let resultArray = new Array(6);
                let queryResult = JSONObject["result"];
                console.log("queryResult: " + queryResult);
                let querySignature = JSONObject["signature"];
                let queryVerifyResult = JSONObject["verifyResult"];
                let queryTxID = JSONObject["txid"];
                let returnedStatus = JSONObject["status"];
                if(returnedStatus === 40040){
                    resultArray[0] = JSONObject["error"].split('Messages:')[1].split('Was verified')[0]; // handled result
                    resultArray[1] = JSONObject["error"]; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = null;
                    resultArray[4] = null; // tx id
                    resultArray[5] = returnedStatus;
                    return resolve(resultArray);
                } else if(returnedStatus === 200){
                    if (queryResult == null || queryResult === "") {
                        resultArray[0] = ""; // handled result
                    } else{
                        resultArray[0] = queryResult.substr(0, 28) + "..."; // handled result
                    }
                    resultArray[1] = queryResult; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = queryVerifyResult;
                    resultArray[4] = queryTxID; // tx id
                    resultArray[5] = returnedStatus;
                    return resolve(resultArray);
                }
            },
            error: function () {
                return reject("No Network Connection");
            }
        });
    });
}

function getNIDSQ1FinalResult(resultArray, nidsQ1InternalIP) {
    // calculate how many available results
    let availableResult = 0;
    let availableValidSignature = 0;
    let availableSameResult = 1;
    let initialResult = resultArray[0].get("HANDLED_RESULT");
    let initialResultHash = hashOfArray(initialResult);
    for (let i = 0; i < resultArray.length; i++){
        if(resultArray[i].get("HANDLED_RESULT") != null){
            availableResult++;
        }
        if(resultArray[i].get("VERIFY_RESULT") === true){
            availableValidSignature++;
        }
        if(i !== 0){
            if(hashOfArray(resultArray[i].get("HANDLED_RESULT")) === initialResultHash){
                availableSameResult++;
            }
        }
    }

    let resultDiv = document.getElementById('nidsResultDivQ1');
    if(availableResult >= 3 && availableValidSignature >= 3 && availableSameResult >= 3){
        $("#nidsQ1Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: green;">' + initialResult + '</span>' + '<br \>' +
            'Transaction ID:' + '<span style="color: green;">' + resultArray[0].get("TRANSACTION_ID") + '</span>' +
            '</td>' + '</tr>');
        if(nidsQ1InternalIP === "192.168.60.113"){
            VisualizeNIDSQ1(nidsQ1InternalIP, initialResult);
        } else {
            $("#nidsQ1Table tr:last").after(
                '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">'+
                '<span style="color: orangered;">No animation for current node address!</span>' +
                '</td>' + '</tr>');
        }
    } else{
        $("#nidsQ1Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: red;">No available final result!</span>' + '<br \>' +
            'Reason: received ' + '<span style="color: red;">' + availableResult + '\/' + resultArray.length + '</span>' + ' result(s), ' +
            '<span style="color: red;">' + availableValidSignature + '\/' + resultArray.length + '</span>' + ' valid signature(s), ' +
            '<span style="color: red;">' + availableSameResult + '\/' + resultArray.length + '</span>' + ' same result(s).' +
            '</td>' + '</tr>');
        //VisualizeNIDSQ1(nidsQ1InternalIP, initialResult);
    }

    // automatically scroll to the bottom of the div
    resultDiv = document.getElementById('nidsResultDivQ1');
    resultDiv.scrollTop = resultDiv.scrollHeight;
}

function getNIDSQ2FinalResult(queryResult, resultArray, nidsQ2AttackSig) {
    // calculate how many available results
    let availableResult = 0;
    let availableValidSignature = 0;
    let availableSameResult = 1;
    let initialResult = resultArray[0].get("HANDLED_RESULT");
    let initialResultHash = hashOfArray(initialResult);
    for (let i = 0; i < resultArray.length; i++){
        if(resultArray[i].get("HANDLED_RESULT") != null){
            availableResult++;
        }
        if(resultArray[i].get("VERIFY_RESULT") === true){
            availableValidSignature++;
        }
        if(i !== 0){
            if(hashOfArray(resultArray[i].get("HANDLED_RESULT")) === initialResultHash){
                availableSameResult++;
            }
        }
    }
    console.log("availableResult: " + availableResult);
    let resultDiv = document.getElementById('nidsResultDivQ2');
    if(availableResult >= 3 && availableValidSignature >= 3 && availableSameResult >= 3){
        $("#nidsQ2Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: green;">' + initialResult + '</span>' + '<br \>' +
            'Transaction ID:' + '<span style="color: green;">' + resultArray[0].get("TRANSACTION_ID") + '</span>' +
            '</td>' + '</tr>');
        if(nidsQ2AttackSig === "[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP&[1:2014906:2] ET INFO .exe File requested over FTP"){
            VisualizeNIDSQ2(nidsQ2AttackSig, queryResult);
        } else {
            $("#nidsQ2Table tr:last").after(
                '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">'+
                '<span style="color: orangered;">No animation for current node address!</span>' +
                '</td>' + '</tr>');
        }
    } else {
        $("#nidsQ2Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: red;">No available final result!</span>' + '<br \>' +
            'Reason: received ' + '<span style="color: red;">' + availableResult + '\/' + resultArray.length + '</span>' + ' result(s), ' +
            '<span style="color: red;">' + availableValidSignature + '\/' + resultArray.length + '</span>' + ' valid signature(s), ' +
            '<span style="color: red;">' + availableSameResult + '\/' + resultArray.length + '</span>' + ' same result(s).' +
            '</td>' + '</tr>');
        //VisualizeNIDSQ1(nidsQ1InternalIP, initialResult);
        //VisualizeNIDSQ2(nidsQ2AttackSig, queryResult);
    }

    // automatically scroll to the bottom of the div
    resultDiv = document.getElementById('nidsResultDivQ2');
    resultDiv.scrollTop = resultDiv.scrollHeight;
}

function getNIDSQ3FinalResult(queryResult, resultArray, nidsQ3AttackerIP) {
    // calculate how many available results
    let availableResult = 0;
    let availableValidSignature = 0;
    let availableSameResult = 1;
    let initialResult = resultArray[0].get("HANDLED_RESULT");
    let initialResultHash = hashOfArray(initialResult);
    for (let i = 0; i < resultArray.length; i++){
        if(resultArray[i].get("HANDLED_RESULT") != null){
            availableResult++;
        }
        if(resultArray[i].get("VERIFY_RESULT") === true){
            availableValidSignature++;
        }
        if(i !== 0){
            if(hashOfArray(resultArray[i].get("HANDLED_RESULT")) === initialResultHash){
                availableSameResult++;
            }
        }
    }
    console.log("availableResult: " + availableResult);
    let resultDiv = document.getElementById('nidsResultDivQ3');
    if(availableResult >= 3 && availableValidSignature >= 3 && availableSameResult >= 3){
        $("#nidsQ3Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: green;">' + initialResult + '</span>' + '<br \>' +
            'Transaction ID:' + '<span style="color: green;">' + resultArray[0].get("TRANSACTION_ID") + '</span>' +
            '</td>' + '</tr>');
        if(nidsQ3AttackerIP === "192.168.10.6"){
            VisualizeNIDSQ3(nidsQ3AttackerIP, queryResult);
        } else {
            $("#nidsQ3Table tr:last").after(
                '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">'+
                '<span style="color: orangered;">No animation for current node address!</span>' +
                '</td>' + '</tr>');
        }
    } else {
        $("#nidsQ3Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: red;">No available final result!</span>' + '<br \>' +
            'Reason: received ' + '<span style="color: red;">' + availableResult + '\/' + resultArray.length + '</span>' + ' result(s), ' +
            '<span style="color: red;">' + availableValidSignature + '\/' + resultArray.length + '</span>' + ' valid signature(s), ' +
            '<span style="color: red;">' + availableSameResult + '\/' + resultArray.length + '</span>' + ' same result(s).' +
            '</td>' + '</tr>');
    }
    // automatically scroll to the bottom of the div
    resultDiv = document.getElementById('nidsResultDivQ3');
    resultDiv.scrollTop = resultDiv.scrollHeight;
}

//Q1
function nidsQ1() {
    let nidsQ1Param = {};
    nidsQ1Param["channelName"] = "b2csm-nids";
    nidsQ1Param["fcn"] = "queryCSM";
    let nidsQ1InternalIP = $("#nidsQ1InternalIP").val();
    let nidsQ1TimeIntv = $("#nidsQ1TimeInterval").val();
    let timeValid = nidsQ1TimeIntv.match(/\d{1,3}[-]\d{1,3}/g);
    if(timeValid == null) {
        alert("Time interval is invalid!");
        return;
    }
    let nidsQ1TimeIntvS = parseInt(nidsQ1TimeIntv.split("-")[0]);
    let nidsQ1TimeIntvE = parseInt(nidsQ1TimeIntv.split("-")[1]);
    if(nidsQ1TimeIntvS > nidsQ1TimeIntvE){
        alert("Time interval is invalid!");
        return;
    }
    let nidsQ1Array = new Array(4);
    nidsQ1Array[0] = "A1";
    nidsQ1Array[1] = nidsQ1InternalIP;
    nidsQ1Array[2] = nidsQ1TimeIntvS;
    nidsQ1Array[3] = nidsQ1TimeIntvE;
    nidsQ1Param["array"] = nidsQ1Array;

    parseNodesInfo( async function (nodesInfo) {
        let responseArray = new Array(nodesInfo.length - 1);
        let responseCounter = 0;

        for (let i = 1; i < nodesInfo.length; i++){
            let responseNodeMap = new Map();
            try{
                let tempResult = await sendAjaxRequestToMulNodesNIDSQ1(nidsQ1Param, nodesInfo[i].IP, 'nidsQ1Table');
                responseNodeMap.set("NODE_IP", nodesInfo[i].IP);
                responseNodeMap.set("PUBLIC_KEY", nodesInfo[i].pubKeyJWK);
                responseNodeMap.set("HANDLED_RESULT", tempResult[0]);
                responseNodeMap.set("ORIGINAL_RESULT", tempResult[1]);
                responseNodeMap.set("SIGNATURE", tempResult[2]);
                let sigVerifyResult = await sendSigVerify(hashString(tempResult[1]), nodesInfo[i].ID, tempResult[2]);
                if (sigVerifyResult === true){
                    responseNodeMap.set("VERIFY_RESULT", true);
                    console.log("sig verify successful!!!");
                } else {
                    responseNodeMap.set("VERIFY_RESULT", false);
                }
                //responseNodeMap.set("VERIFY_RESULT", tempResult[3]);
                responseNodeMap.set("TRANSACTION_ID", tempResult[4]);
                //responseNodeMap.set("QUERY_STATUS", "OK");
                if(tempResult[5] === 200){
                    // returns error
                    responseNodeMap.set("QUERY_STATUS", "OK");
                } else if (tempResult[5] === 40040) {
                    responseNodeMap.set("QUERY_STATUS", "No available result");
                } else {
                    responseNodeMap.set("QUERY_STATUS", "No response");
                }
                responseArray[responseCounter++] = responseNodeMap;
                console.log("tempResult " + i + "-th: " + tempResult);
            }catch (err) {
                responseNodeMap.set("NODE_IP", nodesInfo[i].IP);
                responseNodeMap.set("PUBLIC_KEY", nodesInfo[i].pubKeyJWK);
                responseNodeMap.set("HANDLED_RESULT", null);
                responseNodeMap.set("ORIGINAL_RESULT", null);
                responseNodeMap.set("SIGNATURE", null);
                responseNodeMap.set("VERIFY_RESULT", null);
                responseNodeMap.set("TRANSACTION_ID", null);
                responseNodeMap.set("QUERY_STATUS", err);
                responseArray[responseCounter++] = responseNodeMap;
            }
        }

        // start to show query result on page
        console.log("start to show query result on page");
        for (let i = 0; i < responseArray.length; i++){
            let queryStatus = "";
            let sigVerify = "";
            setTimeout(function () {
                if (responseArray[i].get("QUERY_STATUS") === "OK"){
                    queryStatus = '<span style="color: green">OK</span>';
                }else {
                    queryStatus = '<span style="color: red">FAIL (' + responseArray[i].get("QUERY_STATUS") + ')</span>';
                }

                if(responseArray[i].get("VERIFY_RESULT") === true){
                    sigVerify = '<span style="color: green">True</span>';
                } else if (responseArray[i].get("VERIFY_RESULT") === false) {
                    sigVerify = '<span style="color: blue">False (The query result is modified!)</span>';
                } else {
                    sigVerify = '<span style="color: blue">No network connection!</span>';
                }

                $("#nidsQ1Table tr:last").after(
                    '<tr style="border: 0;">' + '<td style="border: 0;">' +
                    'Node: ' + responseArray[i].get("NODE_IP") + '<br \>' +
                    'Status: ' + queryStatus + '<br \>' +
                    'Sig Verification: ' + sigVerify + '<br \>' +
                    'Result: ' + responseArray[i].get("HANDLED_RESULT") +
                    '</td>' + '</tr>');
                // automatically scroll to the bottom of the div
                let resultDiv = document.getElementById('nidsResultDivQ1');
                resultDiv.scrollTop = resultDiv.scrollHeight;
            },  (i+1)*500);
        }

        setTimeout(function () {
            getNIDSQ1FinalResult(responseArray, nidsQ1InternalIP);
        }, responseArray.length*500);

    });
}

function VisualizeNIDSQ1(nidsQ1InternalIP, result) {
    if(result === "" || nidsQ1InternalIP !== "192.168.60.113"){
        console.log("no available result");
    }else {
        console.log("else....");
        let victimIP = "192.168.60.113";
        let Results = {
            //"result":"{\"192.168.60.33\":{\"192.168.60.113\":[\"[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\"]},\"192.168.60.34\":{\"192.168.60.113\":[\"[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\"]}}",
            "result":"{\"192.168.10.40\":{\"192.168.60.100\":[\"[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\"]," +
                "\"192.168.60.101\":[\"[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\"]}," +
                "\"192.168.10.5\":{\"192.168.60.6\":[\"[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] " +
                "ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS " +
                "Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] " +
                "ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS " +
                "Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] " +
                "ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS " +
                "Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] " +
                "ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS " +
                "Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] " +
                "ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS " +
                "Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS " +
                "Query to *.dyndns. Domain\"]}," +
                "\"192.168.10.6\":{\"192.168.60.6\":[\"[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] " +
                "ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS " +
                "Query to *.dyndns. Domain\"]}," +
                "\"192.168.110.2\":{\"192.168.60.100\":[\"[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET " +
                "INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\"]}," +
                "\"192.168.40.221\":{\"192.168.60.101\":[\"[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\"]}," +
                "\"192.168.60.100\":{\"192.168.60.34\":[\"[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET " +
                "POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM " +
                "User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman " +
                "Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET " +
                "POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM " +
                "User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - " +
                "Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible " +
                "Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User " +
                "Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - " +
                "Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible " +
                "Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET " +
                "POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM " +
                "User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access " +
                "- Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - " +
                "Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User " +
                "Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - " +
                "Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible " +
                "Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM " +
                "wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - " +
                "Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - " +
                "Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM " +
                "wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY " +
                "WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User " +
                "Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - " +
                "Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible " +
                "Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] " +
                "ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET " +
                "POLICY WinRM wsman Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM " +
                "User Agent Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman " +
                "Access - Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent " +
                "Detected - Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - " +
                "Possible Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - " +
                "Possible Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible " +
                "Lateral Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible " +
                "Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible " +
                "Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible " +
                "Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible " +
                "Lateral Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\"]}," +
                "\"192.168.60.101\":{\"192.168.60.34\":[\"[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\"]}," +
                "\"192.168.60.33\":{\"192.168.60.113\":[\"[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\"]}," +
                "\"192.168.60.34\":{\"192.168.60.113\":[\"[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral Movement\"]}," +
                "\"192.168.60.6\":{\"192.168.60.33\":[\"[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET " +
                "INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query " +
                "to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] " +
                "ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query " +
                "to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] " +
                "ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\"]}," +
                "\"192.168.70.102\":{\"192.168.60.100\":[\"[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over " +
                "FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] ET INFO .exe " +
                "File requested over FTP\&[1:2014906:2] ET INFO .exe File requested over FTP\&[1:2014906:2] " +
                "ET INFO .exe File requested over FTP\"]}}",
            "txid": "8749ba13526ebee5396ed46141006a69367cc6f3e1f2da4db500ec7e33b88bab",
            "status": 200
        };
        $("#nidscyQ1").css({"background-color":"#DDD", "height": "420px", "width": "100%",
            "left": "0px", "top": "0px", "bottom": "0px", "position": "relative"});
        let nidscyQ1;
        nidscyQ1 = cytoscape({
            container: document.getElementById('nidscyQ1'),
            elements: fetch("stylesheets/case2.cyjs").then(res => res.json()).then(json => json.elements),
            style: fetch("stylesheets/styles.json").then(res => res.json()).then(json => json.style),
            layout: {
                name: 'preset',
                positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
                zoom: 0.8, // the zoom level to set (prob want fit = false if set)
                pan: undefined, // the pan level to set (prob want fit = false if set)
                fit: true, // whether to fit to viewport
                padding: 30, // padding on fit
                animate: false, // whether to transition the node positions
                animationDuration: 500, // duration of animation in ms if enabled
                animationEasing: undefined, // easing of animation if enabled
                animateFilter: function (node, i) {
                    return true;
                }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.
                ready: undefined, // callback on layoutready
                stop: undefined, // callback on layoutstop
                transform: function (node, position) {
                    return position;
                } // transform a given node position. Useful for changing flow direction in discrete layouts
            }
        });

        let nodeParamArray = new Array(2);
        nodeParamArray[0] = nidscyQ1;
        let victimIPFormed = victimIP.split('\.').join('-');
        nodeParamArray[1] = victimIPFormed;
        Promise.resolve(nodeParamArray).then(highlightNodeWithDelay).then(function (data) {
            console.log("result: " + data);
        });

        let myJSONString = JSON.stringify(Results);
        let myEscapedJSONString = myJSONString.escapeSpecialChars();
        //console.log('victim type: ' + typeof myEscapedJSONString);
        console.log('results is: ' + myEscapedJSONString);
        let resultObject = JSON.parse(myEscapedJSONString);

        let nodeArray =[];
        let edgesArray =[] ;

        let queue = [];
        let searchedNodes = [];
        queue.unshift(victimIP);
        while (queue.length !== 0) {
            let item = queue.shift();
            console.log('item: ' + item);
            for (let key in resultObject.result) {
                if (resultObject.result.hasOwnProperty(key)) {
                    let targetIP =  resultObject.result[key];
                    console.log(key + " -> " + targetIP);
                    for (let key2 in targetIP) {
                        if(targetIP.hasOwnProperty(key2)){
                            if (key2===item){
                                let edgeID = key.split('\.').join('-') + '-i-' + key2.split('\.').join('-');
                                if(edgesArray.indexOf(edgeID) === -1) {
                                    edgesArray.push(edgeID);
                                }
                                if(searchedNodes.indexOf(key) === -1) {
                                    queue.push(key);
                                }
                            }
                        }
                    }
                }
            }
            searchedNodes.push(item)
        }
        console.log('edges is: ' + edgesArray);
        let edgeParamArray = new Array(2);
        edgeParamArray[0] = nidscyQ1;
        edgeParamArray[1] = edgesArray;
        Promise.resolve(edgeParamArray).then(highlightEdgeWithDelay).then(function (data) {
            console.log('result: ' + data);
        });
    }
}

//Q2
function nidsQ2() {
    let nidsQ2Param = {};
    nidsQ2Param["channelName"] = "b2csm-nids";
    nidsQ2Param["fcn"] = "queryCSM";
    let nidsQ2AttackSig = $("#nidsQ2AttackSignature").val();
    let nidsQ2TimeIntv = $("#nidsQ2TimeInterval").val();
    let timeValid = nidsQ2TimeIntv.match(/\d{1,3}[-]\d{1,3}/g);
    if(timeValid == null) {
        alert("Time interval is invalid!");
        return;
    }
    let nidsQ2TimeIntvS = parseInt(nidsQ2TimeIntv.split("-")[0]);
    let nidsQ2TimeIntvE = parseInt(nidsQ2TimeIntv.split("-")[1]);
    if(nidsQ2TimeIntvS > nidsQ2TimeIntvE) {
        alert("Time interval is invalid!");
        return;
    }
    let nidsQ2Array = new Array(4);
    nidsQ2Array[0] = "A2";
    nidsQ2Array[1] = nidsQ2AttackSig;
    nidsQ2Array[2] = nidsQ2TimeIntvS;
    nidsQ2Array[3] = nidsQ2TimeIntvE;
    nidsQ2Param["array"] = nidsQ2Array;

    parseNodesInfo( async function (nodesInfo) {
        let responseArray = new Array(nodesInfo.length - 1);
        let responseCounter = 0;
        let queryResult = null;
        //let currentNodeID = nodesInfo[0].CURRENT_NODE_ID;

        for (let i = 1; i < nodesInfo.length; i++){
            let responseNodeMap = new Map();
            try{
                let tempResult = await sendAjaxRequestToMulNodesNIDSQ2(nidsQ2Param, nodesInfo[i].IP, 'nidsQ2Table');
                if(i === 1){
                    queryResult = tempResult[1]; //original result
                }
                responseNodeMap.set("NODE_IP", nodesInfo[i].IP);
                responseNodeMap.set("PUBLIC_KEY", nodesInfo[i].pubKeyJWK);
                responseNodeMap.set("HANDLED_RESULT", tempResult[0]);
                responseNodeMap.set("ORIGINAL_RESULT", tempResult[1]);
                responseNodeMap.set("SIGNATURE", tempResult[2]);
                let sigVerifyResult = await sendSigVerify(hashString(tempResult[1]), nodesInfo[i].ID, tempResult[2]);
                if (sigVerifyResult === true){
                    responseNodeMap.set("VERIFY_RESULT", true);
                    console.log("sig verify successful!!!");
                } else {
                    responseNodeMap.set("VERIFY_RESULT", false);
                }
                //responseNodeMap.set("VERIFY_RESULT", tempResult[3]);
                responseNodeMap.set("TRANSACTION_ID", tempResult[4]);
                if(tempResult[5] === 200){
                    // returns error
                    responseNodeMap.set("QUERY_STATUS", "OK");
                } else if (tempResult[5] === 40040) {
                    responseNodeMap.set("QUERY_STATUS", "No available result");
                } else {
                    responseNodeMap.set("QUERY_STATUS", "No response");
                }
                responseArray[responseCounter++] = responseNodeMap;
                console.log("tempResult " + i + "-th: " + tempResult);
            }catch (err) {
                responseNodeMap.set("NODE_IP", nodesInfo[i].IP);
                responseNodeMap.set("PUBLIC_KEY", nodesInfo[i].pubKeyJWK);
                responseNodeMap.set("HANDLED_RESULT", null);
                responseNodeMap.set("ORIGINAL_RESULT", null);
                responseNodeMap.set("SIGNATURE", null);
                responseNodeMap.set("VERIFY_RESULT", null);
                responseNodeMap.set("TRANSACTION_ID", null);
                responseNodeMap.set("QUERY_STATUS", err);
                responseArray[responseCounter++] = responseNodeMap;
            }
        }

        // start to show query result on page
        console.log("start to show query result on page");
        for (let i = 0; i < responseArray.length; i++){
            let queryStatus = "";
            let sigVerify = "";
            setTimeout(function () {
                if (responseArray[i].get("QUERY_STATUS") === "OK"){
                    queryStatus = '<span style="color: green">OK</span>';
                }else {
                    queryStatus = '<span style="color: red">FAIL (' + responseArray[i].get("QUERY_STATUS") + ')</span>';
                }

                if(responseArray[i].get("VERIFY_RESULT") === true){
                    sigVerify = '<span style="color: green">True</span>';
                } else if (responseArray[i].get("VERIFY_RESULT") === false) {
                    sigVerify = '<span style="color: blue">False (The query result is modified!)</span>';
                } else {
                    sigVerify = '<span style="color: blue">No network connection!</span>';
                }

                $("#nidsQ2Table tr:last").after(
                    '<tr style="border: 0;">' + '<td style="border: 0;">' +
                    'Node: ' + responseArray[i].get("NODE_IP") + '<br \>' +
                    'Status: ' + queryStatus + '<br \>' +
                    'Sig Verification: ' + sigVerify + '<br \>' +
                    'Result: ' + responseArray[i].get("HANDLED_RESULT") +
                    '</td>' + '</tr>');
                // automatically scroll to the bottom of the div
                let resultDiv = document.getElementById('nidsResultDivQ2');
                resultDiv.scrollTop = resultDiv.scrollHeight;
            },  (i+1)*500);
        }

        setTimeout(function () {
            //getNIDSQ2FinalResult(responseArray, nidsQ2AttackSig);
            getNIDSQ2FinalResult(queryResult, responseArray, nidsQ2AttackSig);
        }, responseArray.length*500);
    });

}

function VisualizeNIDSQ2(nidsQ2AttackSig, result) {

    if (result == "" || result == null){
        console.log("No available result!");
    }else {
        let Results = {
            "result": "[\"(18, 192.168.10.40, 192.168.60.98)\",\"(18, 192.168.10.40, 192.168.60.99)\",\"(18, 192.168.10.40, 192.168.60.100)\",\"(18, 192.168.10.40, 192.168.60.101)\"]",
            "txid": "4e9f728ec66a0a6158f190b060c84ef9a8e77b944d036b45e812d884b25b17e4",
            "status": 200
        };

        $("#nidscyQ2").css({"background-color":"#DDD", "height": "420px", "width": "100%",
            "left": "0px", "top": "0px", "bottom": "0px", "position": "relative"});
        let nidscyQ2;
        nidscyQ2 = cytoscape({
            container: document.getElementById('nidscyQ2'),
            elements: fetch("stylesheets/case2.cyjs").then(res => res.json()).then(json => json.elements),
            style: fetch("stylesheets/styles.json").then(res => res.json()).then(json => json.style),
            layout: {
                name: 'preset',
                positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
                zoom: 0.8, // the zoom level to set (prob want fit = false if set)
                pan: undefined, // the pan level to set (prob want fit = false if set)
                fit: true, // whether to fit to viewport
                padding: 30, // padding on fit
                animate: false, // whether to transition the node positions
                animationDuration: 500, // duration of animation in ms if enabled
                animationEasing: undefined, // easing of animation if enabled
                animateFilter: function (node, i) {
                    return true;
                }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.
                ready: undefined, // callback on layoutready
                stop: undefined, // callback on layoutstop
                transform: function (node, position) {
                    return position;
                } // transform a given node position. Useful for changing flow direction in discrete layouts
            }
        });

        let myJSONString = JSON.stringify(Results);
        let myEscapedJSONString = myJSONString.escapeSpecialChars2();
        console.log('victim type: ' + typeof myEscapedJSONString);
        console.log('results is: ' + myEscapedJSONString);
        let resultObject = JSON.parse(myEscapedJSONString).result;
        let nodeArray =[];
        let edgesArray =[];
        for (let i = 0; i < resultObject.length; i++) {
            let splitArray  =resultObject[i].split('\,');
            let sourceIP = splitArray[1].substring(1,splitArray[2].length);
            let targetIP = splitArray[2].substring(1,splitArray[2].length-1);
            console.log('results is: ' + sourceIP);
            console.log('results is: ' + targetIP);
            let edgeID = sourceIP.split('\.').join('-') + '-i-' + targetIP.split('\.').join('-');
            if(edgesArray.indexOf(edgeID) === -1){
                edgesArray.push(edgeID);
            }
            if(nodeArray.indexOf(sourceIP) === -1){
                nodeArray.push(sourceIP);
            }
            if(nodeArray.indexOf(targetIP) === -1){
                nodeArray.push(targetIP);
            }
        }
        console.log("result: " + nodeArray);
        console.log("result: " + edgesArray);

        for (let i = 0; i < nodeArray.length; i++) {
            setTimeout(function () {
                let targetNode = nodeArray[i].split('\.').join('-');
                nidscyQ2.$('#' + targetNode).addClass('highlight');
            }, (i + 1) * 1000);
        }

        let edgesParamArray = new Array(2);
        edgesParamArray[0] = nidscyQ2;
        edgesParamArray[1] = edgesArray;
        Promise.resolve(edgesParamArray).then(highlightEdgeWithDelay).then(function (data) {
            console.log('result: ' + data);
        });
    }
}

// Q3
function nidsQ3() {
    let nidsQ3Param = {};
    nidsQ3Param["channelName"] = "b2csm-nids";
    nidsQ3Param["fcn"] = "queryCSM";
    let nidsQ3AttackerIP = $("#nidsQ3AttackerIP").val();
    let nidsQ3TimeIntv = $("#nidsQ3AttackedTimepoint").val();
    let timeValid = nidsQ3TimeIntv.match(/\d{1,3}[-]\d{1,3}/g);
    if(timeValid == null) {
        alert("Time interval is invalid!");
        return;
    }
    let nidsQ3TimeIntvS = parseInt(nidsQ3TimeIntv.split("-")[0]);
    let nidsQ3TimeIntvE = parseInt(nidsQ3TimeIntv.split("-")[1]);
    if(nidsQ3TimeIntvS > nidsQ3TimeIntvE) {
        alert("Time interval is invalid!");
        return;
    }
    let nidsQ3Array = new Array(4);
    nidsQ3Array[0] = "A3";
    nidsQ3Array[1] = nidsQ3AttackerIP;
    nidsQ3Array[2] = nidsQ3TimeIntvS;
    nidsQ3Array[3] = nidsQ3TimeIntvE;
    nidsQ3Param["array"] = nidsQ3Array;

    parseNodesInfo( async function (nodesInfo) {
        let responseArray = new Array(nodesInfo.length - 1);
        let responseCounter = 0;
        let queryResult = null;
        //let currentNodeID = nodesInfo[0].CURRENT_NODE_ID;

        for (let i = 1; i < nodesInfo.length; i++){
            let responseNodeMap = new Map();
            try{
                let tempResult = await sendAjaxRequestToMulNodesNIDSQ3(nidsQ3Param, nodesInfo[i].IP, 'nidsQ3Table');
                if(i === 1){
                    queryResult = tempResult[1];
                }
                responseNodeMap.set("NODE_IP", nodesInfo[i].IP);
                responseNodeMap.set("PUBLIC_KEY", nodesInfo[i].pubKeyJWK);
                responseNodeMap.set("HANDLED_RESULT", tempResult[0]);
                responseNodeMap.set("ORIGINAL_RESULT", tempResult[1]);
                responseNodeMap.set("SIGNATURE", tempResult[2]);
                let sigVerifyResult = await sendSigVerify(hashString(tempResult[1]), nodesInfo[i].ID, tempResult[2]);
                if (sigVerifyResult === true){
                    responseNodeMap.set("VERIFY_RESULT", true);
                    console.log("sig verify successful!!!");
                } else {
                    responseNodeMap.set("VERIFY_RESULT", false);
                }
                //responseNodeMap.set("VERIFY_RESULT", tempResult[3]);
                responseNodeMap.set("TRANSACTION_ID", tempResult[4]);
                if(tempResult[5] === 200){
                    // returns error
                    responseNodeMap.set("QUERY_STATUS", "OK");
                } else if (tempResult[5] === 40040){
                    responseNodeMap.set("QUERY_STATUS", "No available result");
                } else {
                    responseNodeMap.set("QUERY_STATUS", "No response");
                }
                responseArray[responseCounter++] = responseNodeMap;
                console.log("tempResult " + i + "-th: " + tempResult);
            }catch (err) {
                responseNodeMap.set("NODE_IP", nodesInfo[i].IP);
                responseNodeMap.set("PUBLIC_KEY", nodesInfo[i].pubKeyJWK);
                responseNodeMap.set("HANDLED_RESULT", null);
                responseNodeMap.set("ORIGINAL_RESULT", null);
                responseNodeMap.set("SIGNATURE", null);
                responseNodeMap.set("VERIFY_RESULT", null);
                responseNodeMap.set("TRANSACTION_ID", null);
                responseNodeMap.set("QUERY_STATUS", err);
                responseArray[responseCounter++] = responseNodeMap;
            }
        }

        // start to show query result on page
        console.log("start to show query result on page");
        for (let i = 0; i < responseArray.length; i++){
            let queryStatus = "";
            let sigVerify = "";
            setTimeout(function () {
                if (responseArray[i].get("QUERY_STATUS") === "OK"){
                    queryStatus = '<span style="color: green">OK</span>';
                }else {
                    queryStatus = '<span style="color: red">FAIL (' + responseArray[i].get("QUERY_STATUS") + ')</span>';
                }

                if(responseArray[i].get("VERIFY_RESULT") === true){
                    sigVerify = '<span style="color: green">True</span>';
                } else if (responseArray[i].get("VERIFY_RESULT") === false) {
                    sigVerify = '<span style="color: blue">False (The query result is modified!)</span>';
                } else {
                    sigVerify = '<span style="color: blue">No network connection!</span>';
                }

                $("#nidsQ3Table tr:last").after(
                    '<tr style="border: 0;">' + '<td style="border: 0;">' +
                    'Node: ' + responseArray[i].get("NODE_IP") + '<br \>' +
                    'Status: ' + queryStatus + '<br \>' +
                    'Sig Verification: ' + sigVerify + '<br \>' +
                    'Result: ' + responseArray[i].get("HANDLED_RESULT") +
                    '</td>' + '</tr>');
                // automatically scroll to the bottom of the div
                let resultDiv = document.getElementById('nidsResultDivQ3');
                resultDiv.scrollTop = resultDiv.scrollHeight;
            },  (i+1)*500);
        }

        setTimeout(function () {
            //getNIDSQ2FinalResult(responseArray, nidsQ2AttackSig);
            getNIDSQ3FinalResult(queryResult, responseArray, nidsQ3AttackerIP);
        }, responseArray.length*500);
    });
}

function VisualizeNIDSQ3(nidsQ3AttackerIP, result) {

    if(result == null || result === ""){
        console.log("No available result!");
    }else {
        let attackerIP = '192.168.10.6';
        let Results = {
            "result":"{\"192.168.10.6\":{\"192.168.60.6\":[\"[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\"]}," +
                "\"192.168.60.113\":{\"192.168.60.34\":[\"[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\"]}," +
                "\"192.168.60.33\":{\"192.168.60.113\":[\"[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\"]}," +
                "\"192.168.60.34\":{\"192.168.60.100\":[\"[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\"]," +
                "\"192.168.60.101\":[\"[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\&[1:2026849:2] ET POLICY WinRM wsman Access - Possible Lateral " +
                "Movement\&[1:2026850:1] ET USER_AGENTS WinRM User Agent Detected - Possible Lateral " +
                "Movement\"]}," +
                "\"192.168.60.6\":{\"192.168.60.33\":[\"[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO " +
                "DYNAMIC_DNS Query to *.dyndns. Domain\&[1:2012758:5] ET INFO DYNAMIC_DNS Query to *.dyndns. " +
                "Domain\"]}}",
            "txid": "42db65b59a34a3c860a683d377713e2525ca21b5606f81252bef73718d600b1b",
            "status": 200
        };

        $("#nidscyQ3").css({"background-color":"#DDD", "height": "420px", "width": "100%",
            "left": "0px", "top": "0px", "bottom": "0px", "position": "relative"});
        let nidscyQ3;
        nidscyQ3 = cytoscape({
            container: document.getElementById('nidscyQ3'),
            elements: fetch("stylesheets/case2.cyjs").then(res => res.json()).then(json => json.elements),
            style: fetch("stylesheets/styles.json").then(res => res.json()).then(json => json.style),
            layout: {
                name: 'preset',
                positions: undefined, // map of (node id) => (position obj); or function(node){ return somPos; }
                zoom: 0.8, // the zoom level to set (prob want fit = false if set)
                pan: undefined, // the pan level to set (prob want fit = false if set)
                fit: true, // whether to fit to viewport
                padding: 30, // padding on fit
                animate: false, // whether to transition the node positions
                animationDuration: 500, // duration of animation in ms if enabled
                animationEasing: undefined, // easing of animation if enabled
                animateFilter: function (node, i) {
                    return true;
                }, // a function that determines whether the node should be animated.  All nodes animated by default on animate enabled.
                ready: undefined, // callback on layoutready
                stop: undefined, // callback on layoutstop
                transform: function (node, position) {
                    return position;
                } // transform a given node position. Useful for changing flow direction in discrete layouts
            }
        });

        let victimIPFormed = attackerIP.split('\.').join('-');
        let nodeParamArray = new Array(2);
        nodeParamArray[0] = nidscyQ3;
        nodeParamArray[1] = victimIPFormed;
        Promise.resolve(nodeParamArray).then(highlightNodeWithDelay).then(function (data) {
            console.log("result: " + data);
        });

        let myJSONString = JSON.stringify(Results);
        let myEscapedJSONString = myJSONString.escapeSpecialChars();
        //console.log('victim type: ' + typeof myEscapedJSONString);
        console.log('results is: ' + myEscapedJSONString);
        let resultObject = JSON.parse(myEscapedJSONString);

        let edgesArray =[] ;

        let queue = [];
        let searchedNodes = [];
        queue.unshift(attackerIP);
        while (queue.length !== 0) {
            let item = queue.shift();
            console.log('item: ' + item);
            for (let key in resultObject.result) {
                if (resultObject.result.hasOwnProperty(key)) {
                    if (key===item){
                        let targetIP =  resultObject.result[key];
                        console.log(key + " -> " + targetIP);
                        for (let key2 in targetIP) {
                            if(targetIP.hasOwnProperty(key2)){
                                let edgeID = key.split('\.').join('-') + '-i-' + key2.split('\.').join('-');
                                if(edgesArray.indexOf(edgeID) === -1) {
                                    edgesArray.push(edgeID);
                                }
                                if(searchedNodes.indexOf(key2) === -1) {
                                    queue.push(key2);
                                }
                            }
                        }
                    }
                }
            }
            searchedNodes.push(item)
        }

        console.log('edges is: ' + edgesArray);

        let edgesParamArray = new Array(2);
        edgesParamArray[0] = nidscyQ3;
        edgesParamArray[1] = edgesArray;
        Promise.resolve(edgesParamArray).then(highlightEdgeWithDelay).then(function (data) {
            console.log('result: ' + data);
        });

        for (let i = 0; i < edgesArray.length; i++){
            setTimeout(function () {
                console.log('start to highlight the edges: ', edgesArray[i]);
                nidscyQ3.$('#'+edgesArray[i]).addClass('highlight');
                let targetNode = edgesArray[i].split('-i-')[1];
                console.log('start to highlight target node');
                nidscyQ3.$('#'+targetNode).addClass('highlight');
            }, (i+1)*1000);
        }
    }
}