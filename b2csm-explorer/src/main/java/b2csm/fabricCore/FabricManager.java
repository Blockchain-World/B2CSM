package b2csm.fabricCore;

import b2csm.base.BaseManager;
import com.alibaba.fastjson.JSON;
import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hyperledger.fabric.sdk.NetworkConfig;
import org.hyperledger.fabric.sdk.exception.ChaincodeEndorsementPolicyParseException;
import org.hyperledger.fabric.sdk.exception.InvalidArgumentException;
import org.hyperledger.fabric.sdk.exception.ProposalException;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeoutException;

/**
 *  Hyperledger Fabric Manager
 */

public class FabricManager {

    private static Log logger = LogFactory.getLog(FabricManager.class);

    private TempOrg org;

    FabricManager(TempOrg org){
        this.org = org;
    }

    // Install chaincode
    public Map<String, String> install() throws ProposalException, InvalidArgumentException{
        return org.getChainCode().install(org);
    }

    /**
     * Instantiate chaincode
     * @param args
     */
    public Map<String, String> instantiate(String[] args) throws ProposalException,
            InvalidArgumentException, IOException, ChaincodeEndorsementPolicyParseException,
            InterruptedException, ExecutionException, TimeoutException{
        return org.getChainCode().instantiate(org, args);
    }

    /**
     * Update chaincode
     * @param args
     */
    public Map<String, String> upgrade(String[] args) throws ProposalException, InvalidArgumentException,
            IOException, ChaincodeEndorsementPolicyParseException, InterruptedException,
            ExecutionException, TimeoutException{
        return org.getChainCode().upgrade(org, args);
    }

    /**
     * invoke chaincode
     * @param fcn
     * @param args
     */
    public Map<String, String> invoke(String fcn, String[] args) throws InvalidArgumentException, ProposalException,
            IOException, InterruptedException, ExecutionException, TimeoutException{
        return org.getChainCode().invoke(org, fcn, args);
    }

    /**
     * query chaincode
     * @param fcn
     * @param args
     */
    public Map<String, String> query(String fcn, String[] args) throws InvalidArgumentException, ProposalException{
        return org.getChainCode().query(org, fcn, args);
    }

    /**
     * query honeypots
     * @param fcn
     * @param args
     */
    public Map<String, String> honeypotsIdentify(String fcn, String[] args) throws InvalidArgumentException, ProposalException {
        return org.getChainCode().honeypotsIdentify(org, fcn, args);
    }

    /**
     * nids query
     */
    public Map<String, String> nidsQuery(String fcn, String[] args) throws InvalidArgumentException, ProposalException {
        return org.getChainCode().nidsIdentify(org, fcn, args);
    }

    /**
     * query gtmw
     * @param fcn
     * @param args
     */
    public Map<String, String> gtmwIdentify(String fcn, String[] args) throws InvalidArgumentException, ProposalException {
        return org.getChainCode().gtmwIdentify(org, fcn, args);
    }

