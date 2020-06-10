package b2csm.fabricCore;

import b2csm.gtmw.GTMWDatasetToChain;
import b2csm.nids.NIDSDatasetToChain;
import b2csm.utility.FileOperation;
import b2csm.utility.SignVerify;
import com.alibaba.fastjson.JSONObject;
import com.google.common.hash.Hashing;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.lang3.StringUtils;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hyperledger.fabric.sdk.*;
import org.hyperledger.fabric.sdk.exception.ChaincodeEndorsementPolicyParseException;
import org.hyperledger.fabric.sdk.exception.InvalidArgumentException;
import org.hyperledger.fabric.sdk.exception.ProposalException;

import java.io.*;
import java.nio.charset.StandardCharsets;
import java.text.DecimalFormat;
import java.util.*;
import java.util.concurrent.*;
import java.util.stream.Collectors;

import b2csm.honeypots.HoneypotsDatasetToChain;

import static java.nio.charset.StandardCharsets.UTF_8;

public class TempChaincodeID {

    private static final Log log = LogFactory.getLog(TempChaincodeID.class);
    private String chaincodeName;
    private String chaincodeSource; // /opt/gopath
    private String chaincodePath; // github.com/hyperledger/fabric/xxx/chaincode/go/example/explorer
    private String chaincodeVersion;
    private ChaincodeID chaincodeID;
    private int proposalWaitTime = 2000000;
    private int transactionWaitTime = 120;

    public static final String ORDERER_WAIT_TIME = "org.hyperledger.fabric.sdk.orderer.ordererWaitTimeMilliSecs";
    private static final String ORDERER_WAIT_TIME_VALUE = "200000";
    public static final String ORDERER_RETRY_WAIT_TIME = "org.hyperledger.fabric.sdk.orderer_retry.wait_time";
    private static final String ORDERER_RETRY_WAIT_TIME_VALUE = "500";

    static {
        System.setProperty(ORDERER_WAIT_TIME, ORDERER_WAIT_TIME_VALUE);
        ////System.setProperty(ORDERER_RETRY_WAIT_TIME, "1000");
    }

    void setChaincodeName(String chaincodeName){
        this.chaincodeName = chaincodeName;
        setChaincodeID();
    }

    void setChaincodeSource(String chaincodeSource){
        this.chaincodeSource = chaincodeSource;
        setChaincodeID();
    }

    void setChaincodePath(String chaincodePath){
        this.chaincodePath = chaincodePath;
        setChaincodeID();
    }

    void setChaincodeVersion(String chaincodeVersion){
        this.chaincodeVersion = chaincodeVersion;
        setChaincodeID();
    }

    private void setChaincodeID(){
        if(null != chaincodeName && null != chaincodePath && null != chaincodeVersion){
            chaincodeID = ChaincodeID.newBuilder().setName(chaincodeName).setVersion(chaincodeVersion).setPath(chaincodePath).build();
        }
    }

    /**
     * install chaincode
     * @param org
     */
    Map<String, String> install(TempOrg org) throws ProposalException, InvalidArgumentException {
        // Send transaction proposal to all peers.
        InstallProposalRequest installProposalRequest = org.getClient().newInstallProposalRequest();
        installProposalRequest.setChaincodeName(chaincodeName);
        installProposalRequest.setChaincodeSourceLocation(new File(chaincodeSource));
        installProposalRequest.setChaincodePath(chaincodePath);
        //installProposalRequest.setChaincodeSourceLocation(Paths.get("src/test/fixture", "sdkintegration/gocc/sample1").toFile());
        installProposalRequest.setChaincodeVersion(chaincodeVersion);
        installProposalRequest.setChaincodeLanguage(TransactionRequest.Type.GO_LANG);
        installProposalRequest.setProposalWaitTime(proposalWaitTime);

        long currentStart = System.currentTimeMillis();
        Collection<ProposalResponse> installProposalResponses = org.getClient().sendInstallProposal(installProposalRequest, org.getChannel().get().getPeers());
        log.info("chaincode install transaction proposal time = " + (System.currentTimeMillis() - currentStart));
        return toPeerResponse(installProposalResponses, false);
    }

