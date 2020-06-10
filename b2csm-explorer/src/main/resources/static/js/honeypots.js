$("#submitHoneypotsQ1").on("click", function () {
    IdentifyVictims();
});

$("#submitHoneypotsQ2").on("click", function () {
    let internalIP = $("#honeypotsQ2InternalIP").val();
    let honeypotsQ2TimeIntv = $("#honeypotsQ2TimeInterval").val();
    let timeValid = honeypotsQ2TimeIntv.match(/\d{1,3}[-]\d{1,3}/g);
    if(timeValid == null) {
        alert("Time interval is invalid!");
        return;
    }
    let honeypotsQ2TimeIntvS = parseInt(honeypotsQ2TimeIntv.split("-")[0]);
    let honeypotsQ2TimeIntvE = parseInt(honeypotsQ2TimeIntv.split("-")[1]);
    if(honeypotsQ2TimeIntvS > honeypotsQ2TimeIntvE) {
        alert("Time interval is invalid");
        return;
    }
    IdentifyAttackers(internalIP, honeypotsQ2TimeIntvS, honeypotsQ2TimeIntvE);
});

$("#submitHoneypotsQ3").on("click", function () {
    IdentifyPotentialVictims();
});

function hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++){
        let character = str.charCodeAt(i);
        hash = ((hash<<5)-hash)+character;
        hash = hash & hash; // convert to 32-bit integer
    }
    return hash;
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

function parseNodesInfo(callback) {
    $.getJSON('nodesInfo/nodesInfo.json', function (data) {
        callback(data);
    });
}

