$(document).ready(function () {
    getOrderersInfo();
});

function getOrderersInfo() {
    var ordererInfo = {};
    ordererInfo["fcn"] = "orderersAmount";
    ordererInfo["channelName"] = "b2csm-honeypots";
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(ordererInfo),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            //console.log("Orderer Info: ", JSONObject["result"]);
            //console.log("Orderer Info Type: ", typeof(JSONObject["result"]));
            var ordererJsonObj = JSON.parse(JSONObject["result"]);
            //console.log("Orderer JSON: ", ordererJsonObj);
            var orderersSize = ordererJsonObj["orderersAmount"];
            //console.log("Orderer JSON size: ", orderersSize);


            for (var i = 0; i < orderersSize ; i++){
                $("#frontendsTable tr:last").after(
                    '<tr>' +
                    '<td>' + (i+1) +'</td>' +
                    '<td>' + ordererJsonObj["ordererEntities"][i]["ordererName"] + '</td>' +
                    '<td>' + ordererJsonObj["ordererEntities"][i]["ordererURL"] + '</td>' +
                    '<td>' + '<span class="btn btn-success btn-rounded">running</span>' + '</td>' +
                    '</tr>');
            }
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
        }
    });
}