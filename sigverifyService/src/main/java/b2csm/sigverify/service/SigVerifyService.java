package b2csm.sigverify.service;

import com.alibaba.fastjson.JSONObject;

public interface SigVerifyService {
    /**
     * signature verification interface
     *
     */
    String signatureVerify(JSONObject json);
}
