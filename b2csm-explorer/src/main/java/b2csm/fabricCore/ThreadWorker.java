package b2csm.fabricCore;

import b2csm.utility.FileOperation;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.hyperledger.fabric.sdk.ChaincodeID;
import org.hyperledger.fabric.sdk.ProposalResponse;
import org.hyperledger.fabric.sdk.SDKUtils;
import org.hyperledger.fabric.sdk.TransactionProposalRequest;
import org.hyperledger.fabric.sdk.exception.InvalidArgumentException;
import org.hyperledger.fabric.sdk.exception.ProposalException;

import java.io.IOException;
import java.util.*;
import java.util.concurrent.Callable;
import java.util.concurrent.ExecutionException;
import java.util.concurrent.TimeUnit;
import java.util.concurrent.TimeoutException;

import static java.nio.charset.StandardCharsets.UTF_8;


public class ThreadWorker implements Callable<Map<String,String>> {

    private static final Log log = LogFactory.getLog(ThreadWorker.class);

    private TempOrg org;
    private String fcn;
    private String[] args;
    private ChaincodeID chaincodeID;
    private int threadID;
    private int proposalWaitTime = 2000000;
    private int transactionWaitTime = 120;

    ThreadWorker(TempOrg org, String fcn, String[] args, ChaincodeID chaincodeID){
        this.org = org;
        this.fcn = fcn;
        this.args = args;
        this.chaincodeID = chaincodeID;
        this.threadID = 0;
    }

    public void setThreadParam(TempOrg org, String fcn, String[] args, ChaincodeID chaincodeID, int threadID){
        this.org = org;
        this.fcn = fcn;
        this.args = args;
        this.chaincodeID = chaincodeID;
        this.threadID = threadID;
    }

    @Override
    public Map<String, String> call() throws Exception {
        //log.info("Start Thread - " + Thread.currentThread().getName() + " params: org: " + org + ", fcn: " + fcn + ", args: " + args + ", chaincodeID: " + chaincodeID);
        Map<String, String> resultMap = new HashMap<>();
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
            long startTime = System.currentTimeMillis();
            FileOperation.write("result.txt", "\n Thread: " + threadID +  ", Start: " + startTime + "\n");
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
            }else {
                ProposalResponse resp = transactionProposalResponses.iterator().next();
                byte[] x = resp.getChaincodeActionResponsePayload();
                String resultAsString = null;
                if(x != null){
                    resultAsString = new String(x, "UTF-8");
                }
                // Send transaction to orderer.
                org.getChannel().get().sendTransaction(successful).get(transactionWaitTime, TimeUnit.SECONDS);
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
    }// end of call()
}