    /**
     * instantiate chaincode
     * @param org
     * @param args
     */
    Map<String, String> instantiate(TempOrg org, String[] args) throws ProposalException, InvalidArgumentException,
            IOException, ChaincodeEndorsementPolicyParseException, InterruptedException, ExecutionException, TimeoutException{
        InstantiateProposalRequest instantiateProposalRequest = org.getClient().newInstantiationProposalRequest();
        instantiateProposalRequest.setChaincodeID(chaincodeID);
        instantiateProposalRequest.setChaincodeLanguage(TransactionRequest.Type.GO_LANG);
        instantiateProposalRequest.setProposalWaitTime(proposalWaitTime);
        instantiateProposalRequest.setFcn("init");
        instantiateProposalRequest.setArgs(args);

        //ChaincodeEndorsementPolicy chaincodeEndorsementPolicy = new ChaincodeEndorsementPolicy();
        //chaincodeEndorsementPolicy.fromYamlFile(new File("/b2csm-explorer/src/main/java/b2csm/policy/chaincodeendorsementpolicy.yaml"));
        //instantiateProposalRequest.setChaincodeEndorsementPolicy(chaincodeEndorsementPolicy);

        Map<String, byte[]> tm2 = new HashMap<>();
        tm2.put("HyperledgerFabric", "InstantiateProposalRequest:JavaSDK".getBytes(UTF_8));
        tm2.put("method", "InstantiateProposalRequest".getBytes(UTF_8));
        tm2.put("result", ":)".getBytes(UTF_8));
        instantiateProposalRequest.setTransientMap(tm2);

        long currentStart = System.currentTimeMillis();
        Collection<ProposalResponse> instantiateProposalResponses = org.getChannel().get().sendInstantiationProposal(instantiateProposalRequest,
                org.getChannel().get().getPeers());
        log.info("chaincode instantiate transaction proposal time = " + (System.currentTimeMillis() - currentStart));
        return toOrdererResponse(instantiateProposalResponses, org);
    }

    /**
     * upgrade chaincode
     * @param org
     * @param args
     */
    Map<String, String> upgrade(TempOrg org, String[] args) throws ProposalException, InvalidArgumentException, IOException,
            ChaincodeEndorsementPolicyParseException, InterruptedException, ExecutionException, TimeoutException {
        // Send transaction proposal to all peers
        UpgradeProposalRequest upgradeProposalRequest = org.getClient().newUpgradeProposalRequest();
        upgradeProposalRequest.setChaincodeID(chaincodeID);
        upgradeProposalRequest.setProposalWaitTime(proposalWaitTime);
        upgradeProposalRequest.setArgs(args);

        ChaincodeEndorsementPolicy chaincodeEndorsementPolicy = new ChaincodeEndorsementPolicy();
        //chaincodeEndorsementPolicy.fromYamlFile(new File("/b2csm-explorer/src/main/java/b2csm/policy/chaincodeendorsementpolicy.yaml"));
        upgradeProposalRequest.setChaincodeEndorsementPolicy(chaincodeEndorsementPolicy);

        Map<String, byte[]> tm2 = new HashMap<>();
        tm2.put("HyperledgerFabric", "UpgradeProposalRequest:JavaSDK".getBytes(UTF_8));
        tm2.put("method", "UpgradeProposalRequest".getBytes(UTF_8));
        tm2.put("result", ":)".getBytes(UTF_8));
        upgradeProposalRequest.setTransientMap(tm2);

        long currentStart = System.currentTimeMillis();
        Collection<ProposalResponse> upgradeProposalResponses = org.getChannel().get().sendUpgradeProposal(upgradeProposalRequest, org.getChannel().get().getPeers());
        log.info("chaincode instantiate transaction proposal time = " + (System.currentTimeMillis() - currentStart));
        return toOrdererResponse(upgradeProposalResponses, org);
    }

