package b2csm.base;

import com.alibaba.fastjson.JSONObject;

public interface BaseService {

    int SUCCESS = 200;
    int FAIL = 40040;
    int UN_LOGIN = 44;

    default String responseSuccess(String result){
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("status", SUCCESS);
        jsonObject.put("result", result);
        return jsonObject.toString();
    }

    default String responseSuccess(String result, String txid){
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("status", SUCCESS);
        jsonObject.put("result", result);
        jsonObject.put("txid", txid);
        return jsonObject.toString();
    }

    default String responseSuccess(String result, String txid, String signature){
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("status", SUCCESS);
        jsonObject.put("result", result);
        jsonObject.put("signature", signature);
        jsonObject.put("txid", txid);
        return jsonObject.toString();
    }

    default String responseSuccess(String result, String txid, String signature, boolean verifyResult){
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("status", SUCCESS);
        jsonObject.put("result", result);
        jsonObject.put("signature", signature);
        jsonObject.put("verifyResult", verifyResult);
        jsonObject.put("txid", txid);
        return jsonObject.toString();
    }

    default String responseSuccess(JSONObject jsonObj){
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("status", SUCCESS);
        jsonObject.put("data", jsonObj);
        return jsonObject.toString();
    }

    default String responseFail(String result, String signature){
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("status", FAIL);
        jsonObject.put("error", result);
        jsonObject.put("signature", signature);
        return jsonObject.toString();
    }

    default String responseFail(String result){
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("status", FAIL);
        jsonObject.put("error", result);
        return jsonObject.toString();
    }

    default String responseUnLogin(String result){
        JSONObject jsonObject = new JSONObject();
        jsonObject.put("status", UN_LOGIN);
        return jsonObject.toString();
    }
}