function sendSigVerify(message, currentNodeID, signature) {
    return new Promise(function (resolve, reject) {
        let sigVerifyParam = {};
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

function sendAjaxRequestToMulNodesHP(honeypotsParam, targetIP, tableName) {
    return new Promise(function (resolve, reject) {
        $('#'+ tableName + ' tr:last').after(
            '<tr style="border: 0;">' +
            '<td style="border: 0;">' + '<span>Start to query node ' + targetIP + ' ......</span><td>' +
            '</tr>');
            console.log("start to request " + targetIP);
            $.ajax({
                type: "POST",
                contentType: "application/json",
                url: "http://" + targetIP + ":8089/b2csm/honeypots/query",
                data: JSON.stringify(honeypotsParam),
                dataType: 'json',
                cache: false,
                timeout: 600000,
                success: function (data) {
                    let json = JSON.stringify(data, null, 4);
                    let JSONObject = JSON.parse(json);
                    let resultArray = new Array(5);
                    let queryResult = JSONObject["result"];
                    let querySignature = JSONObject["signature"];
                    let queryVerifyResult = JSONObject["verifyResult"];
                    let queryTxID = JSONObject["txid"];
                    resultArray[0] = queryResult.match(/(\d{1,3}\.){3}\d{1,3}/g); // handled result
                    resultArray[1] = queryResult; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = queryVerifyResult;
                    resultArray[4] = queryTxID; // tx id
                    return resolve(resultArray);
                },
                error: function () {
                    return reject("Unavailable");
                }
            });
    });
}

function getQ1FinalResult(resultArray, attackerIP) {
    console.log("Start to show the final result");
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

    if(availableResult >= 3 && availableValidSignature >= 3 && availableSameResult >= 3){
        $("#honeypotsVictimsTable tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: green;">' + initialResult + '</span>' + '<br \>' +
            'Transaction ID: ' + '<span style="color: green;">' + resultArray[0].get("TRANSACTION_ID") + '</span>' +
            '</td>' + '</tr>');
        VisualizeQ1(attackerIP, initialResult);
    } else{
        $("#honeypotsVictimsTable tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: red;">No available final result!</span>' + '<br \>' +
            'Reason: received ' + '<span style="color: red;">' + availableResult + '\/' + resultArray.length + '</span>' + ' result(s), ' +
            '<span style="color: red;">' + availableValidSignature + '\/' + resultArray.length + '</span>' + ' valid signature(s), ' +
            '<span style="color: red;">' + availableSameResult + '\/' + resultArray.length + '</span>' + ' same result(s).' +
            '</td>' + '</tr>');
        VisualizeQ1(attackerIP, null);
    }

    // automatically scroll to the bottom of the div
    let resultDiv = document.getElementById('resultDivQ1');
    resultDiv.scrollTop = resultDiv.scrollHeight;
}

function getQ2FinalResult(resultArray, internalIP) {
    console.log("Start to show the final result");
    // calculate how many available results
    let availableResult = 0;
    let availableValidSignature = 0;
    let availableSameResult = 1;
    let initialResult = resultArray[0].get("HANDLED_RESULT");
    let initialResultHash = hashOfArray(resultArray[0].get("HANDLED_RESULT"));
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

    if(availableResult >= 3 && availableValidSignature >= 3 && availableSameResult >= 3){
        $("#honeypotsAttackersTable tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: green;">' + initialResult + '</span>' + '<br \>' +
            'Transaction ID: ' + '<span style="color: green;">' + resultArray[0].get("TRANSACTION_ID") + '</span>' +
            '</td>' + '</tr>');
        VisualizeQ2(internalIP, initialResult);
    } else{
        $("#honeypotsAttackersTable tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: red;">No available final result!</span>' + '<br \>' +
            'Reason: received ' + '<span style="color: red;">' + availableResult + '\/' + resultArray.length + '</span>' + ' result(s), ' +
            '<span style="color: red;">' + availableValidSignature + '\/' + resultArray.length + '</span>' + ' valid signature(s), ' +
            '<span style="color: red;">' + availableSameResult + '\/' + resultArray.length + '</span>' + ' same result(s).' +
            '</td>' + '</tr>');
        VisualizeQ2(internalIP, "");
    }

    // automatically scroll to the bottom of the div
    let resultDiv = document.getElementById('resultDivQ2');
    resultDiv.scrollTop = resultDiv.scrollHeight;

}

function getQ3FinalResult(resultArray) {
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

    if(availableResult >= 3 && availableValidSignature >= 3 && availableSameResult >= 3){
        $("#honeypotsPotentialVicTable tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: green;">' + initialResult + '</span>' + '<br \>' +
            'Transaction ID: ' + '<span style="color: green;">' + resultArray[0].get("TRANSACTION_ID") + '</span>' +
            '</td>' + '</tr>');
    } else{
        $("#honeypotsPotentialVicTable tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: red;">No available final result!</span>' + '<br \>' +
            'Reason: received ' + '<span style="color: red;">' + availableResult + '\/' + resultArray.length + '</span>' + ' result(s), ' +
            '<span style="color: red;">' + availableValidSignature + '\/' + resultArray.length + '</span>' + ' valid signature(s), ' +
            '<span style="color: red;">' + availableSameResult + '\/' + resultArray.length + '</span>' + ' same result(s).' +
            '</td>' + '</tr>');
    }

    // automatically scroll to the bottom of the div
    let resultDiv = document.getElementById('resultDivQ3');
    resultDiv.scrollTop = resultDiv.scrollHeight;
}

function IdentifyVictims() {
        let honeypotsQ1Param = {};
        honeypotsQ1Param["channelName"] = "b2csm-honeypots";
        honeypotsQ1Param["fcn"] = "queryCSM";
        let attackerIP = $("#honeypotsQ1AttackerIP").val();
        let honeypotsQ1TimeIntv = $("#honeypotsQ1TimeInterval").val();
        let timeValid = honeypotsQ1TimeIntv.match(/\d{1,3}[-]\d{1,3}/g);
        if(timeValid == null) {
            alert("Time interval is invalid!");
            return;
        }
        let honeypotsQ1TimeIntvS = parseInt(honeypotsQ1TimeIntv.split("-")[0]);
        let honeypotsQ1TimeIntvE = parseInt(honeypotsQ1TimeIntv.split("-")[1]);
        if(honeypotsQ1TimeIntvS > honeypotsQ1TimeIntvE){
            alert("Time interval is invalid!");
            return;
        }
        //console.log("Honeypots Q1 attacker IP: " + attackerIP + ", time interval start: " + honeypotsQ1TimeIntvS + ", time interval end: " + honeypotsQ1TimeIntvE);
        let honeypotsQ1Array = new Array(4);
        honeypotsQ1Array[0] = "A1";
        honeypotsQ1Array[1] = attackerIP; //"192.168.1.74"
        honeypotsQ1Array[2] = honeypotsQ1TimeIntvS;
        honeypotsQ1Array[3] = honeypotsQ1TimeIntvE;
        honeypotsQ1Param["array"] = honeypotsQ1Array;
        parseNodesInfo( async function (nodesInfo) {

            let responseArray = new Array(nodesInfo.length - 1);
            let responseCounter = 0;
            let currentNodeID = nodesInfo[0].CURRENT_NODE_ID;

            for (let i = 1; i < nodesInfo.length; i++){
                let responseNodeMap = new Map();
                try{
                    let tempResult = await sendAjaxRequestToMulNodesHP(honeypotsQ1Param, nodesInfo[i].IP, 'honeypotsVictimsTable');
                    //console.log("====> Finish request node [" + i + "]: " + Date.now());
                    responseNodeMap.set("NODE_IP", nodesInfo[i].IP);
                    responseNodeMap.set("PUBLIC_KEY", nodesInfo[i].pubKeyJWK);
                    responseNodeMap.set("HANDLED_RESULT", tempResult[0]);
                    responseNodeMap.set("ORIGINAL_RESULT", tempResult[1]);
                    // verify the signature
                    let sigVerifyResult = await sendSigVerify(hashString(tempResult[1]), nodesInfo[i].ID, tempResult[2]);
                    if (sigVerifyResult === true){
                        responseNodeMap.set("VERIFY_RESULT", true);
                    } else {
                        responseNodeMap.set("VERIFY_RESULT", false);
                    }
                    responseNodeMap.set("TRANSACTION_ID", tempResult[4]);
                    responseNodeMap.set("QUERY_STATUS", "OK");
                    responseArray[responseCounter++] = responseNodeMap;
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
            //console.log("start to show query result on page");
            for (let i = 0; i < responseArray.length; i++){
                let queryStatus = "";
                let sigVerify = "";
                setTimeout(function () {
                    if (responseArray[i].get("QUERY_STATUS") === "OK"){
                        queryStatus = '<span style="color: green">OK</span>';
                    }else {
                       // queryStatus = '<span style="color: red"> FAIL (' + responseArray[i].get("QUERY_STATUS") + ')</span>';
                        queryStatus = '<span style="color: red"> FAIL</span>';
                    }

                    if(responseArray[i].get("VERIFY_RESULT") === true){
                        sigVerify = '<span style="color: green">True</span>';
                    } else if (responseArray[i].get("VERIFY_RESULT") === false) {
                        sigVerify = '<span style="color: blue">False (The query result is modified!)</span>';
                    } else {
                        sigVerify = '<span style="color: blue">No network connection!</span>';
                    }

                    $("#honeypotsVictimsTable tr:last").after(
                        '<tr style="border: 0;">' + '<td style="border: 0;">' +
                        'Node: ' + responseArray[i].get("NODE_IP") + '<br \>' +
                        'Status: ' + queryStatus + '<br \>' +
                        'Sig Verification: ' + sigVerify + '<br \>' +
                        'Result: ' + responseArray[i].get("HANDLED_RESULT") +
                        '</td>' + '</tr>');
                    // automatically scroll to the bottom of the div
                    let resultDiv = document.getElementById('resultDivQ1');
                    resultDiv.scrollTop = resultDiv.scrollHeight;
                },  (i+1)*500);
            }

            setTimeout(function () {
                getQ1FinalResult(responseArray, attackerIP);
            }, responseArray.length*500);

        });

}

function VisualizeQ1(attackerIP, victimResults) {
    let toJson = obj => obj.json();
    let toText = obj => obj.text();

    let cy;

    let externalIPs = new Array(16);
    let internalIPs = new Array(16);
    externalIPs[0] = "192.168.1.70";
    externalIPs[1] = "192.168.1.71";
    externalIPs[2] = "192.168.1.72";
    externalIPs[3] = "192.168.1.73";
    externalIPs[4] = "192.168.1.74";
    externalIPs[5] = "192.168.1.75";
    externalIPs[6] = "192.168.1.76";
    externalIPs[7] = "192.168.1.77";
    externalIPs[8] = "192.168.1.78";
    externalIPs[9] = "192.168.1.79";
    externalIPs[10] = "192.168.1.80";
    externalIPs[11] = "192.168.1.81";
    externalIPs[12] = "192.168.1.82";
    externalIPs[13] = "192.168.1.83";
    externalIPs[14] = "192.168.1.84";
    externalIPs[15] = "192.168.1.85";

    internalIPs[0] = "192.168.1.110";
    internalIPs[1] = "192.168.1.111";
    internalIPs[2] = "192.168.1.112";
    internalIPs[3] = "192.168.1.113";
    internalIPs[4] = "192.168.1.114";
    internalIPs[5] = "192.168.1.115";
    internalIPs[6] = "192.168.1.116";
    internalIPs[7] = "192.168.1.117";
    internalIPs[8] = "192.168.1.118";
    internalIPs[9] = "192.168.1.119";
    internalIPs[10] = "192.168.1.120";
    internalIPs[11] = "192.168.1.121";
    internalIPs[12] = "192.168.1.122";
    internalIPs[13] = "192.168.1.123";
    internalIPs[14] = "192.168.1.124";
    internalIPs[15] = "192.168.1.125";

    $("#cyQ1").css({"background-color":"#DDD", "height": "400px", "width": "100%",
        "left": "0px", "top": "0px", "bottom": "0px", "position": "relative"});

    cy = cytoscape({
        container: $("#cyQ1"),
    });

    let externalIPsT = new Array(16);
    let internalIPsT = new Array(16);

    // Transfer the original data
    for (let i = 0; i < 16; i++){
        externalIPsT[i] = 'e-' + externalIPs[i].split('\.').join('-');
        internalIPsT[i] = 'i-' + internalIPs[i].split('\.').join('-');
    }

    for (let i = 0; i < 16; i++){
        cy.add([
            // add external IPs
            { data: {id: externalIPsT[i]}, position: {x:150 * (i + 2), y: 100}},
            { data: {id: internalIPsT[i]}, position: {x:150 * (i + 2), y: 500}},
        ]);
    }

    cy.add([
        { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[1], source: externalIPsT[4], target: internalIPsT[1], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[4], source: externalIPsT[4], target: internalIPsT[4], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[6], source: externalIPsT[4], target: internalIPsT[6], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[8], source: externalIPsT[4], target: internalIPsT[8], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[9], source: externalIPsT[4], target: internalIPsT[9], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[6] + '-' + internalIPsT[3], source: externalIPsT[6], target: internalIPsT[3], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[6] + '-' + internalIPsT[6], source: externalIPsT[6], target: internalIPsT[6], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[6] + '-' + internalIPsT[10], source: externalIPsT[6], target: internalIPsT[10], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[8] + '-' + internalIPsT[4], source: externalIPsT[8], target: internalIPsT[4], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[9] + '-' + internalIPsT[6], source: externalIPsT[9], target: internalIPsT[6], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[10] + '-' + internalIPsT[4], source: externalIPsT[10], target: internalIPsT[4], weight: 100}}
    ]);

    // initialize the style of all nodes
    for (let i = 0; i < 16; i++){
        cy.$('#'+externalIPsT[i]).style({
            'shape': 'hexagon',
            'background-color': 'blue',
            'label': 'e' + externalIPs[i],
            'font-size': 20,
            'text-valign': 'top',
            'text-margin-y': '-10px'
        });
        cy.$('#'+internalIPsT[i]).style({
            'shape': 'hexagon',
            'background-color': 'green',
            'label': 'i' + internalIPs[i],
            'font-size': 20,
            'text-valign': 'bottom',
            'text-margin-y': '10px'
        });
    }

    // initialize the style of all edges

    cy.style().fromJson([
        {
            selector: 'edge[weight > 90]',
            style: {
                'width': 3,
                //'label': 'data(id)',
                'line-color': "#7d6b74",
                'curve-style': 'bezier',
                'arrow-scale': 3
            }
        }
    ]).update();

    cy.zoom(0.6);

    let getDatasetFromString = name => fetch(name).then(toText);
    let getDatasetFromJson = name => fetch(name).then(toJson);
    let applyStyleSheet = stylesheet => {
        cy.style().fromString(stylesheet).update();
    };

    Promise.resolve("stylesheets/honeypotsStyle.cycss").then(getDatasetFromString).then(applyStyleSheet);

    let highlightNodeWithDelay = (nodeID) => {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                //console.log('start highlight node', nodeID);
                cy.$('#'+nodeID).addClass('highlighted start case1');
            }, 1000);
            resolve('success');
        });
    };

    let highlightEdgeWithDelay = (edgeIDs) => {
        return new Promise((resolve, reject) => {
            setTimeout(function () {
                for (let i = 0; i < edgeIDs.length; i++){
                    setTimeout(function () {
                        cy.$('#'+edgeIDs[i]).addClass('highlightedCase1');
                        let targetNode = 'i-' + edgeIDs[i].split('-i-')[1];
                        //console.log('start to highlight target node');
                        cy.$('#'+targetNode).addClass('highlighted end');
                    }, (i+1)*1000);
                }
            }, 1000);
            resolve('highlight edges successful');
        });
    };

    let attackerIPFormed = 'e-' + attackerIP.split('\.').join('-');
    Promise.resolve(attackerIPFormed).then(highlightNodeWithDelay).then(function (data) {
        console.log("result: " + data);
    });

    if(victimResults == null){
        console.log("victimResult is null!");
    }else {
        let edgesArray = new Array(victimResults.length);
        for (let i = 0; i < victimResults.length; i++){
            edgesArray[i] = attackerIPFormed + '-' + 'i-' + victimResults[i].split('\.').join('-');
        }

        Promise.resolve(edgesArray).then(highlightEdgeWithDelay).then(function (data) {
            console.log('result: ' + data);
        });
    }
}

