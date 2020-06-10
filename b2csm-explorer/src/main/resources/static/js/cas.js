$(document).ready(function () {
    getAllCAs();
});

function getAllCAs() {
    var caInfo = {};
    caInfo["fcn"] = "casAmount";
    caInfo["channelName"] = "b2csm-honeypots";
    $.ajax({
        type: "POST",
        contentType: "application/json",
        url: "/b2csm/dashboard",
        data: JSON.stringify(caInfo),
        dataType: 'json',
        cache: false,
        timeout: 600000,
        success: function (data) {
            var json = JSON.stringify(data, null, 4);
            var JSONObject = JSON.parse(json);
            var caJsonObj = JSON.parse(JSONObject["result"]);
            var casSize = caJsonObj["casAmount"];
            for (var i = 0; i < casSize ; i++){
                $("#casTable tr:last").after(
                    '<tr>' +
                    '<td>' + "CA-" + (i+1) +'</td>' +
                    '<td>' + caJsonObj["casEntities"][i]["caName"] + '</td>' +
                    '<td>' + "b2csmnetwork" + '</td>' +
                    '<td>' + caJsonObj["casEntities"][i]["caURL"] + '</td>' +
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