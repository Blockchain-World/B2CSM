package b2csm.fabricCore;

public class TempPeer {

    private String peerName;
    private String peerEventHubName;
    private String peerLocation;
    private String peerEventHubLocation;
    private boolean addEventHub;

    /**
     * initialize peer object
     * @param peerName
     * @param peerEventHubName
     * @param peerLocation
     * @param peerEventHubLocation
     * @param isEventListener
     */
    TempPeer(String peerName, String peerEventHubName, String peerLocation, String peerEventHubLocation,
             boolean isEventListener){
        this.peerName = peerName;
        this.peerEventHubName = peerEventHubName;
        this.peerLocation = peerLocation;
        this.peerEventHubLocation = peerEventHubLocation;
        this.addEventHub = isEventListener;
    }

    /**
     * set peer location
     * @param peerLocation
     */
    void setPeerLocation(String peerLocation){
        this.peerLocation = peerLocation;
    }

    /**
     * set event hub location
     * @param peerEventHubLocation
     */
    void setPeerEventHubLocation(String peerEventHubLocation){
        this.peerEventHubLocation = peerEventHubLocation;
    }

    /**
     * obtain org peer name (0.peer.ent1.b2csm)
     */
    String getPeerName(){
        return peerName;
    }

    String getPeerEventHubName(){
        return peerEventHubName;
    }

    String getPeerLocation(){
        return peerLocation;
    }

    String getPeerEventHubLocation(){
        return peerEventHubLocation;
    }

    boolean isAddEventHub(){
        return addEventHub;
    }
}
