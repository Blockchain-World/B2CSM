package b2csm.fabricCore;

public class TempOrderer {

    // orderer domain name
    private String ordererName;
    // orderer server address
    private String ordererLocation;

    TempOrderer(String ordererName, String ordererLocation){
        super();
        this.ordererName = ordererName;
        this.ordererLocation = ordererLocation;
    }

    String getOrdererName(){
        return ordererName;
    }

    void setOrdererName(String ordererName){
        this.ordererName = ordererName;
    }

    void setOrdererLocation(String ordererLocation){
        this.ordererLocation = ordererLocation;
    }

    String getOrdererLocation(){
        return ordererLocation;
    }
}