    /**
     * invoke chaincode
     * @param org
     * @param fcn
     * @param args
     */
    Map<String, String> invoke(TempOrg org, String fcn, String[] args) throws InvalidArgumentException, ProposalException,
            IOException, InterruptedException, ExecutionException, TimeoutException{
        //System.out.println("property: " + System.getProperty(ORDERER_WAIT_TIME));
        TransactionProposalRequest transactionProposalRequest = org.getClient().newTransactionProposalRequest();
        transactionProposalRequest.setChaincodeID(chaincodeID);
        transactionProposalRequest.setArgs(args);
        transactionProposalRequest.setFcn(fcn);
        transactionProposalRequest.setProposalWaitTime(proposalWaitTime);
        Map<String, byte[]> tm2 = new HashMap<>();
        tm2.put("HyperledgerFabric", "TransactionProposalRequest:JavaSDK".getBytes(UTF_8));
        tm2.put("method", "TransactionProposalRequest".getBytes(UTF_8));
        tm2.put("result", ":)".getBytes(UTF_8));
        transactionProposalRequest.setTransientMap(tm2);

        long currentStart = System.currentTimeMillis();
        // test multiple transactions
        long startTime = System.nanoTime();

        Collection<ProposalResponse> transactionProposalResponses = org.getChannel().get().sendTransactionProposal(transactionProposalRequest,
                    org.getChannel().get().getPeers());
        log.info("Chaincode invoke transaction proposal time = " + (System.currentTimeMillis() - currentStart) + "us");
        return toOrdererResponse(transactionProposalResponses, org);
    }

    /**
     * query chaincode
     * @param org
     * @param fcn
     * @param args
     */
    Map<String, String> query(TempOrg org, String fcn, String[] args) throws InvalidArgumentException, ProposalException {
        QueryByChaincodeRequest queryByChaincodeRequest = org.getClient().newQueryProposalRequest();
        queryByChaincodeRequest.setArgs(args);
        queryByChaincodeRequest.setFcn(fcn);
        queryByChaincodeRequest.setChaincodeID(chaincodeID);
        queryByChaincodeRequest.setProposalWaitTime(proposalWaitTime);

        Map<String, byte[]> tm2 = new HashMap<>();
        tm2.put("HyperledgerFabric", "QueryByChaincodeRequest:JavaSDK".getBytes(UTF_8));
        tm2.put("method", "QueryByChaincodeRequest".getBytes(UTF_8));
        queryByChaincodeRequest.setTransientMap(tm2);

        long currentStart = System.currentTimeMillis();
        Collection<ProposalResponse> queryProposalResponses = org.getChannel().get().queryByChaincode(queryByChaincodeRequest, org.getChannel().get().getPeers());
        log.info("chaincode query transaction proposal time = " + (System.currentTimeMillis() - currentStart) + " us");
        return toPeerResponse(queryProposalResponses, true);
    }

    /**
     * query chaincode for honeypots
     * @param org
     * @param fcn
     * @param args
     */
    Map<String, String> honeypotsIdentify(TempOrg org, String fcn, String[] args) throws InvalidArgumentException, ProposalException {
        QueryByChaincodeRequest honeypotsIdentifyRequest = org.getClient().newQueryProposalRequest();
        honeypotsIdentifyRequest.setArgs(args);
        honeypotsIdentifyRequest.setFcn(fcn);
        honeypotsIdentifyRequest.setChaincodeID(chaincodeID);
        honeypotsIdentifyRequest.setProposalWaitTime(proposalWaitTime);

        Map<String, byte[]> tm2 = new HashMap<>();
        tm2.put("HyperledgerFabric", "QueryByChaincodeRequest:JavaSDK".getBytes(UTF_8));
        tm2.put("method", "QueryByChaincodeRequest".getBytes(UTF_8));
        honeypotsIdentifyRequest.setTransientMap(tm2);
        Collection<ProposalResponse> honeypotsResponses = org.getChannel().get().queryByChaincode(honeypotsIdentifyRequest, org.getChannel().get().getPeers());
        return toPeerResponse(honeypotsResponses, true);
    }

