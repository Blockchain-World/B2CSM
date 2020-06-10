package b2csm.fabricCore;


import com.alibaba.fastjson.JSONArray;
import com.alibaba.fastjson.JSONObject;
import org.apache.commons.codec.binary.Hex;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hyperledger.fabric.protos.ledger.rwset.kvrwset.KvRwset;
import org.hyperledger.fabric.sdk.*;
import org.hyperledger.fabric.sdk.exception.InvalidArgumentException;
import org.hyperledger.fabric.sdk.exception.ProposalException;
import org.hyperledger.fabric.sdk.exception.TransactionException;

import java.io.File;
import java.io.IOException;
import java.nio.file.Paths;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;
import java.util.concurrent.TimeUnit;
import static java.nio.charset.StandardCharsets.UTF_8;

public class TempChannel {

    private static final Log log = LogFactory.getLog(TempChannel.class);

    private String channelName;
    private TempOrg org;
    private Channel channel;

    void init(TempOrg org) throws TransactionException, InvalidArgumentException{
        this.org = org;
        setChannel(org.getClient());
    }

    private void setChannel(HFClient client) throws InvalidArgumentException, TransactionException{
        client.setUserContext(org.getUser("Admin"));
        channel = client.newChannel(channelName);
        log.debug("Get Chain " + channelName);

        int sizeOrders = org.getOrderers().size();
        for (int i = 0; i < sizeOrders; i++) {
            File ordererCert = Paths.get(org.getCryptoConfigPath(), "/ordererOrganizations",
                    org.getOrdererDomainName(), "orderers", org.getOrderers().get(i).getOrdererName(), "tls/server.crt").toFile();
            if (!ordererCert.exists()) {
                throw new RuntimeException(String.format("Missing cert file for: %s. Could not find at location: %s",
                        org.getOrderers().get(i).getOrdererName(), ordererCert.getAbsolutePath()));
            }
            Properties ordererProperties = new Properties();
            ordererProperties.setProperty("pemFile", ordererCert.getAbsolutePath());
            ordererProperties.setProperty("hostnameOverride", org.getOrderers().get(i).getOrdererName());
            ordererProperties.setProperty("sslProvider", "openSSL");
            ordererProperties.setProperty("negotiationType", "TLS");
            ordererProperties.put("grpc.ManagedChannelBuilderOption.maxInboundMessageSize", 9000000);
            ordererProperties.put("grpc.NettyChannelBuilderOption.keepAliveTime", new Object[]{5L, TimeUnit.MINUTES});
            ordererProperties.put("grpc.NettyChannelBuilderOption.keepAliveTimeout", new Object[]{8L, TimeUnit.SECONDS});
            channel.addOrderer(client.newOrderer(org.getOrderers().get(i).getOrdererName(),
                    org.getOrderers().get(i).getOrdererLocation(), ordererProperties));
        }
            int sizePeer = org.getPeers().size();
            for (int i = 0; i < sizePeer; i++){
                File peerCert = Paths.get(org.getCryptoConfigPath(), "/peerOrganizations",
                        org.getOrgDomainName(), "peers", org.getPeers().get(i).getPeerName(), "tls/server.crt").toFile();
                if(!peerCert.exists()){
                    throw new RuntimeException(String.format("Missing cert file for: %s. Could not find at location: %s",
                            org.getPeers().get(i).getPeerName(), peerCert.getAbsolutePath()));
                }
                Properties peerProperties = new Properties();
                peerProperties.setProperty("pemFile", peerCert.getAbsolutePath());
                peerProperties.setProperty("hostnameOverride", org.getPeers().get(i).getPeerName());
                peerProperties.setProperty("sslProvider", "openSSL");
                peerProperties.setProperty("negotiationType", "TLS");
                peerProperties.put("grpc.ManagedChannelBuilderOption.maxInboundMessageSize", 9000000);
                channel.addPeer(client.newPeer(org.getPeers().get(i).getPeerName(), org.getPeers().get(i).getPeerLocation(),peerProperties));
                if(org.getPeers().get(i).isAddEventHub()){
                    channel.addEventHub(client.newEventHub(org.getPeers().get(i).getPeerEventHubName(),
                            org.getPeers().get(i).getPeerEventHubLocation(), peerProperties));
                }
            }
            log.debug("channel.isInitialized() = " + channel.isInitialized());
            if(!channel.isInitialized()){
                channel.initialize();
            }
            if(null != org.getBlockListener()){
                channel.registerBlockListener(blockEvent -> {
                    try{
                        org.getBlockListener().received(execBlockInfo(blockEvent));
                    }catch (Exception e){
                        e.printStackTrace();
                        org.getBlockListener().received(getFailFromString(e.getMessage()));
                    }
                });
            }
    }

    Channel get(){
        return channel;
    }

