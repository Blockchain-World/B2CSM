package b2csm.fabricCore;

import org.hyperledger.fabric.sdk.HFClient;
import org.hyperledger.fabric.sdk.helper.Utils;

import javax.annotation.Nonnull;
import java.io.File;
import java.util.LinkedHashMap;
import java.util.Map;
import java.util.Set;

public class OrgManager {

    private Map<String, TempOrg> orgMap;
    private String orgName;

    public OrgManager(){
        orgMap = new LinkedHashMap<>();
    }

    /**
     * @param orgName
     * @return self
     */
    public OrgManager init(String orgName){
        this.orgName = orgName;
        if(orgMap.get(orgName) != null){
            throw new RuntimeException(String.format("OrgManager had the same name of %s", orgName));
        }else {
            orgMap.put(orgName, new TempOrg());
        }
        return this;
    }

    /**
     * set CA request http url
     * @param caName
     * @param caLocation
     * @return self
     */
    public OrgManager setCA(String caName, String caLocation){
        orgMap.get(orgName).setCaName(caName);
        orgMap.get(orgName).setCaLocation(caLocation);
        return this;
    }

    /**
     * @param username
     * @param cryptoConfigPath
     * @param channelArtifactsPath
     * @return self
     */
    public OrgManager setUser(@Nonnull String username, @Nonnull String cryptoConfigPath, String channelArtifactsPath){
        orgMap.get(orgName).setUsername(username);
        orgMap.get(orgName).setCryptoConfigPath(cryptoConfigPath);
        orgMap.get(orgName).setChannelArtifactsPath(channelArtifactsPath);
        return this;
    }

    /**
     * set registered user
     * @param username
     * @param password
     * @param affiliation
     * @param roles
     * @param cryptoConfigPath
     * @return self
     */
    public OrgManager setUser(@Nonnull String username, @Nonnull String password, String affiliation,
                              Set<String> roles, @Nonnull String cryptoConfigPath){
        orgMap.get(orgName).setUsername(username);
        orgMap.get(orgName).setPassword(password);
        orgMap.get(orgName).setAffiliation(affiliation);
        orgMap.get(orgName).setRoles(roles);
        orgMap.get(orgName).setCryptoConfigPath(cryptoConfigPath);
        return this;
    }

    public OrgManager setOrderers(String ordererDomainName){
        orgMap.get(orgName).setOrdererDomainName(ordererDomainName);
        return this;
    }

    public OrgManager addOrderer(String name, String location){
        orgMap.get(orgName).addOrderer(name, location);
        return this;
    }

    public OrgManager setPeers(String orgMSPID, String orgDomainName){
        orgMap.get(orgName).setOrgName(orgName);
        orgMap.get(orgName).setOrgMSPID(orgMSPID);
        orgMap.get(orgName).setOrgDomainName(orgDomainName);
        return this;
    }

    public OrgManager addPeer(String peerName, String peerEventHubName, String peerLocation, String peerEventHubLocation, boolean isEventListener){
        orgMap.get(orgName).addPeer(peerName, peerEventHubName, peerLocation, peerEventHubLocation, isEventListener);
        return this;
    }

    /**
     * @param chaincodeName
     * @param chaincodeSource
     * @param chaincodePath
     * @param chaincodeVersion
     * @param proposalWaitTime
     * @param invokeWaitTime
     * @return Fabric
     */
    public OrgManager setChainCode(String chaincodeName, String chaincodeSource, String chaincodePath,
                                   String chaincodeVersion, int proposalWaitTime, int invokeWaitTime){
        TempChaincodeID chaincode = new TempChaincodeID();
        chaincode.setChaincodeName(chaincodeName);
        chaincode.setChaincodeSource(chaincodeSource);
        chaincode.setChaincodePath(chaincodePath);
        chaincode.setChaincodeVersion(chaincodeVersion);
        chaincode.setProposalWaitTime(proposalWaitTime);
        chaincode.setTransactionWaitTime(invokeWaitTime);
        orgMap.get(orgName).setChainCode(chaincode);
        return this;
    }

    /**
     * set channel
     * @param channelName
     * @return Fabric
     */
    public OrgManager setChannel(String channelName){
        TempChannel channel = new TempChannel();
        channel.setChannelName(channelName);
        orgMap.get(orgName).setChannel(channel);
        return this;
    }

    /**
     * set if open TLS
     * @param openTLS
     */
    public OrgManager openTLS(boolean openTLS){
        orgMap.get(orgName).openTLS(openTLS);
        return this;
    }

    /**
     * set if open CA TLS
     * @param openCATLS
     */
    public OrgManager openCATLS(boolean openCATLS){
        orgMap.get(orgName).openCATLS(openCATLS);
        return this;
    }

    /**
     * set listener event
     * @param blockListener
     */
    public OrgManager setBlockListener(BlockListener blockListener){
        orgMap.get(orgName).setBlockListener(blockListener);
        return this;
    }

    public void add(){
        if(orgMap.get(orgName).getPeers().size() == 0){
            throw new RuntimeException("peers is null or peers size is 0");
        }
        if(orgMap.get(orgName).getOrderers().size() == 0){
            throw new RuntimeException("orderers is null or orderers size is 0");
        }
        if(orgMap.get(orgName).getChainCode() == null){
            throw new RuntimeException("chaincode must be instantiated");
        }

        // based on TLS open state, check peers' grpc service
        for (int i = 0; i < orgMap.get(orgName).getPeers().size(); i++){
            orgMap.get(orgName).getPeers().get(i).setPeerLocation(grpcTLSify(orgMap.get(orgName).openTLS(),
                    orgMap.get(orgName).getPeers().get(i).getPeerLocation()));
            orgMap.get(orgName).getPeers().get(i).setPeerEventHubLocation(grpcTLSify(orgMap.get(orgName).openTLS(),
                    orgMap.get(orgName).getPeers().get(i).getPeerEventHubLocation()));
        }

        // based on TLS open state, check orderers grpc service
        for (int i = 0; i < orgMap.get(orgName).getOrderers().size(); i++){
            orgMap.get(orgName).getOrderers().get(i).setOrdererLocation(grpcTLSify(orgMap.get(orgName).openTLS(),
                    orgMap.get(orgName).getOrderers().get(i).getOrdererLocation()));
        }

        // based on CA TLS state, check CA http service
        orgMap.get(orgName).setCaLocation(httpTLSify(orgMap.get(orgName).openCATLS(), orgMap.get(orgName).getCALocation()));
    }

    public FabricManager use(String orgName) throws Exception{
        TempOrg org = orgMap.get(orgName);
        File storeFile = new File(System.getProperty("java.io.tmpdir") + "/HFCStore" + orgName + ".properties");
        FabricStore fabricStore = new FabricStore(storeFile);
        org.init(fabricStore);
        org.setClient(HFClient.createNewInstance());
        org.getChannel().init(org);
        return new FabricManager(org);
    }

    private String grpcTLSify(boolean openTLS, String location){
        location = location.trim();
        Exception e = Utils.checkGrpcUrl(location);
        if(e != null){
            throw new RuntimeException(String.format("Bad TEST parameters for grpc url %s", location), e);
        }
        return openTLS ? location.replaceFirst("^grpc://", "grpcs://") : location;
    }

    private String httpTLSify(boolean openCATLS, String location){
        location = location.trim();
        return openCATLS ? location.replaceFirst("^http://", "https://") : location;
    }
}
