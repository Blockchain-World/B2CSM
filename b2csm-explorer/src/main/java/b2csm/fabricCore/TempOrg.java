package b2csm.fabricCore;

import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.apache.http.util.Asserts;
import org.hyperledger.fabric.sdk.HFClient;
import org.hyperledger.fabric.sdk.User;
import org.hyperledger.fabric.sdk.exception.CryptoException;
import org.hyperledger.fabric.sdk.exception.InvalidArgumentException;
import org.hyperledger.fabric.sdk.security.CryptoSuite;
import org.hyperledger.fabric_ca.sdk.HFCAClient;
import org.hyperledger.fabric_ca.sdk.HFCAInfo;

import java.io.File;
import java.io.IOException;
import java.lang.reflect.InvocationTargetException;
import java.nio.file.Paths;
import java.util.*;

public class TempOrg {

    private static final Log log = LogFactory.getLog(TempOrg.class);

    // User name that executing Fabric
    private String username;
    // User password
    private String password;
    private String affiliation;
    private Set<String> roles;

    // e.g., 1000.frontend.b2csm
    private String ordererDomainName;
    // orderer set
    private List<TempOrderer> orderers = new LinkedList<>();

    // organization name
    private String orgName;
    private String orgMSPID;
    private String orgDomainName;
    private List<TempPeer> peers = new LinkedList<>();

    private boolean openTLS;

    // channel object
    private TempChannel channel;

    // chaincode object
    private TempChaincodeID chaincode;

    // event listen
    private BlockListener blockListener;

    // channel-artifacts path
    private String channelArtifactsPath;

    // crypto-config path
    private String cryptoConfigPath;

    // CA name for current organization nodes
    private String caName;
    private String caLocation;

    private boolean openCATLS;
    private HFCAClient caClient;

    private HFClient client;

    private Map<String, User> userMap = new HashMap<>();

    void init(FabricStore fabricStore) throws Exception {
        Properties properties = null;
        if(openCATLS){
            File caCert = Paths.get(cryptoConfigPath, "/peerOrganizations/",
                    getOrgDomainName(), String.format("/tlsca/tlsca.%s-cert.pem", getOrgDomainName())).toFile();
            if(!caCert.exists() || !caCert.isFile()){
                throw new RuntimeException("TEST is missing cert file " + caCert.getAbsolutePath());
            }
            properties = new Properties();
            properties.setProperty("pemFile", caCert.getAbsolutePath());
        }
        // CA client
        if (caName != null && !caName.isEmpty()){
            caClient = HFCAClient.createNewInstance(caName, getCALocation(), properties);
        }else {
            caClient = HFCAClient.createNewInstance(getCALocation(), properties);
        }
        caClient.setCryptoSuite(CryptoSuite.Factory.getCryptoSuite());
        HFCAInfo info =  caClient.info(); // check if they are connected
        Asserts.notNull(info, "caClient");
        String infoName = info.getCAName();
        if(infoName != null && !infoName.isEmpty()){
            if(!caName.equals(infoName)){
                throw new RuntimeException("ca name is not equals");
            }else {
                log.debug(String.format("ca info check success with ca name: %s", caName));
            }
        }

        if(password != null && !"".equals(password)){
            TempUser user =  fabricStore.getMember(username, orgName);
            if(!user.isEnrolled()){
                user.setEnrollment(caClient.enroll(username, password));
                user.setAffiliation(affiliation);
                user.setRoles(roles);
                user.setMspId(orgMSPID);
            }
            addUser(user);
        }
        setPeerAdmin(fabricStore);
    }

    private void setPeerAdmin(FabricStore fabricStore) throws IOException {
        File skFile = Paths.get(cryptoConfigPath, "/peerOrganizations/", orgDomainName,
                String.format("/users/%s@%s/msp/keystore", "Admin", orgDomainName)).toFile();
        File certificateFile = Paths.get(cryptoConfigPath, "/peerOrganizations/", getOrgDomainName(),
                String.format("/users/%s@%s/msp/signcerts/%s@%s-cert.pem", "Admin", orgDomainName, "Admin", orgDomainName)).toFile();
        log.debug("skFile = " + skFile.getAbsolutePath());
        log.debug("certificateFile = " + certificateFile.getAbsolutePath());
        // a special user that can create channel, connect peers and install chaincode
        addUser(fabricStore.getMember("Admin", orgName, orgMSPID, findFileSk(skFile), certificateFile));
    }