function IdentifyAttackers(internalIP, honeypotsQ2TimeIntvS, honeypotsQ2TimeIntvE) {
    let honeypotsQ2Param = {};
    honeypotsQ2Param["channelName"] = "b2csm-honeypots";
    honeypotsQ2Param["fcn"] = "queryCSM";
    let honeypotsQ2Array = new Array(4);
    honeypotsQ2Array[0] = "A2";
    honeypotsQ2Array[1] = internalIP;
    honeypotsQ2Array[2] = honeypotsQ2TimeIntvS;
    honeypotsQ2Array[3] = honeypotsQ2TimeIntvE;
    honeypotsQ2Param["array"] = honeypotsQ2Array;

    parseNodesInfo( async function (nodesInfo) {
        let responseArray = new Array(nodesInfo.length - 1);
        let responseCounter = 0;
        let currentNodeID = nodesInfo[0].CURRENT_NODE_ID;

        for (let i = 1; i < nodesInfo.length; i++){
            let responseNodeMap = new Map();
            try{
                let tempResult = await sendAjaxRequestToMulNodesHP(honeypotsQ2Param, nodesInfo[i].IP, 'honeypotsAttackersTable');
                responseNodeMap.set("NODE_IP", nodesInfo[i].IP);
                responseNodeMap.set("PUBLIC_KEY", nodesInfo[i].pubKeyJWK);
                responseNodeMap.set("HANDLED_RESULT", tempResult[0]);
                responseNodeMap.set("ORIGINAL_RESULT", tempResult[1]);
                responseNodeMap.set("SIGNATURE", tempResult[2]);
                let sigVerifyResult = await sendSigVerify(hashString(tempResult[1]), nodesInfo[i].ID, tempResult[2]);
                if (sigVerifyResult === true){
                    responseNodeMap.set("VERIFY_RESULT", true);
                } else {
                    responseNodeMap.set("VERIFY_RESULT", false);
                }
                responseNodeMap.set("TRANSACTION_ID", tempResult[4]);
                responseNodeMap.set("QUERY_STATUS", "OK");
                responseArray[responseCounter++] = responseNodeMap;
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
        for (let i = 0; i < responseArray.length; i++){
            let queryStatus = "";
            let sigVerify = "";
            setTimeout(function () {
                if (responseArray[i].get("QUERY_STATUS") === "OK"){
                    queryStatus = '<span style="color: green">OK</span>';
                }else {
                    queryStatus = '<span style="color: red">No Response (' + responseArray[i].get("QUERY_STATUS") + ')</span>';
                }

                if(responseArray[i].get("VERIFY_RESULT") === true){
                    sigVerify = '<span style="color: green">True</span>';
                } else if (responseArray[i].get("VERIFY_RESULT") === false) {
                    sigVerify = '<span style="color: blue">False (The query result is modified!)</span>';
                } else {
                    sigVerify = '<span style="color: blue">No network connection!</span>';
                }

                $("#honeypotsAttackersTable tr:last").after(
                    '<tr style="border: 0;">' + '<td style="border: 0;">' +
                    'Node: ' + responseArray[i].get("NODE_IP") + '<br \>' +
                    'Status: ' + queryStatus + '<br \>' +
                    'Sig Verification: ' + sigVerify + '<br \>' +
                    'Result: ' + responseArray[i].get("HANDLED_RESULT") +
                    '</td>' + '</tr>');
                // automatically scroll to the bottom of the div
                let resultDiv = document.getElementById('resultDivQ2');
                resultDiv.scrollTop = resultDiv.scrollHeight;
            },  (i+1)*500);
        }

        setTimeout(function () {
            getQ2FinalResult(responseArray, internalIP);
        }, responseArray.length*500);
    });
}

function VisualizeQ2(internalIP, potentialAttackers) {
    let toText = obj => obj.text();
    let cy;
    let externalIPs = new Array(16);
    let internalIPs = new Array(16);
    externalIPs[0] = "192.168.1.70";
    externalIPs[1] = "192.168.1.71";
    externalIPs[2] = "192.168.1.72";
    externalIPs[3] = "192.168.1.73";
    externalIPs[4] = "192.168.1.74";
    externalIPs[5] = "192.168.1.75";
    externalIPs[6] = "192.168.1.76";
    externalIPs[7] = "192.168.1.77";
    externalIPs[8] = "192.168.1.78";
    externalIPs[9] = "192.168.1.79";
    externalIPs[10] = "192.168.1.80";
    externalIPs[11] = "192.168.1.81";
    externalIPs[12] = "192.168.1.82";
    externalIPs[13] = "192.168.1.83";
    externalIPs[14] = "192.168.1.84";
    externalIPs[15] = "192.168.1.85";

    internalIPs[0] = "192.168.1.110";
    internalIPs[1] = "192.168.1.111";
    internalIPs[2] = "192.168.1.112";
    internalIPs[3] = "192.168.1.113";
    internalIPs[4] = "192.168.1.114";
    internalIPs[5] = "192.168.1.115";
    internalIPs[6] = "192.168.1.116";
    internalIPs[7] = "192.168.1.117";
    internalIPs[8] = "192.168.1.118";
    internalIPs[9] = "192.168.1.119";
    internalIPs[10] = "192.168.1.120";
    internalIPs[11] = "192.168.1.121";
    internalIPs[12] = "192.168.1.122";
    internalIPs[13] = "192.168.1.123";
    internalIPs[14] = "192.168.1.124";
    internalIPs[15] = "192.168.1.125";

    $("#cyQ2").css({"background-color":"#DDD", "height": "400px", "width": "100%",
        "left": "0px", "top": "0px", "bottom": "0px", "position": "relative"});

    cy = cytoscape({
        container: $("#cyQ2"),
    });

    let externalIPsT = new Array(16);
    let internalIPsT = new Array(16);

    // Transfer the original data
    for (let i = 0; i < 16; i++){
        externalIPsT[i] = 'e-' + externalIPs[i].split('\.').join('-');
        internalIPsT[i] = 'i-' + internalIPs[i].split('\.').join('-');
    }

    for (let i = 0; i < 16; i++){
        cy.add([
            // add external IPs
            { data: {id: externalIPsT[i]}, position: {x:150 * (i + 2), y: 100}},
            { data: {id: internalIPsT[i]}, position: {x:150 * (i + 2), y: 500}},
        ]);
    }

    cy.add([
        { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[1], source: externalIPsT[4], target: internalIPsT[1], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[4], source: externalIPsT[4], target: internalIPsT[4], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[6], source: externalIPsT[4], target: internalIPsT[6], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[8], source: externalIPsT[4], target: internalIPsT[8], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[9], source: externalIPsT[4], target: internalIPsT[9], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[6] + '-' + internalIPsT[3], source: externalIPsT[6], target: internalIPsT[3], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[6] + '-' + internalIPsT[6], source: externalIPsT[6], target: internalIPsT[6], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[6] + '-' + internalIPsT[10], source: externalIPsT[6], target: internalIPsT[10], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[8] + '-' + internalIPsT[4], source: externalIPsT[8], target: internalIPsT[4], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[9] + '-' + internalIPsT[6], source: externalIPsT[9], target: internalIPsT[6], weight: 100}},
        { group: 'edges', data: {id: externalIPsT[10] + '-' + internalIPsT[4], source: externalIPsT[10], target: internalIPsT[4], weight: 100}}
    ]);

    // initialize the style of all nodes
    for (let i = 0; i < 16; i++){
        cy.$('#'+externalIPsT[i]).style({
            'shape': 'hexagon',
            'background-color': 'blue',
            'label': 'e' + externalIPs[i],
            'font-size': 20,
            'text-valign': 'top',
            'text-margin-y': '-10px'
        });
        cy.$('#'+internalIPsT[i]).style({
            'shape': 'hexagon',
            'background-color': 'green',
            'label': 'i' + internalIPs[i],
            'font-size': 20,
            'text-valign': 'bottom',
            'text-margin-y': '10px'
        });
    }

    // initialize the style of all edges

    cy.style().fromJson([
        {
            selector: 'edge[weight > 90]',
            style: {
                'width': 3,
                'line-color': "#7d6b74",
                'curve-style': 'bezier',
            }
        }
    ]).update();

    cy.zoom(0.6);

    let getDatasetFromString = name => fetch(name).then(toText);
    let getDatasetFromJson = name => fetch(name).then(toJson);
    let applyStyleSheet = stylesheet => {
        cy.style().fromString(stylesheet).update();
    };

    Promise.resolve("stylesheets/honeypotsStyle.cycss").then(getDatasetFromString).then(applyStyleSheet);

    let highlightNodeWithDelay = (nodeID) => {
        return new Promise(function (resolve, reject) {
            setTimeout(function () {
                cy.$('#'+nodeID).addClass('highlighted start case2');
            }, 1000);
            resolve('success');
        });
    };

    let highlightEdgeWithDelay = (edgeIDs) => {
        return new Promise((resolve) => {
            setTimeout(function () {
                for (let i = 0; i < edgeIDs.length; i++){
                    setTimeout(function () {
                        //console.log('start to highlight the edges: ', edgeIDs[i]);
                        cy.$('#'+edgeIDs[i]).addClass('highlightedCase2');
                        let targetNode = edgeIDs[i].split('-i-')[0];
                        //console.log('start to highlight target node');
                        cy.$('#'+targetNode).addClass('highlighted end case2');
                    }, (i+1)*1000);
                }
            }, 1000);
            resolve('highlight edges successful');
        });
    };

    let internalIPFormed = 'i-' + internalIP.split('\.').join('-');
    Promise.resolve(internalIPFormed).then(highlightNodeWithDelay).then(function (data) {
        console.log("result: " + data);
    });

    if(potentialAttackers !== ""){
        let edgesArray = new Array(potentialAttackers.length);
        for (let i = 0; i < potentialAttackers.length; i++){
            edgesArray[i] = 'e-' + potentialAttackers[i].split('\.').join('-') + '-' + internalIPFormed;
        }

        Promise.resolve(edgesArray).then(highlightEdgeWithDelay).then(function (data) {
            console.log('result: ' + data);
        });
    }
}

let getQ3Result = function (honeypotsQ3Param){
    return new Promise(function (resolve) {
        //console.log('start query Q3');
        parseNodesInfo( async function (nodesInfo) {
            let responseArray = new Array(nodesInfo.length - 1);
            let responseCounter = 0;
            let currentNodeID = nodesInfo[0].CURRENT_NODE_ID;

            for (let i = 1; i < nodesInfo.length; i++){
                let responseNodeMap = new Map();
                try{
                    let tempResult = await sendAjaxRequestToMulNodesHP(honeypotsQ3Param, nodesInfo[i].IP, 'honeypotsPotentialVicTable');
                    responseNodeMap.set("NODE_IP", nodesInfo[i].IP);
                    responseNodeMap.set("PUBLIC_KEY", nodesInfo[i].pubKeyJWK);
                    responseNodeMap.set("HANDLED_RESULT", tempResult[0]);
                    responseNodeMap.set("ORIGINAL_RESULT", tempResult[1]);
                    responseNodeMap.set("SIGNATURE", tempResult[2]);
                    let sigVerifyResult = await sendSigVerify(hashString(tempResult[1]), nodesInfo[i].ID, tempResult[2]);
                    if (sigVerifyResult === true){
                        responseNodeMap.set("VERIFY_RESULT", true);
                    } else {
                        responseNodeMap.set("VERIFY_RESULT", false);
                    }
                    responseNodeMap.set("TRANSACTION_ID", tempResult[4]);
                    responseNodeMap.set("QUERY_STATUS", "OK");
                    responseArray[responseCounter++] = responseNodeMap;
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
            //console.log("start to show query result on page");
            for (let i = 0; i < responseArray.length; i++){
                let queryStatus = "";
                let sigVerify = "";
                setTimeout(function () {
                    if (responseArray[i].get("QUERY_STATUS") === "OK"){
                        queryStatus = '<span style="color: green">OK</span>';
                    }else {
                        queryStatus = '<span style="color: red">FAIL</span>';
                    }

                    if(responseArray[i].get("VERIFY_RESULT") === true){
                        sigVerify = '<span style="color: green">True</span>';
                    } else {
                        sigVerify = '<span style="color: blue">False (The query result is modified!)</span>';
                    }

                    $("#honeypotsPotentialVicTable tr:last").after(
                        '<tr style="border: 0;">' + '<td style="border: 0;">' +
                        'Node: ' + responseArray[i].get("NODE_IP") + '<br \>' +
                        'Status: ' + queryStatus + '<br \>' +
                        'Sig Verification: ' + sigVerify + '<br \>' +
                        'Result: ' + responseArray[i].get("HANDLED_RESULT") +
                        '</td>' + '</tr>');
                    // automatically scroll to the bottom of the div
                    let resultDiv = document.getElementById('resultDivQ3');
                    resultDiv.scrollTop = resultDiv.scrollHeight;
                },  (i+1)*500);
            }

            setTimeout(function () {
                getQ3FinalResult(responseArray);
            }, responseArray.length*500);

        });
        return resolve("successful!");
    });
};

// Need to use Promise to submit each task
let getResultOfQ3Q2 = function (honeypotsQ2Param) {
    return new Promise(function (resolve) {
        //console.log('start query Q3-Q2');
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/b2csm/honeypots/query",
            data: JSON.stringify(honeypotsQ2Param),
            dataType: 'json',
            cache: false,
            timeout: 600000,
            success: function (data) {
                let json = JSON.stringify(data, null, 4);
                let JSONObject = JSON.parse(json);
                let queryResult = JSONObject["result"];
                let honeypotsResultList = queryResult.match(/(\d{1,3}\.){3}\d{1,3}/g);
                // construct the returned the array
                let Q3Q2ResultArray = {};
                Q3Q2ResultArray['startTime'] = honeypotsQ2Param["array"][2];
                Q3Q2ResultArray['endTime'] = honeypotsQ2Param["array"][3];
                Q3Q2ResultArray['Q3Q2ResultList'] = honeypotsResultList;
                if (honeypotsResultList == null){
                    return resolve(null);
                }else {
                    return resolve(Q3Q2ResultArray);
                }
            },
            error: function (e) {
                let json = e.responseText;
                console.log("Error: ", json);
            }
        });
    });
};

function sendAjaxRequest(honeypotsQ1Param) {
    return new Promise(function (resolve) {
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "/b2csm/honeypots/query",
            data: JSON.stringify(honeypotsQ1Param),
            dataType: 'json',
            cache: false,
            timeout: 600000,
            success: function (data) {
                let json = JSON.stringify(data, null, 4);
                let JSONObject = JSON.parse(json);
                let queryResult = JSONObject["result"];
                let potentialVictimsResultList = queryResult.match(/(\d{1,3}\.){3}\d{1,3}/g);
                return resolve(potentialVictimsResultList);
            },
            error: function (e) {
                let json = e.responseText;
                console.log("Error: ", json);
            }
        });
    });
}