    /**
     * query chaincode for nids
     * @param org
     * @param fcn
     * @param args
     */
    Map<String, String> nidsIdentify(TempOrg org, String fcn, String[] args) throws InvalidArgumentException, ProposalException {
        QueryByChaincodeRequest nidsIdentifyRequest = org.getClient().newQueryProposalRequest();
        nidsIdentifyRequest.setArgs(args);
        nidsIdentifyRequest.setFcn(fcn);
        nidsIdentifyRequest.setChaincodeID(chaincodeID);
        nidsIdentifyRequest.setProposalWaitTime(proposalWaitTime);

        Map<String, byte[]> tm2 = new HashMap<>();
        tm2.put("HyperledgerFabric", "QueryByChaincodeRequest:JavaSDK".getBytes(UTF_8));
        tm2.put("method", "QueryByChaincodeRequest".getBytes(UTF_8));
        nidsIdentifyRequest.setTransientMap(tm2);
        long cStart = System.currentTimeMillis();
        Collection<ProposalResponse> nidsResponses = org.getChannel().get().queryByChaincode(nidsIdentifyRequest, org.getChannel().get().getPeers());
        log.info("Identify for nids dataset processing time cost = " + (System.currentTimeMillis() - cStart));
        return toPeerResponse(nidsResponses, true);
    }

    /**
     * query chaincode for gtmw
     * @param org
     * @param fcn
     * @param args
     */
    Map<String, String> gtmwIdentify(TempOrg org, String fcn, String[] args) throws InvalidArgumentException, ProposalException {
        QueryByChaincodeRequest gtmwIdentifyRequest = org.getClient().newQueryProposalRequest();
        gtmwIdentifyRequest.setArgs(args);
        gtmwIdentifyRequest.setFcn(fcn);
        gtmwIdentifyRequest.setChaincodeID(chaincodeID);
        gtmwIdentifyRequest.setProposalWaitTime(proposalWaitTime);

        Map<String, byte[]> tm2 = new HashMap<>();
        tm2.put("HyperledgerFabric", "QueryByChaincodeRequest:JavaSDK".getBytes(UTF_8));
        tm2.put("method", "QueryByChaincodeRequest".getBytes(UTF_8));
        gtmwIdentifyRequest.setTransientMap(tm2);
        //long cStart = System.currentTimeMillis();
        Collection<ProposalResponse> gtmwResponses = org.getChannel().get().queryByChaincode(gtmwIdentifyRequest, org.getChannel().get().getPeers());
        //log.info("Identify for gtmw dataset processing time cost = " + (System.currentTimeMillis() - cStart));
        return toPeerResponse(gtmwResponses, true);
    }

    /**
     * get returned set
     * @param proposalResponses
     * @param org
     */
    private Map<String, String> toOrdererResponse(Collection<ProposalResponse> proposalResponses, TempOrg org) throws InvalidArgumentException,
            UnsupportedEncodingException, InterruptedException, ExecutionException, TimeoutException {
        Map<String, String> resultMap = new HashMap<>();
        Collection<ProposalResponse> successful = new LinkedList<>();
        Collection<ProposalResponse> failed = new LinkedList<>();
        for (ProposalResponse response : proposalResponses) {
            if(response.getStatus() == ProposalResponse.Status.SUCCESS){
                successful.add(response);
            }else {
                failed.add(response);
            }
        }
        Collection<Set<ProposalResponse>> proposalConsistencySets = SDKUtils.getProposalConsistencySets(proposalResponses);
        if(proposalConsistencySets.size() != 1){
            log.error("Expected only one set of consistent proposal responses but got " + proposalConsistencySets.size());
        }
        if(failed.size() > 0){
            ProposalResponse firstTransactionProposalResponse =  failed.iterator().next();
            log.error("Not enough endorsers for inspect: " + failed.size() + " endorser error: " + firstTransactionProposalResponse.getMessage()
                    + ". Was verified: " + firstTransactionProposalResponse.isVerified());
            resultMap.put("code", "error");
            resultMap.put("data", firstTransactionProposalResponse.getMessage());
            return resultMap;
        }else {
            log.info("Successfully received transaction proposal responses.");
            ProposalResponse resp = proposalResponses.iterator().next();
            log.debug("TransactionID: " + resp.getTransactionID());
            byte[] x = resp.getChaincodeActionResponsePayload();
            String resultAsString = null;
            if(x != null){
                //resultAsString = new String(x, "UTF-8");
                resultAsString = "successful";
            }
            log.info("resultAsString = " + resultAsString);

            // Send transaction to orderer.
            org.getChannel().get().sendTransaction(successful).get(transactionWaitTime, TimeUnit.SECONDS);
            resultMap.put("code", "success");
            resultMap.put("data", resultAsString);
            resultMap.put("txid", resp.getTransactionID());
            return resultMap;
        }
    }

