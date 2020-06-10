package b2csm.fabricCore;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hyperledger.fabric.sdk.ChaincodeID;
import org.hyperledger.fabric.sdk.ProposalResponse;
import org.hyperledger.fabric.sdk.SDKUtils;
import org.hyperledger.fabric.sdk.TransactionProposalRequest;
import org.hyperledger.fabric.sdk.exception.InvalidArgumentException;
import org.hyperledger.fabric.sdk.exception.ProposalException;

import java.text.DecimalFormat;
import java.util.*;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static java.nio.charset.StandardCharsets.UTF_8;

public class replicationWorker {

    private static final Log log = LogFactory.getLog(replicationWorker.class);

    private TempOrg org;
    private String fcn;
    private String[] args;
    private ChaincodeID chaincodeID;
    private int proposalWaitTime = 2000000;
    private int transactionWaitTime = 120;
    //private long fileSize;
    private int totalDataBlocks;
    private Map<String, String> resultMap;

    public replicationWorker(TempOrg org, String fcn, String[] args, ChaincodeID chaincodeID, int totalDataBlocks){
        this.org = org;
        this.fcn = fcn;
        this.args = args;
        this.chaincodeID = chaincodeID;
        //this.fileSize = fileSize;
        this.totalDataBlocks = totalDataBlocks;
        resultMap = new HashMap<>();
    }

    public Map<String, String> replicateStart(){
        try{
            Collection<ProposalResponse> successful = new LinkedList<>();
            Collection<ProposalResponse> failed = new LinkedList<>();
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

            // test multiple transactions
            long startTime = new Date().getTime();
            Collection<ProposalResponse> transactionProposalResponses = org.getChannel().get().sendTransactionProposal(transactionProposalRequest,
                    org.getChannel().get().getPeers());
            // to OrdererResponse
            for (ProposalResponse response : transactionProposalResponses) {
                if(response.getStatus() == ProposalResponse.Status.SUCCESS){
                    successful.add(response);
                }else {
                    failed.add(response);
                }
            }
            Collection<Set<ProposalResponse>> proposalConsistencySets = SDKUtils.getProposalConsistencySets(transactionProposalResponses);
            if(proposalConsistencySets.size() != 1){
                log.error("Expected only one set of consistent proposal responses but got " + proposalConsistencySets.size());
            }
            if(failed.size() > 0){
                ProposalResponse firstTransactionProposalResponse =  failed.iterator().next();
                log.error("Not enough endorsers for inspect: " + failed.size() + " endorser error: " + firstTransactionProposalResponse.getMessage()
                        + ". Was verified: " + firstTransactionProposalResponse.isVerified());
                resultMap.put("code", "error");
                resultMap.put("data", firstTransactionProposalResponse.getMessage());
                //return resultMap;
            }else {
                //log.info("Successfully received transaction proposal responses.");
                ProposalResponse resp = transactionProposalResponses.iterator().next();
                //log.debug("TransactionID: " + resp.getTransactionID());
                byte[] x = resp.getChaincodeActionResponsePayload();
                String resultAsString = null;
                if(x != null){
                    try{
                        resultAsString = new String(x, "UTF-8");
                        //resultAsString = "successful";
                    }catch (Exception e){
                        e.printStackTrace();
                    }
                }

                // Send transaction to orderer.
                org.getChannel().get().sendTransaction(successful).get(transactionWaitTime, TimeUnit.SECONDS);
                long EndTime = new Date().getTime();
                long timeCost = EndTime - startTime;
                log.info("== For " + args[0] + "/" + (totalDataBlocks - 1) + ", Time Cost: " + timeCost + " ms");
                resultMap.put("code", "success");
                resultMap.put("data", resultAsString);
                resultMap.put("txid", resp.getTransactionID());
                //return resultMap;
            }
        }catch (InvalidArgumentException invalidArgumentException){
            invalidArgumentException.printStackTrace();
        }catch (ProposalException proposalException){
            proposalException.printStackTrace();
        }catch (InterruptedException interruptedException){
            interruptedException.printStackTrace();
        }catch (ExecutionException exeException){
            exeException.printStackTrace();
        }catch (TimeoutException timeoutException){
            timeoutException.printStackTrace();
        }
        return resultMap;
    }
}
