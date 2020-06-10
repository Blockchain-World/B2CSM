package b2csm.fabricCore;

import org.apache.commons.io.IOUtils;
import org.bouncycastle.asn1.pkcs.PrivateKeyInfo;
import org.bouncycastle.jce.provider.BouncyCastleProvider;
import org.bouncycastle.openssl.PEMParser;
import org.bouncycastle.openssl.jcajce.JcaPEMKeyConverter;
import org.hyperledger.fabric.sdk.Enrollment;
import sun.nio.ch.IOUtil;

import java.io.*;
import java.security.PrivateKey;
import java.security.Security;
import java.util.HashMap;
import java.util.Map;
import java.util.Properties;

public class FabricStore {

    private String file;
    // user set
    private final Map<String, TempUser> members = new HashMap<>();

    FabricStore(File file){
        this.file = file.getAbsolutePath();
    }

    /**
     * Set related value
     * @param name
     * @param value
     */
    void setValue(String name, String value){
        Properties properties = loadProperties();
        try(OutputStream output = new FileOutputStream(file)){
            properties.setProperty(name, value);
            properties.store(output, "");
        }catch (IOException e){
            System.out.println(String.format("Could not save the key-value store, reason: %s", e.getMessage()));
        }
    }

    /**
     * get related value
     * @param name
     * @return
     */
    String getValue(String name){
        Properties properties = loadProperties();
        return properties.getProperty(name);
    }

    private Properties loadProperties(){
        Properties properties = new Properties();
        try(InputStream input = new FileInputStream(file)){
            properties.load(input);
        }catch (FileNotFoundException e){
            System.out.println(String.format("Could not find the file \"%s\"", file));
        }catch (IOException e){
            System.out.println(String.format("Could not load key-value store from file \"%s\", reason: %s", file, e.getMessage()));
        }
        return properties;
    }

    TempUser getMember(String name, String orgName){
        TempUser user = members.get(TempUser.getKeyForFabricStoreName(name, orgName));
        if(null != user){
            return user;
        }
        // Create user, get status if found
        user = new TempUser(name, orgName, this);
        members.put(TempUser.getKeyForFabricStoreName(name, orgName), user);
        return user;
    }

    /**
     * get user
     * @param name
     * @param org
     * @param mspId
     * @param privateKeyFile
     * @param certificateFile
     * @return user
     */
    TempUser getMember(String name, String org, String mspId, File privateKeyFile, File certificateFile) throws IOException{
        // try to read User state from cache
        TempUser user = members.get(TempUser.getKeyForFabricStoreName(name, org));
        if(null != user){
            System.out.println("Try to obtain user state from cache, User = " + user);
            return user;
        }
        // Create user
        user = new TempUser(name, org, this);
        user.setMspId(mspId);
        String certificate = new String(IOUtils.toByteArray(new FileInputStream(certificateFile)), "UTF-8");
        PrivateKey privateKey = getPrivateKeyFromBytes(IOUtils.toByteArray(new FileInputStream(privateKeyFile)));
        user.setEnrollment(new StoreEnrollment(privateKey, certificate));
        user.saveState();
        members.put(TempUser.getKeyForFabricStoreName(name, org), user);
        return user;
    }

    /**
     * Obtain private key through byte array
     * @param data
     * @return
     */
    private PrivateKey getPrivateKeyFromBytes(byte[] data) throws IOException{
        final Reader pemReader = new StringReader(new String(data));
        final PrivateKeyInfo pemPair;
        try(PEMParser pemParser = new PEMParser(pemReader)){
            pemPair = (PrivateKeyInfo) pemParser.readObject();
        }
        return new JcaPEMKeyConverter().setProvider(BouncyCastleProvider.PROVIDER_NAME).getPrivateKey(pemPair);
    }
    static {
        try{
            Security.addProvider(new BouncyCastleProvider());
        }catch (Exception e){
            e.printStackTrace();
        }
    }

    static final class StoreEnrollment implements Enrollment, Serializable {
        private static final long serialVersionUID = 6965341351799577442L;

        // private key
        private final PrivateKey privateKey;
        private final String certificate;

        StoreEnrollment(PrivateKey privateKey, String certificate){
            this.privateKey = privateKey;
            this.certificate = certificate;
        }

        @Override
        public PrivateKey getKey(){
            return privateKey;
        }
        @Override
        public String getCert(){
            return certificate;
        }
    }

}