    /**
     * get the number of enterprises (organizations)
     * @param type
     * @return
     * @throws Exception
     */
    public Map<String, String> getAmount(String type) throws Exception {
        Map<String, String> resultMap = new HashMap<>();
        NetworkConfig config = BaseManager.getNetworkConfig();
        Collection<NetworkConfig.OrgInfo> organizationInfos = config.getOrganizationInfos();
        if (type.equals("organizations") || type.equals("enterprises")){
            int entAmount = organizationInfos.size();
            resultMap.put("code", "success");
            resultMap.put("data", entAmount+"");
        }else if (type.equals("orderers")){
            JSONObject orderersJson = new JSONObject();
            JSONArray orderersArray = new JSONArray();
            Collection<String> ordererNames = config.getOrdererNames();
            for (String ordererName : ordererNames){
                JSONObject ordererEntity = new JSONObject();
                ordererEntity.put("ordererName", ordererName);
                ordererEntity.put("ordererURL", config.getOrdererProperties(ordererName).getProperty("url"));
                orderersArray.add(ordererEntity);
            }
            orderersJson.put("orderersAmount", ordererNames.size());
            orderersJson.put("ordererEntities", orderersArray);
            resultMap.put("code", "success");
            resultMap.put("data", orderersJson.toJSONString());
        } else if(type.equals("peers")){
            JSONObject peersJson = new JSONObject();
            JSONArray peersArray = new JSONArray();
            Collection<String> configPeers = config.getPeerNames();
            for (String peerName : configPeers){
                JSONObject peerEntity = new JSONObject();
                peerEntity.put("peerName", peerName);
                peerEntity.put("peerURL", config.getPeerProperties(peerName).getProperty("url"));
                peerEntity.put("peerEventURL", config.getPeerProperties(peerName).getProperty("eventUrl"));
                peersArray.add(peerEntity);
            }
            peersJson.put("peersAmount", configPeers.size());
            peersJson.put("peerEntities", peersArray);
            resultMap.put("code", "success");
            resultMap.put("data", peersJson.toJSONString());
        } else if (type.equals("cas")){
            JSONObject casJson = new JSONObject();
            JSONArray casArray = new JSONArray();
            int allCAs = 0;
            for (NetworkConfig.OrgInfo orgInfo : organizationInfos){
                List<NetworkConfig.CAInfo> caInfos = orgInfo.getCertificateAuthorities();
                for (int i = 0; i < caInfos.size(); i ++){
                    allCAs++;
                    JSONObject casEntity = new JSONObject();
                    casEntity.put("caName", caInfos.get(i).getCAName());
                    casEntity.put("caURL", caInfos.get(i).getUrl());
                    casArray.add(casEntity);
                }
            }
            casJson.put("casAmount", allCAs);
            casJson.put("casEntities", casArray);
            resultMap.put("code", "success");
            resultMap.put("data", casJson.toJSONString());
        } else if (type.equals("channels")) {
            JSONObject channelsJson = new JSONObject();
            Set<String> channels = config.getChannelNames();
            channelsJson.put("channelAmount", channels.size());
            int channelLength = channels.size();
            for (int i = 0; i < channelLength; i++){
                String channelTemp = channels.iterator().next();
                channelsJson.put("b2csmchannel"+ (i+1), channelTemp);
                channels.remove(channelTemp);
            }
            resultMap.put("code", "success");
            resultMap.put("data", channelsJson.toJSONString());
        } else if (type.equals("blocks")){
            JSONObject blockchainData;
            Map<String, String> blockchainInfo = org.getChannel().getBlockchainInfo();
            blockchainData = JSON.parseObject(blockchainInfo.get("data"));
            String height = blockchainData.get("height").toString();
            resultMap.put("code", "success");
            resultMap.put("data", height + "");
        } else if (type.equals("transactions")){
            // Get block number first
            int allTransactions = 0;
            int height = Integer.parseInt(JSON.parseObject(org.getChannel().getBlockchainInfo().get("data")).get("height").toString());
            for (int i = 0; i < height; i++){
                int txAmount = (int) JSON.parseObject(org.getChannel().queryBlockByNumber(i).get("data")).get("envelopeCount");
                allTransactions += txAmount;
            }
            resultMap.put("code", "success");
            resultMap.put("data", allTransactions + "");
        } else if (type.equals("chaincodes")) {
            int allChaincodes = 0;
            Set<String> channels = config.getChannelNames();
            // TODO: currently assuming each channel just maintain one chaincode
            allChaincodes = channels.size();
            resultMap.put("code", "success");
            resultMap.put("data", allChaincodes + "");
        }
        else {
            logger.error("No available type for querying found.");
        }
        return resultMap;
    }

    /**
     *
     * Replicate all csv files to ledger
     */
    public Map<String, String> replicate(String fcn, String datasetName, String dayTime) throws InvalidArgumentException, ProposalException, IOException{
        return org.getChainCode().replicate(org, fcn, datasetName, dayTime);
    }

    /**
     * queryBlockByTransactionID
     * @param txID
     */
    public Map<String, String> queryBlockByTransactionID(String txID) throws ProposalException,
            IOException, InvalidArgumentException{
        return org.getChannel().queryBlockByTransactionID(txID);
    }

    /**
     * queryBlockByHash within a channel
     * @param blockHash
     */
    public Map<String, String> queryBlockByHash(byte[] blockHash) throws ProposalException,
            IOException, InvalidArgumentException{
        return org.getChannel().queryBlockByHash(blockHash);
    }

    /**
     * query block by height
     * @param blockNumber
     */
    public Map<String, String> queryBlockByNumber(long blockNumber) throws ProposalException,
            IOException, InvalidArgumentException{
        return org.getChannel().queryBlockByNumber(blockNumber);
    }

    /**
     * Peers join channel
     * @param peerName
     * @param peerEventHubName
     * @param peerLocation
     * @param peerEventHubLocation
     * @param isEventListener
     */
    public Map<String, String> joinPeer(String peerName, String peerEventHubName, String peerLocation,
                                        String peerEventHubLocation, boolean isEventListener)
            throws ProposalException, InvalidArgumentException{
        return org.getChannel().joinPeer(new TempPeer(peerName, peerEventHubName, peerLocation, peerEventHubLocation, isEventListener));
    }

    /**
     * get blockchain info: chain length, current block hash, previous block hash
     */
    public Map<String, String> getBlockchainInfo() throws ProposalException, InvalidArgumentException{
        return org.getChannel().getBlockchainInfo();
    }
}