    /**
     * @param proposalResponses
     * @param checkVerified
     */
    private Map<String, String> toPeerResponse(Collection<ProposalResponse> proposalResponses, boolean checkVerified){
        Map<String, String> resultMap = new HashMap<>();
        for (ProposalResponse proposalResponse : proposalResponses){
            if((checkVerified && !proposalResponse.isVerified()) || proposalResponse.getStatus() != ProposalResponse.Status.SUCCESS){
                String data = String.format("Failed install/query proposal from peer %s status: %s. Messages: %s. Was verified : %s",
                        proposalResponse.getPeer().getName(), proposalResponse.getStatus(), proposalResponse.getMessage(), proposalResponse.isVerified());
                log.debug(data);
                resultMap.put("code", "error");
                resultMap.put("data", data);
                try{
                    byte[] signatureE = SignVerify.generateSignature(SignVerify.generateSignKeyPair().getPrivate(), Integer.toString(data.hashCode()).getBytes());
                    resultMap.put("signature", new String(Base64.encodeBase64(signatureE)));
                } catch (Exception e){
                    e.printStackTrace();
                }
            }else {
                //System.out.println("===> 2");
                String payload = proposalResponse.getProposalResponse().getResponse().getPayload().toStringUtf8();
                //log.debug("Install/Query payload from peer: " + proposalResponse.getPeer().getName());
                //log.debug("TransactionID: " + proposalResponse.getTransactionID());
                log.info("payload: " + payload);
                resultMap.put("code", "success");
                byte[] signature;
                if(payload == null){
                    //log.info("payload is null");
                    resultMap.put("data", "no available result.");
                    resultMap.put("signature", null);
                }else {
                    try{
                        //System.out.println("message to sign: " + payload);
                        //System.out.println("message to sign (base64): " + new String(Base64.encodeBase64(payload.getBytes())));

                        /* For demo purpose, we manually modify the query result*/
                        //String modifiedPayload = payload + "---modified---";
                        //signature = SignVerify.generateSignature(SignVerify.generateSignKeyPair().getPrivate(), modifiedPayload.getBytes());

                        // get hash value of payload
                        //String payloadHash = Hashing.sha256().hashString(payload, UTF_8).toString();

                        //System.out.println("payload Hash: " + Integer.toString(payload.hashCode()));

                        // Generate signature
                        signature = SignVerify.generateSignature(SignVerify.generateSignKeyPair().getPrivate(), Integer.toString(payload.hashCode()).getBytes());
                        //System.out.println("signature base64: " + new String(Base64.encodeBase64(signature)));
                        resultMap.put("signature", new String(Base64.encodeBase64(signature)));
                        //log.info("signature: " + resultMap.get("signature"));
                    }catch (Exception e){
                        e.printStackTrace();
                    }
                    resultMap.put("data", payload);
                }
                resultMap.put("txid", proposalResponse.getTransactionID());
            }
        }
        return resultMap;
    }