    void setChannelName(String channelName){
        this.channelName = channelName;
    }

    /**
     * Peer join channel
     * @param peer
     */
    Map<String, String> joinPeer(TempPeer peer) throws InvalidArgumentException, ProposalException{
        File peerCert = Paths.get(org.getCryptoConfigPath(), "/peerOrganizations", org.getOrgDomainName(),
                "peers", peer.getPeerName(), "tls/server.crt").toFile();
        if (!peerCert.exists()){
            throw new RuntimeException(String.format("Missing cert file for: %s. Could not find at location: %s",
                    peer.getPeerName(), peerCert.getAbsolutePath()));
        }
        Properties peerProperties = new Properties();
        peerProperties.setProperty("pemFile", peerCert.getAbsolutePath());
        peerProperties.setProperty("hostnameOverride", peer.getPeerName());
        peerProperties.setProperty("sslProvider", "openSSL");
        peerProperties.setProperty("negotiationType", "TLS");
        peerProperties.put("grpc.ManagedChannelBuilderOption.maxInboundMessageSize", 9000000);

        Peer fabricPeer = org.getClient().newPeer(peer.getPeerName(), peer.getPeerLocation(), peerProperties);
        for (Peer peerNow : channel.getPeers()){
            if(peerNow.getUrl().equals(fabricPeer.getUrl())){
                return getFailFromString("peer has already in channel");
            }
        }
        channel.joinPeer(fabricPeer);
        if(peer.isAddEventHub()){
            channel.addEventHub(org.getClient().newEventHub(peer.getPeerEventHubName(), peer.getPeerEventHubLocation(), peerProperties));
        }
        return getSuccessFromString("peer join channel successfully!");
    }

    private Map<String, String> getSuccessFromString(String data){
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("code", "success");
        resultMap.put("data", data);
        return resultMap;
    }

    private Map<String, String> getFailFromString(String data){
        Map<String, String> resultMap = new HashMap<>();
        resultMap.put("code", "error");
        resultMap.put("data", data);
        return resultMap;
    }

    Map<String, String> getBlockchainInfo() throws InvalidArgumentException, ProposalException {
        JSONObject blockchainInfo = new JSONObject();
        blockchainInfo.put("height", channel.queryBlockchainInfo().getHeight());
        blockchainInfo.put("currentBlockHash", Hex.encodeHexString(channel.queryBlockchainInfo().getCurrentBlockHash()));
        blockchainInfo.put("previousBlockHash", Hex.encodeHexString(channel.queryBlockchainInfo().getPreviousBlockHash()));
        return getSuccessFromString(blockchainInfo.toString());
    }

    /**
     * query block by transaction ID within a specified channel
     * @param txID
     */
    Map<String, String> queryBlockByTransactionID(String txID) throws InvalidArgumentException, ProposalException, IOException {
        return execBlockInfo(channel.queryBlockByTransactionID(txID));
    }

    /**
     * query block by hash in a channel
     * @param blockHash
     */
    Map<String, String> queryBlockByHash(byte[] blockHash) throws InvalidArgumentException, ProposalException, IOException{
        return execBlockInfo(channel.queryBlockByHash(blockHash));
    }

    /**
     * query block by height in channel
     * @param blockNumber
     */
    Map<String, String> queryBlockByNumber(long blockNumber) throws InvalidArgumentException, ProposalException, IOException{
        return execBlockInfo(channel.queryBlockByNumber(blockNumber));
    }