let getResultOfQ3Q1 = function (Q3Q2ResultListArray) {
    return new Promise( async function (resolve) {
        //console.log('start Q3-Q1');
        if (Q3Q2ResultListArray == null){
            return resolve(null);
        } else {
            let attackerIPs = Q3Q2ResultListArray['Q3Q2ResultList'];
            let startTime = Q3Q2ResultListArray['startTime'];
            let endTime = Q3Q2ResultListArray['endTime'];
            let Q3Q1ResultMap = new Map();
            for (let i = 0; i < attackerIPs.length; i++){
                // Construct parameters for Q1
                let honeypotsQ1Param = {};
                honeypotsQ1Param["channelName"] = "b2csm-honeypots";
                honeypotsQ1Param["fcn"] = "queryCSM";
                let honeypotsQ1Array = new Array(4);
                honeypotsQ1Array[0] = "A1"; // (A3 = A2 + A1) // send Q1
                honeypotsQ1Array[1] = attackerIPs[i];
                honeypotsQ1Array[2] = startTime;
                honeypotsQ1Array[3] = endTime;
                honeypotsQ1Param["array"] = honeypotsQ1Array;
                let tempResult = await sendAjaxRequest(honeypotsQ1Param);
                //console.log("TempResult: " + attackerIPs[i] + " --> " + tempResult);
                Q3Q1ResultMap.set(attackerIPs[i], tempResult);
            }

            return resolve(Q3Q1ResultMap); // the keys are the result of Q3-Q2, the values are the Q3-Q1 result
        }
    });
};

