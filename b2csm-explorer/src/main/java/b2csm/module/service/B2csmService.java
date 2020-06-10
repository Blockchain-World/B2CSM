package b2csm.module.service;

import b2csm.base.BaseService;
import com.alibaba.fastjson.JSONObject;

public interface B2csmService extends BaseService {
    /**
     * contract interface
     * @param json
     */
    String chainCode(JSONObject json);

    /**
     * trace interface
     * @param json
     */
    String trace(JSONObject json);

    /**
     * dashboard info, including entNumber, orderer numbers, number of peer nodes, number of CA service
     * number of channels, number of blocks, number of transactions, number of chaincodes
     * @param json
     */
    String dashboard(JSONObject json);

    String replicateLedger(JSONObject json);

    String honeypotsQuery(JSONObject json);
    String nidsQuery(JSONObject json);
    String gtmwQuery(JSONObject json);

}
