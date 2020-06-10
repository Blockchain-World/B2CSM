$(document).ready(function () {
    channelsInfo()
});

function channelsInfo() {
    var channelsAmount = {};
    channelsAmount["fcn"] = "channelsAmount";
    channelsAmount["channelName"] = "b2csm-honeypots";
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
            console.log("data: ", chResult);
            $('#b2csmchannel1').html(chResult["b2csmchannel1"]);
            $('#b2csmchannel2').html(chResult["b2csmchannel2"]);
            $('#b2csmchannel3').html(chResult["b2csmchannel3"]);
        },
        error: function (e) {
            var json = e.responseText;
            console.log("Error: ", json);
            $('#channelsResult').html("-");
        }
    });
}