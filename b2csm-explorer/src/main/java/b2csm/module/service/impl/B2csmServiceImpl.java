package b2csm.module.service.impl;

import b2csm.fabricCore.FabricManager;
import b2csm.module.manager.B2csmManager;
import b2csm.module.service.B2csmService;
import b2csm.utility.SignVerify;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.codec.binary.Hex;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.Map;

@Service("simpleService")
public class B2csmServiceImpl implements B2csmService {

    @Override
    public String chainCode(JSONObject jsonObj){
        String type = jsonObj.getString("type");
        String fcn = jsonObj.getString("fcn");
        String channelName = jsonObj.getString("channelName");
        JSONArray jsonArray = jsonObj.getJSONArray("array");
        Map<String, String> resultMap;
        int length = jsonArray.size();
        String[] argArray = new String[length];
        for (int i = 0; i < length; i++){
            argArray[i] = jsonArray.getString(i);
        }
        try{
            FabricManager manager = B2csmManager.obtain("ent1", channelName).getFabricManager();
            switch (type){
                case "install":
                    resultMap = manager.install();
                    break;
                case "instantiate":
                    resultMap = manager.instantiate(argArray);
                    break;
                case "upgrade":
                    resultMap = manager.upgrade(argArray);
                    break;
                case "invoke":
                    resultMap = manager.invoke(fcn, argArray);
                    break;
                case "query":
                    resultMap = manager.query(fcn, argArray);
                    break;
                    default:
                        throw new RuntimeException(String.format("no type was found with name %s ", type));
            }
            if(resultMap.get("code").equals("error")){
                return responseFail(resultMap.get("data"));
            }else{
                return responseSuccess(resultMap.get("data"), resultMap.get("txid"));
            }
        }catch (Exception e){
            e.printStackTrace();
            return responseFail(String.format("Request failed: %s", e.getMessage()));
        }
    }

    @Override
    public String trace(JSONObject json){
        String fcn = json.getString("fcn");
        String channelName = json.getString("channelName");
        String traceId = json.getString("traceId");
        Map<String, String> resultMap;
        try{
            FabricManager manager = B2csmManager.obtain("ent1", channelName).getFabricManager();
            switch (fcn){
                case "queryBlockByTransactionID":
                    resultMap = manager.queryBlockByTransactionID(traceId);
                    break;
                case "queryBlockByHash":
                    resultMap = manager.queryBlockByHash(Hex.decodeHex(traceId.toCharArray()));
                    break;
                case "queryBlockByNumber":
                    resultMap = manager.queryBlockByNumber(Long.valueOf(traceId));
                    break;
                case "queryBlockchainInfo":
                    resultMap = manager.getBlockchainInfo();
                    break;
                    default:
                        return responseFail("No func found, please check and try again.");
            }
            return responseSuccess(JSONObject.parseObject(resultMap.get("data")));
        }catch (Exception e){
            e.printStackTrace();
            return responseFail(String.format("Request failed: %s", e.getMessage()));
        }
    }

    @Override
    public String dashboard(JSONObject json){
        String fcn = json.getString("fcn");
        String channelName = json.getString("channelName");
        Map<String, String> resultMap;
        try{
            //FabricManager manager = B2csmManager.obtain().getFabricManager();
            FabricManager manager = B2csmManager.obtain("ent1", channelName).getFabricManager();
            switch (fcn){
                case "enterprisesAmount":
                    resultMap = manager.getAmount("organizations");
                    break;
                case "orderersAmount":
                    resultMap = manager.getAmount("orderers");
                    break;
                case "peersAmount":
                    resultMap = manager.getAmount("peers");
                    break;
                case "casAmount":
                    resultMap = manager.getAmount("cas");
                    break;
                case "channelsAmount":
                    resultMap = manager.getAmount("channels");
                    break;
                case "blocksAmount":
                    resultMap = manager.getAmount("blocks");
                    break;
                case "transactionsAmount":
                    resultMap = manager.getAmount("transactions");
                    break;
                case "chaincodesAmount":
                    resultMap = manager.getAmount("chaincodes");
                    break;
                    default:
                        return responseFail("No func found, please check and try again");
            }
            return responseSuccess(resultMap.get("data"));
        }catch (Exception e){
            e.printStackTrace();
            return responseFail(String.format("Request failed: %s", e.getMessage()));
        }
    }

