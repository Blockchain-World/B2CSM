package b2csm.sigverify.service.impl;

import b2csm.sigverify.service.SigVerifyService;
import com.alibaba.fastjson.JSONObject;
import org.apache.commons.codec.binary.Base64;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;
import org.springframework.stereotype.Service;

import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.*;
import java.security.spec.KeySpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;


@Service("SigVerifyService")
public class SigVerifyServiceImpl implements SigVerifyService {

    private static final Log log = LogFactory.getLog(SigVerifyServiceImpl.class);
    private static String privKeyPath;
    private static String pubKeyPath;
    int SUCCESS = 200;
    int FAIL = 40040;

    public static KeyPair generateSignKeyPair(String nodeID) throws Exception {
        switch (nodeID) {
            case "NODE1":
                privKeyPath = "src/main/resources/static/keyPairs/node1/private_key_node1.der";
                pubKeyPath = "src/main/resources/static/keyPairs/node1/public_key_node1.der";
                break;
            case "NODE2":
                privKeyPath = "src/main/resources/static/keyPairs/node2/private_key_node2.der";
                pubKeyPath = "src/main/resources/static/keyPairs/node2/public_key_node2.der";
                break;
            case "NODE3":
                privKeyPath = "src/main/resources/static/keyPairs/node3/private_key_node3.der";
                pubKeyPath = "src/main/resources/static/keyPairs/node3/public_key_node3.der";
                break;
            case "NODE4":
                privKeyPath = "src/main/resources/static/keyPairs/node4/private_key_node4.der";
                pubKeyPath = "src/main/resources/static/keyPairs/node4/public_key_node4.der";
                break;
            default:
                log.error("No available NODE ID");
        }

        log.info("privKeyPath: " + privKeyPath);
        log.info("pubKeyPath: " + pubKeyPath);
        byte[] privBytes = Files.readAllBytes(Paths.get(privKeyPath));
        byte[] pubBytes = Files.readAllBytes(Paths.get(pubKeyPath));

        // private key
        KeySpec keySpec = new PKCS8EncodedKeySpec(privBytes);
        KeyFactory keyFactory = KeyFactory.getInstance("RSA");
        PrivateKey privateKey = keyFactory.generatePrivate(keySpec);

        //public key
        X509EncodedKeySpec X509publicKey = new X509EncodedKeySpec(pubBytes);
        PublicKey publicKey = keyFactory.generatePublic(X509publicKey);
        return new KeyPair(publicKey, privateKey);
    }

    public static boolean verifySignature(PublicKey publicKey, byte[] data, byte[] sig) throws Exception {
        Signature dsa = Signature.getInstance("SHA256withRSA");
        dsa.initVerify(publicKey);
        dsa.update(data);
        return dsa.verify(sig);
    }

    @Override
    public String signatureVerify(JSONObject jsonObj) {
        String message = jsonObj.getString("message");
        String signature = jsonObj.getString("signature");
        String publicKeyIndex = jsonObj.getString("pubkeyNodeIndex");
        boolean verifyResult = false;

        try {
            KeyPair keyPair = generateSignKeyPair(publicKeyIndex);
            PublicKey publicKey = keyPair.getPublic();
            if(signature == null) {
                JSONObject jsonObject = new JSONObject();
                jsonObject.put("status", FAIL);
                jsonObject.put("data", false);
                return jsonObject.toString();
            }
            verifyResult = verifySignature(publicKey, message.getBytes(), Base64.decodeBase64(signature.getBytes()));
        }catch (Exception e){
            e.printStackTrace();
        }
        if(verifyResult){
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("status", SUCCESS);
            jsonObject.put("data", true);
            return jsonObject.toString();
        } else {
            JSONObject jsonObject = new JSONObject();
            jsonObject.put("status", FAIL);
            jsonObject.put("data", false);
            return jsonObject.toString();
        }
    }

}
