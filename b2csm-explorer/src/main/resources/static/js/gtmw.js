$("#submitGTMWQ1").on("click", function () {
    gtmwQ1();
});

$("#submitGTMWQ2").on("click", function () {
    gtmwQ2();
});

$("#submitGTMWQ3").on("click", function () {
    gtmwQ3();
});

function basicNetworkTopology(gtmwcy, containerName) {
    let applicationArray = new Array(16);
    let URLArray = new Array(16);
    applicationArray[0] = "abcdefabcdefabcdefabcdefabcde001";
    applicationArray[1] = "abcdefabcdefabcdefabcdefabcde002";
    applicationArray[2] = "abcdefabcdefabcdefabcdefabcde003";
    applicationArray[3] = "abcdefabcdefabcdefabcdefabcde004";
    applicationArray[4] = "abcdefabcdefabcdefabcdefabcde005";
    applicationArray[5] = "abcdefabcdefabcdefabcdefabcde006";
    applicationArray[6] = "abcdefabcdefabcdefabcdefabcde007";
    applicationArray[7] = "abcdefabcdefabcdefabcdefabcde008";
    applicationArray[8] = "abcdefabcdefabcdefabcdefabcde009";
    applicationArray[9] = "abcdefabcdefabcdefabcdefabcde010";
    applicationArray[10] = "abcdefabcdefabcdefabcdefabcde011";
    applicationArray[11] = "abcdefabcdefabcdefabcdefabcde012";
    applicationArray[12] = "abcdefabcdefabcdefabcdefabcde013";
    applicationArray[13] = "abcdefabcdefabcdefabcdefabcde014";
    applicationArray[14] = "abcdefabcdefabcdefabcdefabcde015";
    applicationArray[15] = "abcdefabcdefabcdefabcdefabcde016";

    URLArray[0] = "g00gle.com/";
    URLArray[1] = "test1.c0m/";
    URLArray[2] = "test2.com/abcd.bb";
    URLArray[3] = "test3.com/ddd.php?user=ttt";
    URLArray[4] = "test4.com/aaa.hh";
    URLArray[5] = "test5.com/ttt.dd";
    URLArray[6] = "test6.com/hh.html";
    URLArray[7] = "test7.com/jj.ads";
    URLArray[8] = "test8.com/gh.lkj";
    URLArray[9] = "test9.com/user.asp";
    URLArray[10] = "test10.com/text.jsp";
    URLArray[11] = "test11.com/hh.html";
    URLArray[12] = "test12.com/acfb22.ttt";
    URLArray[13] = "test13.com/aaa";
    URLArray[14] = "test14.com/adad.xml";
    URLArray[15] = "test15.com/ajk.do";

    $(containerName).css({"background-color":"#DDD", "height": "400px", "width": "100%",
        "left": "0px", "top": "0px", "bottom": "0px", "position": "relative"});

    let applicationsT = new Array(16);
    let URLsT = new Array(16);

    // Transfer the original data
    for (let i = 0; i < 16; i++){
        applicationsT[i] = applicationArray[i].trim();
        URLsT[i] = URLArray[i].split('\.').join('-').split('\/').join('-').split('\?').join('-')
            .split('\%').join('-').split('\=').join('-').split('\#').join('-')
            .split('\&').join('-').split('\+').join('-').trim();
    }

    for (let i = 0; i < 16; i++){
        gtmwcy.add([
            // add external IPs
            { data: {id: applicationsT[i]}, position: {x: 140 * (i + 3), y: 150}},
            { data: {id: URLsT[i]}, position: {x:140 * (i + 3), y: 500}},
        ]);
    }

    gtmwcy.add([
        { group: 'edges', data: {id: applicationsT[0] + '-separator-' + URLsT[0], source: applicationsT[0], target: URLsT[0], weight: 100}},
        { group: 'edges', data: {id: applicationsT[1] + '-separator-' + URLsT[1], source: applicationsT[1], target: URLsT[1], weight: 100}},
        { group: 'edges', data: {id: applicationsT[1] + '-separator-' + URLsT[2], source: applicationsT[1], target: URLsT[2], weight: 100}},
        { group: 'edges', data: {id: applicationsT[1] + '-separator-' + URLsT[3], source: applicationsT[1], target: URLsT[3], weight: 100}},
        { group: 'edges', data: {id: applicationsT[1] + '-separator-' + URLsT[4], source: applicationsT[1], target: URLsT[4], weight: 100}},
        { group: 'edges', data: {id: applicationsT[1] + '-separator-' + URLsT[5], source: applicationsT[1], target: URLsT[5], weight: 100}},
        { group: 'edges', data: {id: applicationsT[2] + '-separator-' + URLsT[0], source: applicationsT[2], target: URLsT[0], weight: 100}},
        { group: 'edges', data: {id: applicationsT[2] + '-separator-' + URLsT[3], source: applicationsT[2], target: URLsT[3], weight: 100}},
        { group: 'edges', data: {id: applicationsT[2] + '-separator-' + URLsT[10], source: applicationsT[2], target: URLsT[10], weight: 100}},
        { group: 'edges', data: {id: applicationsT[3] + '-separator-' + URLsT[1], source: applicationsT[3], target: URLsT[1], weight: 100}},
        { group: 'edges', data: {id: applicationsT[3] + '-separator-' + URLsT[2], source: applicationsT[3], target: URLsT[2], weight: 100}},
        { group: 'edges', data: {id: applicationsT[3] + '-separator-' + URLsT[3], source: applicationsT[3], target: URLsT[3], weight: 100}},
        { group: 'edges', data: {id: applicationsT[3] + '-separator-' + URLsT[4], source: applicationsT[3], target: URLsT[4], weight: 100}},
        { group: 'edges', data: {id: applicationsT[3] + '-separator-' + URLsT[5], source: applicationsT[3], target: URLsT[5], weight: 100}},
        { group: 'edges', data: {id: applicationsT[4] + '-separator-' + URLsT[6], source: applicationsT[4], target: URLsT[6], weight: 100}},
        { group: 'edges', data: {id: applicationsT[4] + '-separator-' + URLsT[7], source: applicationsT[4], target: URLsT[7], weight: 100}},
        { group: 'edges', data: {id: applicationsT[4] + '-separator-' + URLsT[8], source: applicationsT[4], target: URLsT[8], weight: 100}},
        { group: 'edges', data: {id: applicationsT[4] + '-separator-' + URLsT[9], source: applicationsT[4], target: URLsT[9], weight: 100}},
        { group: 'edges', data: {id: applicationsT[4] + '-separator-' + URLsT[10], source: applicationsT[4], target: URLsT[10], weight: 100}},
        { group: 'edges', data: {id: applicationsT[4] + '-separator-' + URLsT[11], source: applicationsT[4], target: URLsT[11], weight: 100}},
        { group: 'edges', data: {id: applicationsT[5] + '-separator-' + URLsT[0], source: applicationsT[5], target: URLsT[0], weight: 100}},
        { group: 'edges', data: {id: applicationsT[6] + '-separator-' + URLsT[0], source: applicationsT[6], target: URLsT[0], weight: 100}},
        { group: 'edges', data: {id: applicationsT[7] + '-separator-' + URLsT[12], source: applicationsT[7], target: URLsT[12], weight: 100}},
        { group: 'edges', data: {id: applicationsT[8] + '-separator-' + URLsT[13], source: applicationsT[8], target: URLsT[13], weight: 100}},
        { group: 'edges', data: {id: applicationsT[8] + '-separator-' + URLsT[14], source: applicationsT[8], target: URLsT[14], weight: 100}},
        { group: 'edges', data: {id: applicationsT[8] + '-separator-' + URLsT[15], source: applicationsT[8], target: URLsT[15], weight: 100}},
        { group: 'edges', data: {id: applicationsT[10] + '-separator-' + URLsT[0], source: applicationsT[10], target: URLsT[0], weight: 100}},
        { group: 'edges', data: {id: applicationsT[11] + '-separator-' + URLsT[0], source: applicationsT[11], target: URLsT[0], weight: 100}},
        { group: 'edges', data: {id: applicationsT[12] + '-separator-' + URLsT[0], source: applicationsT[12], target: URLsT[0], weight: 100}},
        { group: 'edges', data: {id: applicationsT[13] + '-separator-' + URLsT[0], source: applicationsT[13], target: URLsT[0], weight: 100}},
        { group: 'edges', data: {id: applicationsT[14] + '-separator-' + URLsT[0], source: applicationsT[14], target: URLsT[0], weight: 100}},
        { group: 'edges', data: {id: applicationsT[15] + '-separator-' + URLsT[6], source: applicationsT[15], target: URLsT[6], weight: 100}},
        { group: 'edges', data: {id: applicationsT[15] + '-separator-' + URLsT[7], source: applicationsT[15], target: URLsT[7], weight: 100}},
        { group: 'edges', data: {id: applicationsT[15] + '-separator-' + URLsT[8], source: applicationsT[15], target: URLsT[8], weight: 100}},
        { group: 'edges', data: {id: applicationsT[15] + '-separator-' + URLsT[9], source: applicationsT[15], target: URLsT[9], weight: 100}},
        { group: 'edges', data: {id: applicationsT[15] + '-separator-' + URLsT[10], source: applicationsT[15], target: URLsT[10], weight: 100}},
        { group: 'edges', data: {id: applicationsT[15] + '-separator-' + URLsT[11], source: applicationsT[15], target: URLsT[11], weight: 100}},
    ]);

    // initialize the style of all nodes
    for (let i = 0; i < 16; i++){
        gtmwcy.$('#'+applicationsT[i]).style({
            'shape': 'hexagon',
            'background-color': 'blue',
            'label': applicationsT[i].substr(0,10),
            'font-size': 20,
            'text-valign': 'top',
            'text-margin-y': '-10px'
        });
        gtmwcy.$('#'+URLsT[i]).style({
            'shape': 'hexagon',
            'background-color': 'green',
            'label': URLArray[i].substr(0,12),
            'font-size': 20,
            'text-valign': 'bottom',
            'text-margin-y': '10px'
        });
    }
    // initialize the style of all edges
    gtmwcy.style().fromJson([
        {
            selector: 'edge[weight > 90]',
            style: {
                'width': 2,
                'line-color': "#7d6b74",
                'curve-style': 'bezier',
                'arrow-scale': 3
            }
        }
    ]).update();

    gtmwcy.zoom(0.6);
    return gtmwcy;
}

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

