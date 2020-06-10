package b2csm.module.manager;

import b2csm.base.BaseManager;
import b2csm.fabricCore.FabricManager;
import b2csm.fabricCore.OrgManager;

public class B2csmManager extends BaseManager {
    private String instanceId = "";
    private static B2csmManager instance;
    private FabricManager fabricManager;

    public static B2csmManager obtain(String orgName, String channelName) throws Exception{
        if(null == instance){
            synchronized (B2csmManager.class){
                if(null == instance){
                    //instance = new B2csmManager();
                    instance = new B2csmManager(orgName, channelName);
                    instance.instanceId = channelName;
                }
            }
        }else {
            if(channelName.equals(instance.instanceId)){
                return instance;
            } else {
                instance = new B2csmManager(orgName, channelName);
                instance.instanceId = channelName;
            }
        }
        return instance;
    }

    private B2csmManager(String orgName, String channelName) throws Exception{
        //super();
        fabricManager = obtainFabricManager(orgName, channelName);
    }

    public FabricManager getFabricManager(){
        return fabricManager;
    }

    private FabricManager obtainFabricManager(String orgName, String channelName) throws Exception{
        logger.info("Obtain Fabric Manager by orgName: " + orgName); // e.g., orgName = "ent1"
        OrgManager orgManager = new OrgManager();
        orgManager
                .init(orgName)
                .setUser("Admin", getCryptoConfigPath("b2csm"), getChannelArtifactsPath("b2csm"))
                .setCA("ca.ent1.b2csm", "http://10.102.2.84:7054")
                .setPeers("Ent1MSP", "ent1.b2csm")
                .addPeer("0.peer.ent1.b2csm", "0.peer.ent1.b2csm", "grpc://10.102.2.84:7051", "grpc://10.102.2.84:7053", true)
                //.addPeer("1.peer.ent1.b2csm", "1.peer.ent1.b2csm", "grpc://10.102.2.88:7051", "grpc://10.102.2.88:7053", true)
                //.addPeer("2.peer.ent1.b2csm", "2.peer.ent1.b2csm", "grpc://10.102.2.89:7051", "grpc://10.102.2.89:7053", true)
                //.addPeer("3.peer.ent1.b2csm", "3.peer.ent1.b2csm", "grpc://10.102.2.90:7051", "grpc://10.102.2.90:7053", true)
                .setOrderers("frontend.b2csm")
                .addOrderer("1000.frontend.b2csm", "grpc://10.102.2.84:7050")
                .addOrderer("2000.frontend.b2csm", "grpc://10.102.2.88:7050")
                .addOrderer("3000.frontend.b2csm", "grpc://10.102.2.89:7050")
                .setChannel(channelName)
                //.setChainCode("gtmwcc", "src/test/fixture/sdkintegration/gocc/sample1",
                        //"github.com/example_cc/gtmwcc", "1.2", 90000, 180)
                //.setChainCode("example002", "/opt/gopath/",
                        //"github.com/hyperledger/fabric/examples/chaincode/go/example002/cmd", "1.2", 90000, 180)
                .openTLS(false)
                .openCATLS(false)
                .setBlockListener(map -> {
                    logger.debug(map.get("code"));
                    logger.debug(map.get("data"));
                });
        if(channelName.equals("b2csm-honeypots")){
            orgManager.setChainCode("honeypotscc1", "src/test/fixture/sdkintegration/gocc/sample1",
                    "github.com/example_cc/honeypotscc1", "1.2", 90000, 180);
        }else if(channelName.equals("b2csm-nids")){
            orgManager.setChainCode("nidscc1", "src/test/fixture/sdkintegration/gocc/sample1",
                    "github.com/example_cc/nidscc1", "1.2", 90000, 180);
        }else if(channelName.equals("b2csm-gtmw")){
            orgManager.setChainCode("gtmwcc1", "src/test/fixture/sdkintegration/gocc/sample1",
                    "github.com/example_cc/gtmwcc1", "1.2", 90000, 180);
        }else {
            logger.error("No available channel name found!");
        }
        orgManager.add();
        logger.debug("openCSTLS = false");
        return orgManager.use(orgName);
    }
}