    Map<String, String> replicate(TempOrg org, String fcn, String datasetName, String dayTime) throws IOException, InvalidArgumentException, ProposalException {
        // In SDK: src/main/java/org/hyperledger/fabric/sdk/helper/Config.java
        //TODO: currently it is static to replicate data to all peers
        Map<String, String> resultMap = new HashMap<>();
        String[] datasetBlockArgs = new String[2];// the value will be updated to ledger as key-value, so the length is 2.
        long loadDatasetStart = new Date().getTime();
        log.info("Start to load dataset " + datasetName + " at " + loadDatasetStart);
        ArrayList<JSONObject> datasetBlocks;
        String graphNum = "";
        if (datasetName.split("-")[0].equals("honeypots")) {
            datasetBlocks = HoneypotsDatasetToChain.ImportCSV(dayTime, datasetName);
        } else if (datasetName.split("-")[0].equals("nids")) {
            graphNum = datasetName.split("\\.")[0].split("-")[2]; // get graph number: g1
            // For NIDS, there is a graph number as the parameter.
            if (graphNum.equals("g1")) {
                graphNum = "G1";
            } else if (graphNum.equals("g2")) {
                graphNum = "G2";
            } else if (graphNum.equals("g3")) {
                graphNum = "G3";
            } else {
                log.error("Graph number cannot be found from the input dataset");
            }
            datasetBlocks = NIDSDatasetToChain.ImportCSV(dayTime, datasetName, graphNum);
        } else if (datasetName.split("-")[0].equals("gtmw")) {
            datasetBlocks = GTMWDatasetToChain.ImportCSV(dayTime, datasetName);
        } else {
            datasetBlocks = new ArrayList<>();
            log.error("datasetName is null, please specify honeypots, nids or gtmw");
        }

        // update the block number of dataset
        if (datasetName.split("-")[0].equals("nids")) {
            datasetBlockArgs[0] = "nids-" + graphNum + "-" + dayTime;
        } else {
            datasetBlockArgs[0] = datasetName.split("\\.")[0];
        }
        datasetBlockArgs[1] = Integer.toString(datasetBlocks.size());
        try {
            invoke(org, fcn, datasetBlockArgs);
        } catch (Exception e) {
            e.printStackTrace();
        }

        long replicateDatasetStart;
        long replicateDatasetEnd;
        replicationWorker[] replicationWorkers = new replicationWorker[datasetBlocks.size()];
        for (int i = 0; i < datasetBlocks.size(); i++){
            String[] args = new String[2];// the value will be updated to ledger as key-value, so the length is 2.
            String dayTimeAnddatasetBlockNumber = datasetBlocks.get(i).get("daypoint").toString();
            args[0] = datasetName.split("\\.")[0].split("-")[0] + "-" + dayTimeAnddatasetBlockNumber;
            args[1] = datasetBlocks.get(i).toJSONString(); // Import(daytime, datasetName)
            replicationWorkers[i] = new replicationWorker(org, fcn, args, chaincodeID, datasetBlocks.size());
        }
        List<replicationWorker> allDatasetBlocks = Arrays.asList(replicationWorkers);
        Executor executor = Executors.newFixedThreadPool(8,
                new ThreadFactory() {
                    @Override
                    public Thread newThread(Runnable r) {
                        Thread thread = new Thread(r);
                        thread.setDaemon(true);
                        return thread;
                    }
                });
        replicateDatasetStart = System.nanoTime();
        // Pass the Executor as the second parameter to supplyAsync Factory method
        List<CompletableFuture<Map<String, String>>> futures = allDatasetBlocks.stream()
                .map(dataBlock -> CompletableFuture.supplyAsync(
                        () -> dataBlock.replicateStart(), executor)
                )
                .collect(Collectors.toList());
        List<Map<String, String>> list = futures.stream()
                .map(CompletableFuture::join)
                .collect(Collectors.toList());
        resultMap = list.get(list.size() - 1);
        replicateDatasetEnd = System.nanoTime();
        DecimalFormat df = new DecimalFormat("0.00");
        long totalReplicationTime = (replicateDatasetEnd -replicateDatasetStart) / 1000000;
        log.info("Time cost for replication is: " + totalReplicationTime + " ms");
        if (datasetName.split("-")[0].equals("honeypots")){
            log.info("The throughput of replicating data is: " + df.format(HoneypotsDatasetToChain.fileSize / totalReplicationTime) + " KB/s");
        } else if(datasetName.split("-")[0].equals("nids")){
            log.info("The throughput of replicating data is: " + df.format(NIDSDatasetToChain.fileSize / totalReplicationTime) + " KB/s");
        } else if(datasetName.split("-")[0].equals("gtmw")){
            log.info("The throughput of replicating data is: " + df.format(GTMWDatasetToChain.fileSize / totalReplicationTime) + " KB/s");
        }else {
            log.info("Cannot find proper channel to calculate the throughput.");
        }
        return resultMap;
    }
    /**
     * set proposal request timeout by us.
     * @param proposalWaitTime
     */
    void setProposalWaitTime(int proposalWaitTime){
        this.proposalWaitTime = proposalWaitTime;
    }

    /**
     * @param invokeWaitTime
     */
    void setTransactionWaitTime(int invokeWaitTime){
        this.transactionWaitTime = invokeWaitTime;
    }
}