function sendAjaxRequestToMulNodesGTQ1(gtmwParam, targetIP, tableName) {
    return new Promise(function (resolve, reject) {
        $('#'+ tableName + ' tr:last').after(
            '<tr style="border: 0;">' +
            '<td style="border: 0;">' + '<span>Start to query node ' + targetIP + ' ......</span><td>' +
            '</tr>');
        let resultDiv = document.getElementById('GTMWResultDivQ1');
        resultDiv.scrollTop = resultDiv.scrollHeight;
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "http://" + targetIP + ":8089/b2csm/gtmw/query",
            data: JSON.stringify(gtmwParam),
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
                if( returnedStatus === 40040){
                    resultArray[0] = JSONObject["error"].split('Messages:')[1].split('Was verified')[0]; // handled result
                    resultArray[1] = JSONObject["error"]; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = null;
                    resultArray[4] = null; // tx id
                    resultArray[5] = returnedStatus;
                    return resolve(resultArray);
                } else if(returnedStatus === 200 && queryResult.split('\#')[1].split('\$')[0] == null){
                    resultArray[0] = null; // handled result
                    resultArray[1] = queryResult; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = null;
                    resultArray[4] = null; // tx id
                    resultArray[5] = returnedStatus;
                    return resolve(resultArray);
                } else{
                    // get the handled result
                    let tableResult = queryResult.split('\#')[1].split('\$')[0];
                    // get table results
                    let tableResultFormed = tableResult.split('\,');
                    let tableResultArray = new Array(tableResultFormed.length - 2);
                    for (let i = 0, j = 0; i < tableResultArray.length, j < tableResultArray.length; i++){
                        if(tableResultFormed[i] == '\"'){
                            continue;
                        }
                        tableResultArray[j] = tableResultFormed[i].replace('\"',"")
                            .replace('\[',"").replace('\]',"").replace('\"',"");
                        console.log(j + "-th tableResultArray: " + tableResultArray[j]);
                        j++;
                    }
                    resultArray[0] = tableResultArray; // handled result
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
function sendAjaxRequestToMulNodesGTQ2(gtmwParam, targetIP, tableName) {
    return new Promise(function (resolve, reject) {
        $('#'+ tableName + ' tr:last').after(
            '<tr style="border: 0;">' +
            '<td style="border: 0;">' + '<span>Start to query node ' + targetIP + ' ......</span><td>' +
            '</tr>');
        let resultDiv = document.getElementById('GTMWResultDivQ2');
        resultDiv.scrollTop = resultDiv.scrollHeight;
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "http://" + targetIP + ":8089/b2csm/gtmw/query",
            data: JSON.stringify(gtmwParam),
            dataType: 'json',
            cache: false,
            timeout: 600000,
            success: function (data) {
                let json = JSON.stringify(data, null, 4);
                let JSONObject = JSON.parse(json);
                console.log("JSONObject: " + json);
                let resultArray = new Array(6);
                let queryResult = JSONObject["result"];
                let querySignature = JSONObject["signature"];
                let queryVerifyResult = JSONObject["verifyResult"];
                let queryTxID = JSONObject["txid"];
                let returnedStatus = JSONObject["status"];
                if( returnedStatus === 40040){
                    resultArray[0] = JSONObject["error"].split('Messages:')[1].split('Was verified')[0]; // handled result
                    resultArray[1] = JSONObject["error"]; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = null;
                    resultArray[4] = null; // tx id
                    resultArray[5] = returnedStatus; // status
                    return resolve(resultArray);
                } else if(returnedStatus === 200 && queryResult.split(",") == null){
                    resultArray[0] = null; // handled result
                    resultArray[1] = queryResult; // original result
                    resultArray[2] = null; // signature
                    resultArray[3] = null;
                    resultArray[4] = null; // tx id
                    resultArray[5] = returnedStatus;
                    return resolve(resultArray);
                } else{
                    // get the handled result
                    let tableResult = queryResult.split(",");
                    resultArray[0] = tableResult; // handled result
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
function sendAjaxRequestToMulNodesGTQ3(gtmwParam, targetIP, tableName) {
    return new Promise(function (resolve, reject) {
        $('#'+ tableName + ' tr:last').after(
            '<tr style="border: 0;">' +
            '<td style="border: 0;">' + '<span>Start to query node ' + targetIP + ' ......</span><td>' +
            '</tr>');
        let resultDiv = document.getElementById('GTMWResultDivQ3');
        resultDiv.scrollTop = resultDiv.scrollHeight;
        $.ajax({
            type: "POST",
            contentType: "application/json",
            url: "http://" + targetIP + ":8089/b2csm/gtmw/query",
            data: JSON.stringify(gtmwParam),
            dataType: 'json',
            cache: false,
            timeout: 600000,
            success: function (data) {
                let json = JSON.stringify(data, null, 4);
                let JSONObject = JSON.parse(json);
                let resultArray = new Array(6);
                let queryResult = JSONObject["result"];
                let querySignature = JSONObject["signature"];
                let queryVerifyResult = JSONObject["verifyResult"];
                let queryTxID = JSONObject["txid"];
                let returnedStatus = JSONObject["status"];
                if( returnedStatus === 40040){
                    console.log("------> 40040");
                    resultArray[0] = JSONObject["error"].split('Messages:')[1].split('Was verified')[0]; // handled result
                    resultArray[1] = JSONObject["error"]; // original result
                    resultArray[2] = querySignature; // signature
                    resultArray[3] = null;
                    resultArray[4] = null; // tx id
                    resultArray[5] = returnedStatus;
                    return resolve(resultArray);
                } else {
                    let spoofedURL = queryResult.split('\#')[0].split('\,');
                    if (spoofedURL == null){
                        resultArray[0] = null; // handled result
                        resultArray[1] = queryResult; // original result
                        resultArray[2] = querySignature; // signature
                        resultArray[3] = null;
                        resultArray[4] = null; // tx id
                        resultArray[5] = returnedStatus;
                        return resolve(resultArray);
                    }else {
                        let spoofedURLArray = new Array(spoofedURL.length - 1);
                        for(let i = 0; i < spoofedURLArray.length; i++){
                            spoofedURLArray[i] = spoofedURL[i].replace('\[',"").replace('\"', "")
                                .replace('\[', "").replace('\]',"").replace('\"',"");
                        }
                        // get table result
                        let tableResult = queryResult.split('\#')[1].split('\$')[0];
                        let tableResultArray = tableResult.match(/[a-fA-F0-9]{32}/g);
                        resultArray[0] = tableResultArray; // handled result
                        resultArray[1] = queryResult; // original result
                        resultArray[2] = querySignature; // signature
                        resultArray[3] = queryVerifyResult;
                        resultArray[4] = queryTxID; // tx id
                        resultArray[5] = returnedStatus;
                        return resolve(resultArray);
                    }
                }
            },
            error: function () {
                return reject("No Network Connection");
            }
        });
    });
}

function getGTMWQ1FinalResult(resultArray, gtmwQ1MaliciousAPP, queryResult) {
    let urlSuspiciousAPPMap = new Map();

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
        $("#gtmwQ1Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: green;">' + initialResult + '</span>' + '<br \>' +
            'Transaction ID:' + '<span style="color: green;">' + resultArray[0].get("TRANSACTION_ID") + '</span>' +
            '</td>' + '</tr>');

        let middleURLs = queryResult.split('\#')[0];
        let tableResult = queryResult.split('\#')[1].split('\$')[0];
        let visualResult = queryResult.split('\$')[1];

        // get middle APP Array
        let middleURLFormed = middleURLs.split('\,');
        let visualResultFormed = visualResult.split('\;');
        let middleURLArray = new Array(middleURLFormed.length - 1); // ," so one more

        for (let i = 0; i < middleURLArray.length; i++){
            middleURLArray[i] = middleURLFormed[i].replace('\[', "").replace('\"', "")
                .replace('\[', "").replace('\]', "").replace('\"', "");
        }

        for (let i = 0; i < middleURLArray.length; i++){
            let keyFormed = middleURLArray[i].split('\.').join('-').split('\/').join('-').split('\?').join('-')
                .split('\%').join('-').split('\=').join('-').split('\#').join('-')
                .split('\&').join('-').split('\+').join('-').split('\\u0026').join('-').trim();
            urlSuspiciousAPPMap.set(keyFormed, visualResultFormed[i].match(/[a-fA-F0-9]{32}/g));
        }

        // get table results
        let tableResultFormed = tableResult.split('\,');
        let tableResultArray = new Array(tableResultFormed.length - 2);
        for (let i = 0, j = 0; i < tableResultArray.length, j < tableResultArray.length; i++){
            if(tableResultFormed[i] == '\"'){
                continue;
            }
            tableResultArray[j] = tableResultFormed[i].replace('\"',"")
                .replace('\[',"").replace('\]',"").replace('\"',"");
            j++;
        }

        visualizeGTMWQ1(gtmwQ1MaliciousAPP, urlSuspiciousAPPMap);
    } else{
        $("#gtmwQ1Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: red;">No available final result!</span>' + '<br \>' +
            'Reason: received ' + '<span style="color: red;">' + availableResult + '\/' + resultArray.length + '</span>' + ' result(s), ' +
            '<span style="color: red;">' + availableValidSignature + '\/' + resultArray.length + '</span>' + ' valid signature(s), ' +
            '<span style="color: red;">' + availableSameResult + '\/' + resultArray.length + '</span>' + ' same result(s).' +
            '</td>' + '</tr>');

        visualizeGTMWQ1(gtmwQ1MaliciousAPP, null);
    }

    // automatically scroll to the bottom of the div
    let resultDiv = document.getElementById('GTMWResultDivQ1');
    resultDiv.scrollTop = resultDiv.scrollHeight;
}

function gtmwQ1() {
    let gtmwQ1Param = {};
    gtmwQ1Param["channelName"] = "b2csm-gtmw";
    gtmwQ1Param["fcn"] = "queryCSM";
    let gtmwQ1MaliciousAPP = $("#gtmwQ1MaliciousAPP").val();
    let gtmwQ1TimeIntv = $("#gtmwQ1TimeInterval").val();
    let timeValid = gtmwQ1TimeIntv.match(/\d{1,3}[-]\d{1,3}/g);
    if(timeValid == null) {
        alert("Time interval is invalid!");
        return;
    }
    let gtmwQ1TimeIntvS = parseInt(gtmwQ1TimeIntv.split("-")[0]);
    let gtmwQ1TimeIntvE = parseInt(gtmwQ1TimeIntv.split("-")[1]);
    if(gtmwQ1TimeIntvS > gtmwQ1TimeIntvE) {
        alert("Time interval is invalid!");
        return;
    }
    let gtmwQ1Array = new Array(4);
    gtmwQ1Array[0] = "A1";
    gtmwQ1Array[1] = gtmwQ1MaliciousAPP;
    gtmwQ1Array[2] = gtmwQ1TimeIntvS;
    gtmwQ1Array[3] = gtmwQ1TimeIntvE;
    gtmwQ1Param["array"] = gtmwQ1Array;

    parseNodesInfo( async function (nodesInfo) {
        let responseArray = new Array(nodesInfo.length - 1);
        let responseCounter = 0;
        let currentNodeID = nodesInfo[0].CURRENT_NODE_ID;
        let queryResult = null;

        for (let i = 1; i < nodesInfo.length; i++){
            let responseNodeMap = new Map();
            try{
                let tempResult = await sendAjaxRequestToMulNodesGTQ1(gtmwQ1Param, nodesInfo[i].IP, 'gtmwQ1Table');
                if(i === 1){
                    // temp: get queryResult for visualization
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
                responseNodeMap.set("TRANSACTION_ID", tempResult[4]);
                if(tempResult[5] === 200){
                    responseNodeMap.set("QUERY_STATUS", "OK");
                } else if (tempResult[5] === 40040) {
                    responseNodeMap.set("QUERY_STATUS", "No available result");
                } else {
                    responseNodeMap.set("QUERY_STATUS", "No response");
                }
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
                let resultDiv = document.getElementById('GTMWResultDivQ1');
                resultDiv.scrollTop = resultDiv.scrollHeight;
                if (responseArray[i].get("QUERY_STATUS") === "OK"){
                    queryStatus = '<span style="color: green">OK</span>';
                }else {
                    queryStatus = '<span style="color: red">FAIL (' + responseArray[i].get("QUERY_STATUS") + ')</span>';
                }

                if(responseArray[i].get("VERIFY_RESULT") === true){
                    sigVerify = '<span style="color: green">True</span>';
                } else if (responseArray[i].get("VERIFY_RESULT") === false){
                    sigVerify = '<span style="color: blue">False (The query result is modified!)</span>';
                } else {
                    sigVerify = '<span style="color: blue">No network connection!</span>';
                }

                $("#gtmwQ1Table tr:last").after(
                    '<tr style="border: 0;">' + '<td style="border: 0;">' +
                    'Node: ' + responseArray[i].get("NODE_IP") + '<br \>' +
                    'Status: ' + queryStatus + '<br \>' +
                    'Sig Verification: ' + sigVerify + '<br \>' +
                    'Result: ' + responseArray[i].get("HANDLED_RESULT") +
                    '</td>' + '</tr>');
                // automatically scroll to the bottom of the div
                resultDiv.scrollTop = resultDiv.scrollHeight;
            },  (i+1)*500);
        }

        setTimeout(function () {
            //console.log("queryResult: " + queryResult);
            getGTMWQ1FinalResult(responseArray, gtmwQ1MaliciousAPP, queryResult);
        }, responseArray.length*500);
    });
}

function visualizeGTMWQ1(gtmwQ1MaliciousAPP, middleResult) {
    let toText = obj => obj.text();
    let containerName = "#gtmwcyQ1";
    let gtmwcyQ1 = cytoscape({
        container: $(containerName),
    });

    let gtmwcy1 = basicNetworkTopology(gtmwcyQ1, containerName);
    let getDatasetFromString = name => fetch(name).then(toText);
    let applyStyleSheet = stylesheet => {
        gtmwcy1.style().fromString(stylesheet).update();
    };

    Promise.resolve("stylesheets/gtmwStyle.cycss").then(getDatasetFromString).then(applyStyleSheet);

    let highlightNodeWithDelay = (query1Param) => {
        return new Promise(function (resolve) {
            setTimeout(function () {
                gtmwcy1.$('#'+query1Param[0]).addClass('highlighted ' + query1Param[1]);
            }, 1000);
            resolve('success');
        });
    };

    let highlightEdgeWithDelayQ1R1 = (edgeParams) => {
        return new Promise((resolve) => {
            setTimeout(function () {
                for (let i = 0; i < edgeParams[0].length; i++){
                    setTimeout(function () {
                        gtmwcy1.$('#'+edgeParams[0][i]).addClass(edgeParams[1]);
                        let targetNode = edgeParams[0][i].split('-separator-')[1];
                        gtmwcy1.$('#'+targetNode).addClass(edgeParams[2]);
                    }, (i+1)*1000);
                }
            }, 1000);
            resolve('highlight edges successful');
        });
    };

    let highlightEdgeWithDelayQ1R2 = (query1Round2Param) => {
        return new Promise((resolve) => {
            setTimeout(function () {
                for (let i = 0; i < query1Round2Param[0].length; i++){
                    setTimeout(function () {
                        gtmwcy1.$('#'+query1Round2Param[0][i]).removeClass('highlighted query1 round1');
                        gtmwcy1.$('#'+query1Round2Param[0][i]).addClass(query1Round2Param[2]);
                        let targetNode = query1Round2Param[0][i].split('-separator-')[0];
                        gtmwcy1.$('#'+targetNode).addClass(query1Round2Param[3]);
                    }, (i+1)*1000);
                }
            }, (middleResult.size * 1000) + 1000);
            resolve('highlight edges successful');
        });
    };

    // drawing the initial node
    let query1Param = new Array(2);
    query1Param[0] = gtmwQ1MaliciousAPP;
    query1Param[1] = 'start query1';
    Promise.resolve(query1Param).then(highlightNodeWithDelay).then((data) => {
        console.log("Drawing the initial node");
    });
    if(middleResult == null){
        console.log("No available result!!!");
    } else {
        let infectedURLArray = new Array(middleResult.size);
        let infectedURLCounter = 0;
        for (let infectedURL of middleResult.keys()){
            infectedURLArray[infectedURLCounter] =  gtmwQ1MaliciousAPP + '-separator-' + infectedURL;
            infectedURLCounter++;
        }

        // start round1: find the middle infected URLs
        let query1Round1Param = new Array(3);
        query1Round1Param[0] = infectedURLArray; // all edge ids
        query1Round1Param[1] = 'highlighted query1 round1'; // edge style
        query1Round1Param[2] = 'highlighted end query1'; // target node style
        // start round 2: as per the URLs, find all the suspicious APPs
        let totalRound2Edges = 0;
        for (let suspiciousAPPArray of middleResult.values()){
            totalRound2Edges += suspiciousAPPArray.length;
        }
        let query1Round2Edges = new Array(totalRound2Edges);
        let queryRound2Counter = 0;
        for (let [infectedURL, suspiciousAPPArray] of middleResult){
            for (let i = 0; i < suspiciousAPPArray.length; i++){
                query1Round2Edges[queryRound2Counter] = suspiciousAPPArray[i] + '-separator-' + infectedURL;
                queryRound2Counter++;
            }
        }
        let query1Round2Param = new Array(4);
        query1Round2Param[0] = query1Round2Edges;
        query1Round2Param[1] = 'highlighted'; //start node (infected URL)
        query1Round2Param[2] = 'highlighted query1 round2'; // edge
        query1Round2Param[3] = 'highlighted end query1 round2'; // end node (suspicious APP)

        Promise.resolve(query1Param).then(highlightNodeWithDelay).then((data) => {
            Promise.resolve(query1Round1Param).then(highlightEdgeWithDelayQ1R1).then((data) => {
                Promise.resolve(query1Round2Param).then(highlightEdgeWithDelayQ1R2);
            });
        });
    }
}

function getGTMWQ2FinalResult(resultArray, gtmwQ2MaliciousURL) {
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
        $("#gtmwQ2Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: green;">' + initialResult + '</span>' + '<br \>' +
            'Transaction ID:' + '<span style="color: green;">' + resultArray[0].get("TRANSACTION_ID") + '</span>' +
            '</td>' + '</tr>');
        visualizeGTMWQ2(gtmwQ2MaliciousURL, initialResult);
    } else{
        $("#gtmwQ2Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: red;">No available final result!</span>' + '<br \>' +
            'Reason: received ' + '<span style="color: red;">' + availableResult + '\/' + resultArray.length + '</span>' + ' result(s), ' +
            '<span style="color: red;">' + availableValidSignature + '\/' + resultArray.length + '</span>' + ' valid signature(s), ' +
            '<span style="color: red;">' + availableSameResult + '\/' + resultArray.length + '</span>' + ' same result(s).' +
            '</td>' + '</tr>');
        visualizeGTMWQ2(gtmwQ2MaliciousURL, "");
    }

    // automatically scroll to the bottom of the div
    let resultDiv = document.getElementById('GTMWResultDivQ2');
    resultDiv.scrollTop = resultDiv.scrollHeight;
}

function gtmwQ2() {
    let gtmwQ2Param = {};
    gtmwQ2Param["channelName"] = "b2csm-gtmw";
    gtmwQ2Param["fcn"] = "queryCSM";
    let gtmwQ2MaliciousURL = $("#gtmwQ2MaliciousURL").val();
    let gtmwQ2TimeIntv = $("#gtmwQ2TimeInterval").val();
    let timeValid = gtmwQ2TimeIntv.match(/\d{1,3}[-]\d{1,3}/g);
    if(timeValid == null) {
        alert("Time interval is invalid!");
        return;
    }
    let gtmwQ2TimeIntvS = parseInt(gtmwQ2TimeIntv.split("-")[0]);
    let gtmwQ2TimeIntvE = parseInt(gtmwQ2TimeIntv.split("-")[1]);
    if(gtmwQ2TimeIntvS > gtmwQ2TimeIntvE) {
        alert("Time interval is invalid! ");
        return;
    }

    let gtmwQ2Array = new Array(4);
    gtmwQ2Array[0] = "A2";
    gtmwQ2Array[1] = gtmwQ2MaliciousURL;
    gtmwQ2Array[2] = gtmwQ2TimeIntvS;
    gtmwQ2Array[3] = gtmwQ2TimeIntvE;
    gtmwQ2Param["array"] = gtmwQ2Array;

    parseNodesInfo( async function (nodesInfo) {
        let responseArray = new Array(nodesInfo.length - 1);
        let responseCounter = 0;

        for (let i = 1; i < nodesInfo.length; i++){
            let responseNodeMap = new Map();
            try{
                let tempResult = await sendAjaxRequestToMulNodesGTQ2(gtmwQ2Param, nodesInfo[i].IP, 'gtmwQ2Table');
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
                if(tempResult[5] === 200){
                    responseNodeMap.set("QUERY_STATUS", "OK");
                } else if (tempResult[5] === 40040) {
                    responseNodeMap.set("QUERY_STATUS", "No available result");
                } else {
                    responseNodeMap.set("QUERY_STATUS", "No response");
                }
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
                // automatically scroll to the bottom of the div
                let resultDiv = document.getElementById('GTMWResultDivQ2');
                resultDiv.scrollTop = resultDiv.scrollHeight;
                if (responseArray[i].get("QUERY_STATUS") === "OK"){
                    queryStatus = '<span style="color: green">OK</span>';
                }else {
                    queryStatus = '<span style="color: red">FAIL (' + responseArray[i].get("QUERY_STATUS") + ')</span>';
                }

                if(responseArray[i].get("VERIFY_RESULT") === true){
                    sigVerify = '<span style="color: green">True</span>';
                } else if (responseArray[i].get("VERIFY_RESULT") === false){
                    sigVerify = '<span style="color: blue">False (The query result is modified!)</span>';
                } else {
                    sigVerify = '<span style="color: blue">No network connection!</span>';
                }

                $("#gtmwQ2Table tr:last").after(
                    '<tr style="border: 0;">' + '<td style="border: 0;">' +
                    'Node: ' + responseArray[i].get("NODE_IP") + '<br \>' +
                    'Status: ' + queryStatus + '<br \>' +
                    'Sig Verification: ' + sigVerify + '<br \>' +
                    'Result: ' + responseArray[i].get("HANDLED_RESULT") +
                    '</td>' + '</tr>');
                // automatically scroll to the bottom of the div
                resultDiv.scrollTop = resultDiv.scrollHeight;
            },  (i+1)*500);
        }

        setTimeout(function () {
            getGTMWQ2FinalResult(responseArray, gtmwQ2MaliciousURL);
        }, responseArray.length*500);
    });
}

function visualizeGTMWQ2(gtmwQ2MaliciousURL, potentialAPPs) {
    let toText = obj => obj.text();
    let containerName = "#gtmwcyQ2";
    let gtmwcyQ2 = cytoscape({
        container: $(containerName),
    });
    let gtmwcy2 = basicNetworkTopology(gtmwcyQ2, containerName);

    let getDatasetFromString = name => fetch(name).then(toText);
    let applyStyleSheet = stylesheet => {
        gtmwcy2.style().fromString(stylesheet).update();
    };

    Promise.resolve("stylesheets/gtmwStyle.cycss").then(getDatasetFromString).then(applyStyleSheet);
    let highlightNodeWithDelay = (query2Param) => {
        return new Promise(function (resolve) {
            setTimeout(function () {
                gtmwcy2.$('#'+query2Param[0]).addClass('highlighted ' + query2Param[1]);
            }, 1000);
            resolve('success');
        });
    };

    let highlightEdgeWithDelay = (edgeIDs) => {
        return new Promise((resolve) => {
            setTimeout(function () {
                for (let i = 0; i < edgeIDs.length; i++){
                    setTimeout(function () {
                        gtmwcy2.$('#'+edgeIDs[i]).addClass('highlighted query2');
                        let targetNode = edgeIDs[i].split('-separator-')[0];
                        gtmwcy2.$('#'+targetNode).addClass('highlighted end query2');
                    }, (i+1)*1000);
                }
            }, 1000);
            resolve('highlight edges successful');
        });
    };

    let gtmwQ2MaliciousURLFormed = gtmwQ2MaliciousURL.split('\.').join('-').split('\/').join('-').split('\?').join('-')
        .split('\%').join('-').split('\=').join('-').split('\#').join('-')
        .split('\&').join('-').split('\+').join('-').trim();

    let query2NodeParam = new Array(2);
    query2NodeParam[0] = gtmwQ2MaliciousURLFormed;
    query2NodeParam[1] = 'start query2';
    if(potentialAPPs == ""){
        Promise.resolve(query2NodeParam).then(highlightNodeWithDelay).then(function () {
            console.log("no available results!");
        });
    } else {
        // Construct edges
        let EdgeIDArray = new Array(potentialAPPs.length);
        for (let i = 0; i < EdgeIDArray.length; i++){
            EdgeIDArray[i] = potentialAPPs[i].split('\"')[1].split('\"')[0].trim() + '-separator-' + gtmwQ2MaliciousURLFormed;
        }
        Promise.resolve(query2NodeParam).then(highlightNodeWithDelay).then((data) => {
            Promise.resolve(EdgeIDArray).then(highlightEdgeWithDelay);
        });
    }
}

function getGTMWQ3FinalResult(resultArray, queryResult) {
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
        $("#gtmwQ3Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: green;">' + initialResult + '</span>' + '<br \>' +
            'Transaction ID:' + '<span style="color: green;">' + resultArray[0].get("TRANSACTION_ID") + '</span>' +
            '</td>' + '</tr>');
        let resultDiv = document.getElementById('GTMWResultDivQ3');
        resultDiv.scrollTop = resultDiv.scrollHeight;
        // get visual result
        let spoofedURL = queryResult.split('\#')[0].split('\,');
        let spoofedURLArray = new Array(spoofedURL.length - 1);
        for(let i = 0; i < spoofedURLArray.length; i++){
            spoofedURLArray[i] = spoofedURL[i].replace('\[',"").replace('\"', "")
                .replace('\[', "").replace('\]',"").replace('\"',"");
        }

        let visualResult = queryResult.split('\$')[1];
        let suspiciousAPPArray = visualResult.split('\;');
        let visualAPPMap = new Map(suspiciousAPPArray.size);
        for (let i = 0; i < suspiciousAPPArray.length; i++){
            let keyFormed = spoofedURLArray[i].split('\.').join('-').split('\/').join('-').split('\?').join('-')
                .split('\%').join('-').split('\=').join('-').split('\#').join('-')
                .split('\&').join('-').split('\+').join('-').split('\\u0026').join('-').trim();
            visualAPPMap.set(keyFormed, suspiciousAPPArray[i].match(/[a-fA-F0-9]{32}/g));
        }
        visualizeGTMWQ3(visualAPPMap);
    } else{
        $("#gtmwQ3Table tr:last").after(
            '<tr style="border: 0;">' + '<td style="border: 0; background-color: #DDD">' +
            'Final Result: ' + '<br \>' +
            '<span style="color: red;">No available final result!</span>' + '<br \>' +
            'Reason: received ' + '<span style="color: red;">' + availableResult + '\/' + resultArray.length + '</span>' + ' result(s), ' +
            '<span style="color: red;">' + availableValidSignature + '\/' + resultArray.length + '</span>' + ' valid signature(s), ' +
            '<span style="color: red;">' + availableSameResult + '\/' + resultArray.length + '</span>' + ' same result(s).' +
            '</td>' + '</tr>');
        let resultDiv = document.getElementById('GTMWResultDivQ3');
        resultDiv.scrollTop = resultDiv.scrollHeight;
    }

    // automatically scroll to the bottom of the div
    let resultDiv = document.getElementById('GTMWResultDivQ3');
    resultDiv.scrollTop = resultDiv.scrollHeight;
}

function gtmwQ3() {
    let gtmwQ3Param = {};
    gtmwQ3Param["channelName"] = "b2csm-gtmw";
    gtmwQ3Param["fcn"] = "queryCSM";
    let gtmwQ3LegitimateURL = $("#gtmwQ3LegitimateURL").val();
    let gtmw3Distance = $("#gtmwQ3Distance").val();
    let gtmwQ3TimeIntv = $("#gtmwQ3TimeInterval").val();
    let timeValid = gtmwQ3TimeIntv.match(/\d{1,3}[-]\d{1,3}/g);
    if(timeValid == null) {
        alert("Time interval is invalid!");
        return;
    }
    let gtmwQ3TimeIntvS = parseInt(gtmwQ3TimeIntv.split("-")[0]);
    let gtmwQ3TimeIntvE = parseInt(gtmwQ3TimeIntv.split("-")[1]);
    if(gtmwQ3TimeIntvS > gtmwQ3TimeIntvE) {
        alert("Time interval is invalid!");
        return;
    }
    let gtmwQ3Array = new Array(5);
    gtmwQ3Array[0] = "A3";
    gtmwQ3Array[1] = gtmwQ3LegitimateURL;
    gtmwQ3Array[2] = gtmwQ3TimeIntvS;
    gtmwQ3Array[3] = gtmwQ3TimeIntvE;
    gtmwQ3Array[4] = gtmw3Distance;
    gtmwQ3Param["array"] = gtmwQ3Array;
    parseNodesInfo( async function (nodesInfo) {
        let responseArray = new Array(nodesInfo.length - 1);
        let responseCounter = 0;
        let queryResult = null;

        for (let i = 1; i < nodesInfo.length; i++){
            let responseNodeMap = new Map();
            try{
                let tempResult = await sendAjaxRequestToMulNodesGTQ3(gtmwQ3Param, nodesInfo[i].IP, 'gtmwQ3Table');
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
                } else {
                    responseNodeMap.set("VERIFY_RESULT", false);
                }
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
                // automatically scroll to the bottom of the div
                let resultDiv = document.getElementById('GTMWResultDivQ3');
                resultDiv.scrollTop = resultDiv.scrollHeight;
                if (responseArray[i].get("QUERY_STATUS") === "OK"){
                    queryStatus = '<span style="color: green">OK</span>';
                }else {
                    queryStatus = '<span style="color: red">FAIL (' + responseArray[i].get("QUERY_STATUS") + ')</span>';
                }

                if(responseArray[i].get("VERIFY_RESULT") === true){
                    sigVerify = '<span style="color: green">True</span>';
                } else if (responseArray[i].get("VERIFY_RESULT") === false){
                    sigVerify = '<span style="color: blue">False (The query result is modified!)</span>';
                } else {
                    sigVerify = '<span style="color: blue">No network connection!</span>';
                }

                $("#gtmwQ3Table tr:last").after(
                    '<tr style="border: 0;">' + '<td style="border: 0;">' +
                    'Node: ' + responseArray[i].get("NODE_IP") + '<br \>' +
                    'Status: ' + queryStatus + '<br \>' +
                    'Sig Verification: ' + sigVerify + '<br \>' +
                    'Result: ' + responseArray[i].get("HANDLED_RESULT") +
                    '</td>' + '</tr>');
                // automatically scroll to the bottom of the div
                resultDiv.scrollTop = resultDiv.scrollHeight;
            },  (i+1)*500);
        }

        setTimeout(function () {
            getGTMWQ3FinalResult(responseArray, queryResult);
        }, responseArray.length*500);
    });
}

function visualizeGTMWQ3(resultMap) {
    let toText = obj => obj.text();
    let containerName = "#gtmwcyQ3";
    let gtmwcyQ3 = cytoscape({
        container: $(containerName),
    });
    let gtmwcy3 = basicNetworkTopology(gtmwcyQ3, containerName);

    let getDatasetFromString = name => fetch(name).then(toText);
    let applyStyleSheet = stylesheet => {
        gtmwcy3.style().fromString(stylesheet).update();
    };

    Promise.resolve("stylesheets/gtmwStyle.cycss").then(getDatasetFromString).then(applyStyleSheet);

    let highlightNodeWithDelay = (query3Param) => {
        return new Promise(function (resolve) {
            for (let i = 0; i < query3Param[0].length; i++){
                setTimeout(function () {
                    gtmwcy3.$('#'+query3Param[0][i]).addClass(query3Param[1]);
                }, (i + 1) * 1000);
            }
            resolve('highlight spoofedURL nodes successful');
        });
    };

    let highlightEdgeWithDelay = (query3EdgesParam) => {
        return new Promise((resolve) => {
            setTimeout(function () {
                for (let i = 0; i < query3EdgesParam[0].length; i++){
                    setTimeout(function () {
                        gtmwcy3.$('#'+query3EdgesParam[0][i]).addClass(query3EdgesParam[1]);
                        let targetNode = query3EdgesParam[0][i].split('-separator-')[0];
                        gtmwcy3.$('#'+targetNode).addClass(query3EdgesParam[2]);
                    }, (i+1)*1000);
                }
            }, (resultMap.size + 1)*1000);
            resolve('highlight edges successful');
        });
    };

    // drawing the spoofedURL

    let spoofedURLArray = new Array(resultMap.size);
    let spoofedURLCounter = 0;
    for (let spoofedURL of resultMap.keys()){
        spoofedURLArray[spoofedURLCounter] = spoofedURL;
        spoofedURLCounter++;
    }

    let query3Round1Param = new Array(2);
    query3Round1Param[0] = spoofedURLArray;
    query3Round1Param[1] = 'highlighted query3 start';

    let round2Array = new Array(resultMap.size);
    let round2ArrayCounter = 0;
    for (let [spoofedURL, suspiciousAPP] of resultMap){
        for (let j = 0; j < suspiciousAPP.length; j++){
            round2Array[round2ArrayCounter++] = suspiciousAPP[j] + '-separator-' + spoofedURL;
        }
    }

    let query3Round2Param = new Array(3);
    query3Round2Param[0] = round2Array;
    query3Round2Param[1] = 'highlighted query3'; // edges style
    query3Round2Param[2] = 'highlighted end query3'; // target node (suspicious APP) style

    Promise.resolve(query3Round1Param).then(highlightNodeWithDelay).then((data) => {
        Promise.resolve(query3Round2Param).then(highlightEdgeWithDelay).then((data) => {
            console.log('data' + data);
        });
    });
}