// start to execute Q3 (Q2 + Q1)
function IdentifyPotentialVictims(){
    let honeypotsQ3Param = {};
    honeypotsQ3Param["channelName"] = "b2csm-honeypots";
    honeypotsQ3Param["fcn"] = "queryCSM";
    let knownVicIP = $("#honeypotsQ3KnownVicIP").val();
    let honeypotsQ3TimeIntv = $("#honeypotsQ3TimeInterval").val();
    let timeValid = honeypotsQ3TimeIntv.match(/\d{1,3}[-]\d{1,3}/g);
    if(timeValid == null) {
        alert("Time interval is invalid!");
        return;
    }
    let honeypotsQ3TimeIntvS = parseInt(honeypotsQ3TimeIntv.split("-")[0]);
    let honeypotsQ3TimeIntvE = parseInt(honeypotsQ3TimeIntv.split("-")[1]);
    let honeypotsQ3Array = new Array(4);
    honeypotsQ3Array[0] = "A3"; // (A3 = A2 + A1) // send Q2 first
    honeypotsQ3Array[1] = knownVicIP;
    honeypotsQ3Array[2] = honeypotsQ3TimeIntvS;
    honeypotsQ3Array[3] = honeypotsQ3TimeIntvE;
    honeypotsQ3Param["array"] = honeypotsQ3Array;
    if(honeypotsQ3TimeIntvS > honeypotsQ3TimeIntvE) {
        alert("Time interval is invalid!");
        return;
    }
    // Construct parameters for Q2
    let honeypotsQ2Param = {};
    honeypotsQ2Param["channelName"] = "b2csm-honeypots";
    honeypotsQ2Param["fcn"] = "queryCSM";
    let honeypotsQ2Array = new Array(4);
    honeypotsQ2Array[0] = "A2"; // (A3 = A2 + A1) // send Q2 first
    honeypotsQ2Array[1] = knownVicIP;
    honeypotsQ2Array[2] = honeypotsQ3TimeIntvS;
    honeypotsQ2Array[3] = honeypotsQ3TimeIntvE;
    honeypotsQ2Param["array"] = honeypotsQ2Array;

    Promise.resolve(honeypotsQ3Param).then(getQ3Result).then(function (data) {
        //console.log("getQ3Result: " + data);
        Promise.resolve(honeypotsQ2Param).then(getResultOfQ3Q2).then(getResultOfQ3Q1)
            .then(function (visualData) {
                ///////////// visualize Q3 /////////////
                let cy;
                let toText = obj => obj.text();
                let externalIPs = new Array(16);
                let internalIPs = new Array(16);
                externalIPs[0] = "192.168.1.70";
                externalIPs[1] = "192.168.1.71";
                externalIPs[2] = "192.168.1.72";
                externalIPs[3] = "192.168.1.73";
                externalIPs[4] = "192.168.1.74";
                externalIPs[5] = "192.168.1.75";
                externalIPs[6] = "192.168.1.76";
                externalIPs[7] = "192.168.1.77";
                externalIPs[8] = "192.168.1.78";
                externalIPs[9] = "192.168.1.79";
                externalIPs[10] = "192.168.1.80";
                externalIPs[11] = "192.168.1.81";
                externalIPs[12] = "192.168.1.82";
                externalIPs[13] = "192.168.1.83";
                externalIPs[14] = "192.168.1.84";
                externalIPs[15] = "192.168.1.85";

                internalIPs[0] = "192.168.1.110";
                internalIPs[1] = "192.168.1.111";
                internalIPs[2] = "192.168.1.112";
                internalIPs[3] = "192.168.1.113";
                internalIPs[4] = "192.168.1.114";
                internalIPs[5] = "192.168.1.115";
                internalIPs[6] = "192.168.1.116";
                internalIPs[7] = "192.168.1.117";
                internalIPs[8] = "192.168.1.118";
                internalIPs[9] = "192.168.1.119";
                internalIPs[10] = "192.168.1.120";
                internalIPs[11] = "192.168.1.121";
                internalIPs[12] = "192.168.1.122";
                internalIPs[13] = "192.168.1.123";
                internalIPs[14] = "192.168.1.124";
                internalIPs[15] = "192.168.1.125";

                $("#cyQ3").css({"background-color":"#DDD", "height": "400px", "width": "100%",
                    "left": "0px", "top": "0px", "bottom": "0px", "position": "relative"});

                cy = cytoscape({
                    container: $("#cyQ3"),
                });

                let externalIPsT = new Array(16);
                let internalIPsT = new Array(16);

                // Transfer the original data
                for (let i = 0; i < 16; i++){
                    externalIPsT[i] = 'e-' + externalIPs[i].split('\.').join('-');
                    internalIPsT[i] = 'i-' + internalIPs[i].split('\.').join('-');
                }

                for (let i = 0; i < 16; i++){
                    cy.add([
                        // add external IPs
                        { data: {id: externalIPsT[i]}, position: {x:150 * (i + 2), y: 100}},
                        { data: {id: internalIPsT[i]}, position: {x:150 * (i + 2), y: 500}},
                    ]);
                }

                cy.add([
                    { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[1], source: externalIPsT[4], target: internalIPsT[1], weight: 100}},
                    { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[4], source: externalIPsT[4], target: internalIPsT[4], weight: 100}},
                    { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[6], source: externalIPsT[4], target: internalIPsT[6], weight: 100}},
                    { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[8], source: externalIPsT[4], target: internalIPsT[8], weight: 100}},
                    { group: 'edges', data: {id: externalIPsT[4] + '-' + internalIPsT[9], source: externalIPsT[4], target: internalIPsT[9], weight: 100}},
                    { group: 'edges', data: {id: externalIPsT[6] + '-' + internalIPsT[3], source: externalIPsT[6], target: internalIPsT[3], weight: 100}},
                    { group: 'edges', data: {id: externalIPsT[6] + '-' + internalIPsT[6], source: externalIPsT[6], target: internalIPsT[6], weight: 100}},
                    { group: 'edges', data: {id: externalIPsT[6] + '-' + internalIPsT[10], source: externalIPsT[6], target: internalIPsT[10], weight: 100}},
                    { group: 'edges', data: {id: externalIPsT[8] + '-' + internalIPsT[4], source: externalIPsT[8], target: internalIPsT[4], weight: 100}},
                    { group: 'edges', data: {id: externalIPsT[9] + '-' + internalIPsT[6], source: externalIPsT[9], target: internalIPsT[6], weight: 100}},
                    { group: 'edges', data: {id: externalIPsT[10] + '-' + internalIPsT[4], source: externalIPsT[10], target: internalIPsT[4], weight: 100}}
                ]);
                // initialize the style of all nodes
                for (let i = 0; i < 16; i++){
                    cy.$('#'+externalIPsT[i]).style({
                        'shape': 'hexagon',
                        'background-color': 'blue',
                        'label': 'e' + externalIPs[i],
                        'font-size': 20,
                        'text-valign': 'top',
                        'text-margin-y': '-10px'
                    });
                    cy.$('#'+internalIPsT[i]).style({
                        'shape': 'hexagon',
                        'background-color': 'green',
                        'label': 'i' + internalIPs[i],
                        'font-size': 20,
                        'text-valign': 'bottom',
                        'text-margin-y': '10px'
                    });
                }

                // initialize the style of all edges
                cy.style().fromJson([
                    {
                        selector: 'edge[weight > 90]',
                        style: {
                            'width': 3,
                            'line-color': "#7d6b74",
                            'curve-style': 'bezier',
                        }
                    }
                ]).update();

                cy.zoom(0.6);

                let getDatasetFromString = name => fetch(name).then(toText);
                let applyStyleSheet = stylesheet => {
                    cy.style().fromString(stylesheet).update();
                };

                Promise.resolve("stylesheets/honeypotsStyle.cycss").then(getDatasetFromString).then(applyStyleSheet);

                let highlightNodeWithDelay = (nodeID) => {
                    return new Promise(function (resolve) {
                        setTimeout(function () {
                            cy.$('#'+nodeID).addClass('highlighted start case3');
                        }, 1500);
                        resolve('Q3 initial node highlighted successfully!');
                    });
                };

                let highlightEdgeWithDelay = (edgeIDs) => {
                    return new Promise((resolve) => {
                        setTimeout(function () {
                            for (let i = 0; i < edgeIDs.length; i++){
                                setTimeout(function () {
                                    cy.$('#'+edgeIDs[i]).addClass('highlighted case3 round1');
                                    let targetNode = edgeIDs[i].split('-i-')[0];
                                    cy.$('#'+targetNode).addClass('highlighted end case3 round1');
                                }, (i+1)*1000);
                            }
                        }, 1000);
                        resolve('highlight edges successful');
                    });
                };

                let highlightEdgeWithDelayRound2 = (edgeIDs) => {
                    return new Promise((resolve) => {
                        setTimeout(function () {
                            for (let i = 0; i < edgeIDs.length; i++){
                                setTimeout(function () {
                                    cy.$('#'+edgeIDs[i]).removeClass('highlighted case3 round1');
                                    cy.$('#'+edgeIDs[i]).addClass('highlighted case3 round2');
                                    let targetNode = 'i-' + edgeIDs[i].split('-i-')[1];
                                    cy.$('#'+targetNode).removeClass('highlighted end case3 round1');
                                    cy.$('#'+targetNode).addClass('highlighted end case3 round2');
                                }, (i+1)*1000);
                            }
                        }, visualData.size * 1000 + 1000);
                        resolve('round 2: highlight edges successful');
                    });
                };

                let knownVictimIPFormed = 'i-' + knownVicIP.split('\.').join('-');
                Promise.resolve(knownVictimIPFormed).then(highlightNodeWithDelay).then(function (data) {
                    console.log("result: " + data);
                });

                if(visualData == null){
                    console.log("no available results, returned!!!");
                } else {
                    let potentialAttackers = new Array(visualData.size);
                    let potentialAttackerIndex = 0;
                    for(let key of visualData.keys()){
                        potentialAttackers[potentialAttackerIndex] = key;
                        potentialAttackerIndex++;
                    }

                    if(potentialAttackers !== ""){
                        let edgesArray = new Array(potentialAttackers.length);
                        for (let i = 0; i < potentialAttackers.length; i++){
                            edgesArray[i] = 'e-' + potentialAttackers[i].split('\.').join('-') + '-' + knownVictimIPFormed;
                        }

                        Promise.resolve(edgesArray).then(highlightEdgeWithDelay).then(function (data) {
                            console.log('111 result: ' + data);
                        });
                    }
                    let allPotentialVictimNumber = 0;
                    for (let [attackerIP, VictimIPs] of visualData){
                        allPotentialVictimNumber += VictimIPs.length;
                    }
                    let allVictimEdgesArray = new Array(allPotentialVictimNumber);
                    let potentialVictimsIndex = 0;
                    for (let [attackerIP, VictimIPs] of visualData){
                        let attackerIPFormed = 'e-' + attackerIP.split('\.').join('-');
                        for (let i = 0; i< VictimIPs.length; i++){
                            allVictimEdgesArray[potentialVictimsIndex] = attackerIPFormed + '-' + 'i-' + VictimIPs[i].split('\.').join('-');
                            potentialVictimsIndex++;
                        }
                    }

                    Promise.resolve(allVictimEdgesArray).then(highlightEdgeWithDelayRound2).then(function (data) {
                        console.log('222 result: ' + data);
                    });
                }
            });// end of visualization Q3
    });
}