    @Override
    public String replicateLedger(JSONObject json){
        String datasetName = json.getString("datasetName");
        String channelName = json.getString("channelName");
        String result;
        if (channelName.equals("b2csm-honeypots")){
            String dayTime = datasetName.split("\\.")[0].split("-")[1];
            Map<String, String> resultMap;
            try{
                FabricManager manager = B2csmManager.obtain("ent1", channelName).getFabricManager();
                resultMap = manager.replicate("invoke", datasetName, dayTime);
                result = responseSuccess(resultMap.get("data"));
            }catch (Exception e){
                e.printStackTrace();
                result = responseFail(String.format("Request failed: %s", e.getMessage()));
            }
        } else if(channelName.equals("b2csm-nids")){
            String dayTime = datasetName.split("\\.")[0].split("-")[1];
            Map<String, String> resultMap;
            try{
                FabricManager manager = B2csmManager.obtain("ent1", channelName).getFabricManager();
                resultMap = manager.replicate("invoke", datasetName, dayTime);
                result = responseSuccess(resultMap.get("data"));
            }catch (Exception e){
                e.printStackTrace();
                result = responseFail(String.format("Request failed: %s", e.getMessage()));
            }
        } else if (channelName.equals("b2csm-gtmw")){
            String dayTime = datasetName.split("\\.")[0].split("-")[1];
            Map<String, String> resultMap;
            try{
                FabricManager manager = B2csmManager.obtain("ent1", channelName).getFabricManager();
                resultMap = manager.replicate("invoke", datasetName, dayTime);
                result = responseSuccess(resultMap.get("data"));
            }catch (Exception e){
                e.printStackTrace();
                result = responseFail(String.format("Request failed: %s", e.getMessage()));
            }
        }else {
            result = responseFail(String.format("Request failed: channel name is unknown!"));
        }
        return result;
    }

    @Override
    public String honeypotsQuery(JSONObject json){
        String fcn = json.getString("fcn");
        String channelName = json.getString("channelName");
        JSONArray jsonArray = json.getJSONArray("array");
        Map<String, String> resultMap;
        String[] argArray = new String[jsonArray.size()];
        for (int i = 0; i < jsonArray.size(); i++){
            argArray[i] = jsonArray.getString(i);
        }
        try{
            FabricManager manager = B2csmManager.obtain("ent1", channelName).getFabricManager();
            resultMap = manager.honeypotsIdentify(fcn, argArray);

            if(resultMap.get("code").equals("error")){
                return responseFail(resultMap.get("data"), resultMap.get("signature"));
            }else{
                return responseSuccess(resultMap.get("data"), resultMap.get("txid"), resultMap.get("signature"), true);
            }
        }catch (Exception e){
            e.printStackTrace();
            return responseFail(String.format("Request failed: %s", e.getMessage()));
        }
    }

    @Override
    public String nidsQuery(JSONObject json){
        String fcn = json.getString("fcn");
        String channelName = json.getString("channelName");
        JSONArray jsonParam = json.getJSONArray("array");
        Map<String, String> resultMap;
        String[] argArray = new String[jsonParam.size()];
        for (int i = 0; i < jsonParam.size(); i++){
            argArray[i] = jsonParam.getString(i);
        }
        try{
            FabricManager manager = B2csmManager.obtain("ent1", channelName).getFabricManager();
            resultMap = manager.nidsQuery(fcn, argArray);
            if(resultMap.get("code").equals("error")){
                return responseFail(resultMap.get("data"), resultMap.get("signature"));
            }else {
                return responseSuccess(resultMap.get("data"), resultMap.get("txid"), resultMap.get("signature"), true);
            }
        }catch (Exception e){
            e.printStackTrace();
            return responseFail(String.format("Request failed: %s", e.getMessage()));
        }
    }

    @Override
    public String gtmwQuery(JSONObject json){
        String fcn = json.getString("fcn");
        String channelName = json.getString("channelName");
        JSONArray jsonParam = json.getJSONArray("array");
        Map<String, String> resultMap;
        String[] argArray = new String[jsonParam.size()];
        for (int i = 0; i < jsonParam.size(); i++){
            argArray[i] = jsonParam.getString(i);
        }
        try{
            FabricManager manager = B2csmManager.obtain("ent1", channelName).getFabricManager();
            resultMap = manager.gtmwIdentify(fcn, argArray);
            if(resultMap.get("code").equals("error")){
                return responseFail(resultMap.get("data"), resultMap.get("signature"));
            }else{
                return responseSuccess(resultMap.get("data"), resultMap.get("txid"), resultMap.get("signature"), true);
            }
        }catch (Exception e){
            e.printStackTrace();
            return responseFail(String.format("Request failed: %s", e.getMessage()));
        }
    }

}