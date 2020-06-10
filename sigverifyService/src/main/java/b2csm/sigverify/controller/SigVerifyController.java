package b2csm.sigverify.controller;

import b2csm.sigverify.service.SigVerifyService;
import com.alibaba.fastjson.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.*;

import javax.annotation.Resource;
import java.util.Map;

@Controller
@RequestMapping("")
public class SigVerifyController {

    @Resource
    private SigVerifyService SigVerifyService;

    @CrossOrigin(origins = {"http://10.102.2.84:8089", "http://10.102.2.88:8089", "http://10.102.2.89:8089", "http://10.102.2.90:8089"})
    @RequestMapping(value = "/sigverify", method = RequestMethod.POST, produces = "application/json; charset=UTF-8")
    @ResponseBody
    public String sigverify(@RequestBody Map<String, Object> map) {
        return SigVerifyService.signatureVerify(new JSONObject(map));
    }
}
