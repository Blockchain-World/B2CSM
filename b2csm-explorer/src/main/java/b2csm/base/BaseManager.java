package b2csm.base;

import com.fasterxml.jackson.databind.ser.Serializers;
import org.apache.log4j.LogManager;
import org.apache.log4j.Logger;
import org.hyperledger.fabric.sdk.NetworkConfig;

import java.io.File;

public class BaseManager {
    private static final Integer lock = 0;
    private static BaseManager baseManager = null;
    private static NetworkConfig config;

    protected static Logger logger = LogManager.getLogger(BaseManager.class);

    public BaseManager() throws Exception {
        config = NetworkConfig.fromJsonFile(new File("src/main/java/b2csm/config/network-config.json"));
    }

    /**
     * Obtain channel-artifacts configuration path
     * @return /WEB-INF/classes/fabric/channel-artifacts
     */
    protected String getChannelArtifactsPath(String module){
        String directories = BaseManager.class.getClassLoader().getResource("fabric").getFile();
        logger.debug("directories = " + directories);
        File directory = new File(directories);
        logger.debug("directory = " + directory.getPath());
        return directory.getPath() + "/" + module + "/channel-artifacts/";
    }

    /**
     * Obtain crypto-config configuration path
     * @return /WEB-INF/classes/fabric/crypto-config/
     */
    protected String getCryptoConfigPath(String module){
        String directories = BaseManager.class.getClassLoader().getResource("fabric").getFile();
        logger.debug("directories = " + directories);
        File directory = new File(directories);
        logger.debug("directory = " + directory.getPath());
        return directory.getPath() + "/" + module + "/crypto-config/";
    }

    protected static BaseManager getInstance() throws Exception {
        synchronized (lock) {
            if(baseManager == null){
                baseManager = new BaseManager();
            }
        }
        return baseManager;
    }


    public static NetworkConfig getNetworkConfig() throws Exception {
        if (config == null){
            getInstance();
        }
        return config;
    }

}
