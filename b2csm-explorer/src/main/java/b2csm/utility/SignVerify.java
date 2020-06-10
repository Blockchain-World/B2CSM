package b2csm.utility;

import java.io.File;
import java.io.UnsupportedEncodingException;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.security.*;
import java.security.interfaces.RSAPrivateKey;
import java.security.interfaces.RSAPublicKey;
import java.security.spec.KeySpec;
import java.security.spec.PKCS8EncodedKeySpec;
import java.security.spec.X509EncodedKeySpec;

import b2csm.config.CONFIG;
import org.apache.commons.codec.binary.Base64;
import com.nimbusds.jose.jwk.*;
import org.apache.commons.logging.Log;
import org.apache.commons.logging.LogFactory;


public class SignVerify {

    private static final Log log = LogFactory.getLog(SignVerify.class);
    private static String privKeyPath;
    private static String pubKeyPath;


    public static KeyPair generateSignKeyPair() throws Exception {
        switch (CONFIG.NODE_ID) {
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

    public static byte[] generateSignature(PrivateKey signPrivateKey, byte[] data) throws Exception {
        Signature dsa = Signature.getInstance("SHA256withRSA");
        dsa.initSign(signPrivateKey);
        dsa.update(data);
        return dsa.sign();
    }

    public static boolean verifySignature(PublicKey publicKey, byte[] data, byte[] sig) throws Exception {
        Signature dsa = Signature.getInstance("SHA256withRSA");
        dsa.initVerify(publicKey);
        dsa.update(data);
        return dsa.verify(sig);
    }

    public static boolean verifySigWithFixPK(byte[] data, byte[] sig) throws Exception {
        Signature dsa = Signature.getInstance("SHA256withRSA");
        KeyPair keyPair = generateSignKeyPair();
        PublicKey publicKey = keyPair.getPublic();
        dsa.initVerify(publicKey);
        dsa.update(data);
        return dsa.verify(sig);
    }

    private static String getPEMPrivateKeyFromDER(PrivateKey privateKey) {
        Base64 base64 = new Base64();
        String begin = "-----BEGIN PRIVATE KEY-----";
        String end = "-----END PRIVATE KEY-----";
        PKCS8EncodedKeySpec pkcs8EncodedKeySpec = new PKCS8EncodedKeySpec(privateKey.getEncoded());
        String key = new String(base64.encode(pkcs8EncodedKeySpec.getEncoded()));
        return begin + "\n" + key + "\n" + end;
    }

    private static String getPEMPublicKeyFromDER(PublicKey publicKey) {
        Base64 base64 = new Base64();
        String begin = "-----BEGIN PUBLIC KEY-----";
        String end = "-----END PUBLIC KEY-----";
        PKCS8EncodedKeySpec pkcs8EncodedKeySpec = new PKCS8EncodedKeySpec(publicKey.getEncoded());
        String key = new String(base64.encode(pkcs8EncodedKeySpec.getEncoded()));
        return begin + "\n" + key + "\n" + end;
    }
}