    /**
     * set username
     * @param username
     */
    void setUsername(String username){
        this.username = username;
    }

    /**
     * set ca user password
     * @param password
     */
    void setPassword(String password){
        this.password = password;
    }

    /**
     * @param affiliation
     */
    void setAffiliation(String affiliation){
        this.affiliation = affiliation;
    }

    /**
     * @param roles
     */
    void setRoles(Set<String> roles){
        this.roles = roles;
    }

    String getUsername(){
        return username;
    }

    void setCaName(String caName){
        this.caName = caName;
    }

    String getCALocation(){
        return caLocation;
    }

    void setCaLocation(String caLocation){
        this.caLocation = caLocation;
    }

    String getOrdererDomainName(){
        return ordererDomainName;
    }

    void setOrdererDomainName(String ordererDomainName){
        this.ordererDomainName = ordererDomainName;
    }

    void addOrderer(String name, String location){
        orderers.add(new TempOrderer(name, location));
    }

    List<TempOrderer> getOrderers(){
        return orderers;
    }

    void setOrgName(String orgName){
        this.orgName = orgName;
    }

    /**
     * @param orgMSPID
     */
    void setOrgMSPID(String orgMSPID){
        this.orgMSPID = orgMSPID;
    }

    String getOrgDomainName(){
        return orgDomainName;
    }

    void setOrgDomainName(String orgDomainName){
        this.orgDomainName = orgDomainName;
    }

    void addPeer(String peerName, String peerEventHubName, String peerLocation, String peerEventHubLocation, boolean isEventListener){
        peers.add(new TempPeer(peerName, peerEventHubName, peerLocation, peerEventHubLocation, isEventListener));
    }

    List<TempPeer> getPeers(){
        return peers;
    }

    void setChannel(TempChannel channel){
        this.channel = channel;
    }

    TempChannel getChannel(){
        return channel;
    }

    void setChainCode(TempChaincodeID chaincode){
        this.chaincode = chaincode;
    }

    TempChaincodeID getChainCode(){
        return chaincode;
    }

    void setChannelArtifactsPath(String channelArtifactsPath){
        this.channelArtifactsPath = channelArtifactsPath;
    }

    String getChannelArtifactsPath(){
        return channelArtifactsPath;
    }

    void setCryptoConfigPath(String cryptoConfigPath){
        this.cryptoConfigPath = cryptoConfigPath;
    }

    String getCryptoConfigPath(){
        return cryptoConfigPath;
    }

    void setBlockListener(BlockListener blockListener){
        this.blockListener = blockListener;
    }

    BlockListener getBlockListener(){
        return blockListener;
    }

    /**
     * set if open TLS
     * @param openTLS
     */
    void openTLS(boolean openTLS){
        this.openTLS = openTLS;
    }

    boolean openTLS(){
        return openTLS;
    }

    /**
     * set if open CA TLS
     */
    void openCATLS(boolean openCATLS){
        this.openCATLS = openCATLS;
    }

    /**
     * get if open CA TLS
     */
    boolean openCATLS(){
        return openCATLS;
    }

    private void addUser(TempUser user){
        userMap.put(user.getName(), user);
    }

    User getUser(String name){
        return userMap.get(name);
    }

    HFCAClient getCaClient(){
        return caClient;
    }

    void setClient(HFClient client) throws CryptoException, InvalidArgumentException, ClassNotFoundException,
            NoSuchMethodException, InvocationTargetException, InstantiationException, IllegalAccessException{
        this.client = client;
        log.debug("Create instance of HFClient");
        client.setCryptoSuite(CryptoSuite.Factory.getCryptoSuite());
        log.debug("Set Crypto Suite of HFClient");
    }

    HFClient getClient(){
        return client;
    }

    /**
     * @param directory
     * @return File
     */
    private File findFileSk(File directory){
        File[] matches = directory.listFiles((dir, name) -> name.endsWith("_sk"));
        if(null == matches){
            throw new RuntimeException(String.format("Matches returned null does %s directory exist?", directory.getAbsoluteFile().getName()));
        }
        if(matches.length != 1){
            throw new RuntimeException(String.format("Expected in %s only 1 sk file but found %d", directory.getAbsoluteFile().getName(), matches.length));
        }
        return matches[0];
    }
}
