package b2csm.config;

public class CONFIG {

    public static final String NODE_ID = "NODE1";

    // Honeypots application
    public static final int HONEYPOTS_ROW_UNIT = 32;
    public static final int HONEYPOTS_COLUMN_UNIT = 32;

    public static final String HONEYPOTS_DATASET_LOCATION = "/opt/gopath/src/b2csm/DataSets/honeypots/";

    // NIDS application
    public static final int NIDS_ROW_UNIT = 2;
    public static final int NIDS_COLUMN_UNIT = 2;

    public static final String NIDS_DATASET_LOCATION = "/opt/gopath/src/b2csm/DataSets/nids/";

    // GTMW application
    public static final int GTMW_ROW_UNIT = 16;
    public static final int GTMW_COLUMN_UNIT = 16;

    public static final String GTMW_DATASET_LOCATION = "/opt/gopath/src/b2csm/DataSets/gtmw/";
}