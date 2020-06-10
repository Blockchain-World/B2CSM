package b2csm.fabricCore;

import io.netty.util.internal.StringUtil;
import org.bouncycastle.util.encoders.Hex;
import org.hyperledger.fabric.sdk.Enrollment;
import org.hyperledger.fabric.sdk.User;

import java.io.*;
import java.util.Set;

public class TempUser implements User, Serializable {

    private static final long serialVersionUID = 5695080465408336815L;

    private String name;
    private Set<String> roles;
    private String account;
    private String affiliation;
    private String organization;
    private String enrollmentSecret;
    private String mspId;
    private Enrollment enrollment = null;
    private transient FabricStore fabricStore;
    private String keyForFabricStoreName;

    /**
     * Fabric network user object
     * @param name
     * @param orgName
     * @param store
     */
    TempUser(String name, String orgName, FabricStore store){
        this.name = name;
        this.organization = orgName;
        this.fabricStore = store;
        this.keyForFabricStoreName = getKeyForFabricStoreName(this.name, orgName);

        String memberStr = fabricStore.getValue(keyForFabricStoreName);
        if(null != memberStr){
            saveState();
        }else {
            restoreState();
        }
    }

    /**
     * @param account
     */
    void setAccount(String account){
        this.account = account;
        saveState();
    }

    @Override
    public String getAccount(){
        return this.account;
    }

    /**
     * @param affiliation
     */
    void setAffiliation(String affiliation){
        this.affiliation = affiliation;
        saveState();
    }

    @Override
    public String getAffiliation(){
        return this.affiliation;
    }

    String getEnrollmentSecret(){
        return this.enrollmentSecret;
    }

    void setEnrollmentSecret(String enrollmentSecret){
        this.enrollmentSecret = enrollmentSecret;
    }

    /**
     * @param enrollment
     */
    void setEnrollment(Enrollment enrollment){
        this.enrollment = enrollment;
        saveState();
    }

    @Override
    public Enrollment getEnrollment(){
        return this.enrollment;
    }

    void setMspId(String mspID){
        this.mspId = mspID;
        saveState();
    }

    @Override
    public String getMspId(){
        return this.mspId;
    }

    @Override
    public String getName(){
        return this.name;
    }

    void setRoles(Set<String> roles){
        this.roles = roles;
        saveState();
    }

    @Override
    public Set<String> getRoles(){
        return this.roles;
    }

    boolean isRegistered(){
        return !StringUtil.isNullOrEmpty(enrollmentSecret);
    }

    boolean isEnrolled(){
        return this.enrollment != null;
    }

    void saveState(){
        ByteArrayOutputStream bos = new ByteArrayOutputStream();
        try{
            ObjectOutputStream oos = new ObjectOutputStream(bos);
            oos.writeObject(this);
            oos.flush();
            fabricStore.setValue(keyForFabricStoreName, Hex.toHexString(bos.toByteArray()));
            bos.close();
        }catch (IOException e){
            e.printStackTrace();
        }
    }

    private void restoreState(){
        String memberStr = fabricStore.getValue(keyForFabricStoreName);
        if(null != memberStr){
            byte[] serialized = Hex.decode(memberStr);
            ByteArrayInputStream bis = new ByteArrayInputStream(serialized);
            try{
                ObjectInputStream ois = new ObjectInputStream(bis);
                TempUser state = (TempUser) ois.readObject();
                if(state != null){
                    this.name =state.name;
                    this.roles = state.roles;
                    this.account = state.account;
                    this.affiliation = state.affiliation;
                    this.organization = state.organization;
                    this.enrollmentSecret = state.enrollmentSecret;
                    this.enrollment = state.enrollment;
                    this.mspId = state.mspId;
                }
            }catch (Exception e){
                throw new RuntimeException(String.format("Could not restore state of member %s", this.name), e);
            }
        }
    }

    static String getKeyForFabricStoreName(String name, String org){
        //System.out.println("toKeyValStoreName = " + "user." + name + org);
        return "user." + name + org;
    }
}