    /**
     * parse block information
     * @param blockInfo
     */
    private Map<String, String> execBlockInfo(BlockInfo blockInfo) throws IOException, InvalidArgumentException{
        final long blockNumber = blockInfo.getBlockNumber();
        JSONObject blockJson = new JSONObject();
        blockJson.put("blockNumber", blockNumber);
        blockJson.put("dataHash", Hex.encodeHexString(blockInfo.getDataHash()));
        blockJson.put("previousHashID", Hex.encodeHexString(blockInfo.getPreviousHash()));
        blockJson.put("calculateBlockHash", Hex.encodeHexString(SDKUtils.calculateBlockHash(org.getClient(),
                blockNumber, blockInfo.getPreviousHash(), blockInfo.getDataHash())));
        blockJson.put("envelopeCount", blockInfo.getEnvelopeCount());

        log.debug("blockNumber = " + blockNumber);
        log.debug("data hash: " + Hex.encodeHexString(blockInfo.getDataHash()));
        log.debug("previous hash id: " + Hex.encodeHexString(blockInfo.getPreviousHash()));
        log.debug("calculated block hash is " + Hex.encodeHexString(SDKUtils.calculateBlockHash(org.getClient(), blockNumber, blockInfo.getPreviousHash(),blockInfo.getDataHash())));
        log.debug("block number " + blockNumber + " has " + blockInfo.getEnvelopeCount() + " envelope count.");

        JSONArray envelopeJsonArray = new JSONArray();
        for (BlockInfo.EnvelopeInfo info : blockInfo.getEnvelopeInfos()){
            JSONObject envelopeJson = new JSONObject();
            envelopeJson.put("channelId", info.getChannelId());
            envelopeJson.put("transactionId", info.getTransactionID());
            envelopeJson.put("validationCode", info.getValidationCode());
            envelopeJson.put("timestamp", Utils.parseDateFormat(new Date(info.getTimestamp().getTime())));
            envelopeJson.put("type", info.getType());
            envelopeJson.put("createdId", info.getCreator().getId());
            envelopeJson.put("createMSPID", info.getCreator().getMspid());
            envelopeJson.put("isValid", info.isValid());
            envelopeJson.put("nonce", Hex.encodeHexString(info.getNonce()));

            log.debug("channelId = " + info.getChannelId());
            log.debug("nonce = " + Hex.encodeHexString(info.getNonce()));
            log.debug("createId = " + info.getCreator().getId());
            log.debug("createMSPID = " + info.getCreator().getMspid());
            log.debug("isValid = " + info.isValid());
            log.debug("transactionID = " + info.getTransactionID());
            log.debug("validationCode = " + info.getValidationCode());
            log.debug("timestamp = " + Utils.parseDateFormat(new Date(info.getTimestamp().getTime())));
            log.debug("type = " + info.getType());

            if(info.getType() == BlockInfo.EnvelopeType.TRANSACTION_ENVELOPE){
                BlockInfo.TransactionEnvelopeInfo txeInfo = (BlockInfo.TransactionEnvelopeInfo) info;
                JSONObject transactionEnvelopeInfoJson = new JSONObject();
                int txCount = txeInfo.getTransactionActionInfoCount();
                transactionEnvelopeInfoJson.put("txCount", txCount);
                transactionEnvelopeInfoJson.put("isValid", txeInfo.isValid());
                transactionEnvelopeInfoJson.put("validationCode", txeInfo.getValidationCode());

                log.debug("Transaction number " + blockNumber + " has actions count = " + txCount);
                log.debug("Transaction number " + blockNumber + " isValid = " + txeInfo.isValid());
                log.debug("Transaction number " + blockNumber + " validation code = " + txeInfo.getValidationCode());

                JSONArray transactionActionInfoJsonArray = new JSONArray();
                for (int i = 0; i < txCount; i++){
                    BlockInfo.TransactionEnvelopeInfo.TransactionActionInfo txInfo = txeInfo.getTransactionActionInfo(i);
                    int endorsementsCount = txInfo.getEndorsementsCount();
                    int chaincodeInputArgsCount = txInfo.getChaincodeInputArgsCount();
                    JSONObject transactionActionInfoJson = new JSONObject();
                    transactionActionInfoJson.put("responseStatus", txInfo.getResponseStatus());
                    transactionActionInfoJson.put("responseMessageString", printableString(new String(txInfo.getResponseMessageBytes(), UTF_8)));
                    transactionActionInfoJson.put("endorsementsCount", endorsementsCount);
                    transactionActionInfoJson.put("chaincodeInputArgsCount", chaincodeInputArgsCount);
                    transactionActionInfoJson.put("status", txInfo.getProposalResponseStatus());
                    transactionActionInfoJson.put("payload", printableString(new String(txInfo.getProposalResponsePayload(), UTF_8)));

                    log.debug("Transaction action " + i + " has response status " + txInfo.getResponseStatus());
                    log.debug("Transaction action " + i + " has response message bytes as string: " +
                            printableString(new String(txInfo.getResponseMessageBytes(), UTF_8)));
                    log.debug("Transaction action " + i + " has endorsements " + endorsementsCount);

                    JSONArray endorserInfoJsonArray = new JSONArray();
                    for (int n = 0; n < endorsementsCount; ++n){
                        BlockInfo.EndorserInfo endorserInfo = txInfo.getEndorsementInfo(n);
                        String signature = Hex.encodeHexString(endorserInfo.getSignature());
                        String id = endorserInfo.getId();
                        String mspId = endorserInfo.getMspid();
                        JSONObject endorserInfoJson = new JSONObject();
                        endorserInfoJson.put("signature", signature);
                        endorserInfoJson.put("id", id);
                        endorserInfoJson.put("mspId", mspId);

                        log.debug("Endorser " + n + " signature: " + signature);
                        log.debug("Endorser " + n + " id: " + id);
                        log.debug("Endorser " + n + " mspId: " + mspId);
                        endorserInfoJsonArray.add(endorserInfoJson);
                    }

                    transactionActionInfoJson.put("endorserInfoArray", endorserInfoJsonArray);
                    log.debug("Transaction action " + i + " has " + chaincodeInputArgsCount + " chaincode input arguments");

                    JSONArray argJsonArray = new JSONArray();
                    for (int z = 0; z < chaincodeInputArgsCount; ++z){
                        argJsonArray.add(printableString(new String(txInfo.getChaincodeInputArgs(z), UTF_8)));
                        log.debug("Transaction action " + i + " has chaincode input argument " + z + "is: "
                                + printableString(new String(txInfo.getChaincodeInputArgs(z), UTF_8)));
                    }
                    transactionActionInfoJson.put("argArray", argJsonArray);
                    log.debug("Transaction action " + i + " proposal response status: " + txInfo.getProposalResponseStatus());
                    log.debug("Transaction action " + i + " proposal response payload: " + printableString(new String(txInfo.getProposalResponsePayload())));

                    TxReadWriteSetInfo rwsetInfo = txInfo.getTxReadWriteSet();
                    JSONObject rwsetInfoJson = new JSONObject();
                    if(null != rwsetInfo){
                        int nsRWsetCount = rwsetInfo.getNsRwsetCount();
                        rwsetInfoJson.put("nsRWsetCount", nsRWsetCount);
                        log.debug("Transaction action " + i + " has " + nsRWsetCount + " name space read write sets");

                        JSONArray nsRWsetInfoJsonArray = new JSONArray();
                        for (TxReadWriteSetInfo.NsRwsetInfo nsRwsetInfo : rwsetInfo.getNsRwsetInfos()){
                            final String namespace = nsRwsetInfo.getNamespace();
                            KvRwset.KVRWSet rws = nsRwsetInfo.getRwset();
                            JSONObject nsRwsetInfoJson = new JSONObject();

                            // Read Set
                            JSONArray readJsonArray = new JSONArray();
                            int rs = -1;
                            for (KvRwset.KVRead readList : rws.getReadsList()){
                                rs++;
                                String key = readList.getKey();
                                long readVersionBlockNum = readList.getVersion().getBlockNum();
                                long readVersionTxNum = readList.getVersion().getTxNum();
                                JSONObject readInfoJson = new JSONObject();
                                readInfoJson.put("namespace", namespace);
                                readInfoJson.put("readSetIndex", rs);
                                readInfoJson.put("key", key);
                                readInfoJson.put("readVersionBlockNum", readVersionBlockNum);
                                readInfoJson.put("readVersionTxNum", readVersionTxNum);
                                readInfoJson.put("version", String.format("[%s : %s]", readVersionBlockNum, readVersionTxNum));
                                readJsonArray.add(readInfoJson);
                                log.debug("Namespace: " + namespace + "\n read set index:" + rs + "\n key: " + key
                                        + "\n version: [" + readVersionBlockNum + " : " + readVersionTxNum + "]");
                            }
                            nsRwsetInfoJson.put("readSet", readJsonArray);

                            // Write Set
                            JSONArray writeJsonArray = new JSONArray();
                            rs = -1;
                            for (KvRwset.KVWrite writeList : rws.getWritesList()){
                                rs++;
                                String key = writeList.getKey();
                                String valAsString = printableString(new String(writeList.getValue().toByteArray(), UTF_8));
                                JSONObject writeInfoJson = new JSONObject();
                                writeInfoJson.put("namespace", namespace);
                                writeInfoJson.put("writeSetIndex", rs);
                                writeInfoJson.put("key", key);
                                writeInfoJson.put("value", valAsString);
                                writeJsonArray.add(writeInfoJson);
                                log.debug("Namespace: " + namespace + "\n write set index:" + rs + "\n key: " + key
                                        + " has value " + valAsString);
                            }
                            nsRwsetInfoJson.put("writeSet", writeJsonArray);
                            nsRWsetInfoJsonArray.add(nsRwsetInfoJson);
                        }
                        rwsetInfoJson.put("nsRwsetInfoArray", nsRWsetInfoJsonArray);
                    }
                    transactionActionInfoJson.put("rwsetInfo", rwsetInfoJson);
                    transactionActionInfoJsonArray.add(transactionActionInfoJson);
                }
                transactionEnvelopeInfoJson.put("transactionActionInfoArray", transactionActionInfoJsonArray);
                envelopeJson.put("transactionEnvelopeInfo", transactionEnvelopeInfoJson);
            }
            envelopeJsonArray.add(envelopeJson);
        }
        blockJson.put("envelopes", envelopeJsonArray);
        return getSuccessFromString(blockJson.toString());
    }

    private String printableString(final String string){
        int maxLogStringLength = 64;
        if(string == null || string.length() == 0){
            return string;
        }
        String ret = string.replaceAll("[^\\p{Print}]", "?");
        ret = ret.substring(0, Math.min(ret.length(), maxLogStringLength)) + (ret.length() > maxLogStringLength ? "..." : "");
        return ret;
    }

}

