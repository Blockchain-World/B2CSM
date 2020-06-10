$(document).ready(function () {
    getPeersInfo();
});

function getPeersInfo() {
    let peerInfo = {};
    peerInfo["fcn"] = "peersAmount";
    peerInfo["channelName"] = "b2csm-honeypots";
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(peerInfo),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            let json = JSON.stringify(data, null, 4);
            let JSONObject = JSON.parse(json);
            //console.log("Peer Info: ", JSONObject["result"]);
            //console.log("Peer Info Type: ", typeof(JSONObject["result"]));
            let peerJsonObj = JSON.parse(JSONObject["result"]);
            //console.log("Peer JSON: ", peerJsonObj);
            let peersSize = peerJsonObj["peersAmount"];
            //console.log("Peer JSON size: ", peersSize);


            for (let i = 0; i < peersSize ; i++){
                $("#peersTable tr:last").after(
                    '<tr>' +
                    '<td>' + (i+1) +'</td>' +
                    '<td>' + peerJsonObj["peerEntities"][i]["peerName"] + '</td>' +
                    '<td>' + peerJsonObj["peerEntities"][i]["peerURL"] + '</td>' +
                    '<td>' + peerJsonObj["peerEntities"][i]["peerEventURL"] + '</td>' +
                    '<td>' + '<span class="btn btn-success btn-rounded">running</span>' + '</td>' +
                    '</tr>');
            }
        },
        error: function (e) {
            let json = e.responseText;
            console.log("Error: ", json);
        }
    });
}