package b2csm.module.controller;

import b2csm.module.service.B2csmService;
import com.alibaba.fastjson.JSONObject;
import org.springframework.stereotype.Controller;
import org.springframework.ui.ModelMap;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestMethod;
import org.springframework.web.bind.annotation.ResponseBody;

import javax.annotation.Resource;
import java.util.Map;

@Controller
@RequestMapping("")
public class B2csmController {
    @Resource
    private B2csmService simpleService;

    @RequestMapping(value = "/chaincode", method = RequestMethod.POST, produces = "application/json; charset=UTF-8")
    @ResponseBody
    public String chaincode(@RequestBody Map<String, Object> map){

        return simpleService.chainCode(new JSONObject(map));
    }

    @RequestMapping(value = "/trace", method = RequestMethod.POST, produces = "application/json; charset=UTF-8")
    @ResponseBody
    public String trace(@RequestBody Map<String, Object> map){
        return simpleService.trace(new JSONObject(map));
    }

    // Explorer Interfaces
    @RequestMapping(value = "/dashboard", method = RequestMethod.POST, produces = "application/json; charset=UTF-8")
    @ResponseBody
    public String dashboard(@RequestBody Map<String, Object> map, ModelMap modelMap){
        String dashboardResult = simpleService.dashboard(new JSONObject(map));
        return dashboardResult;
    }

    // replicate csv file to ledger
    @RequestMapping(value = "/replicateLedger", method = RequestMethod.POST, produces = "application/json; charset=UTF-8")
    @ResponseBody
    public String replicateLedger(@RequestBody Map<String, Object> map){

        return simpleService.replicateLedger(new JSONObject(map));
    }

    // Honeypots Query
    @RequestMapping(value = "honeypots/query", method = RequestMethod.POST, produces = "application/json; charset=UTF-8")
    @ResponseBody
    public String honeypotsQuery(@RequestBody Map<String, Object> map){
        return simpleService.honeypotsQuery(new JSONObject(map));
    }

    // NIDS Query
    @RequestMapping(value = "nids/query", method = RequestMethod.POST, produces = "application/json; charset=UTF-8")
    @ResponseBody
    public String nidsQuery(@RequestBody Map<String, Object> map){

        return simpleService.nidsQuery(new JSONObject(map));
    }

    // GTMW Query
    @RequestMapping(value = "gtmw/query", method = RequestMethod.POST, produces = "application/json; charset=UTF-8")
    @ResponseBody
    public String gtmwQuery(@RequestBody Map<String, Object> map){

        return simpleService.gtmwQuery(new JSONObject(map));
    }

    // test case2 demo
    @RequestMapping(value = "/case2")
    public String case2(){
        return "explorer/case2Demo";
    }

    @RequestMapping(value = "/index")
    //@ResponseBody
    public String index(){
        return "explorer/index";
    }

    @RequestMapping(value = "/honeypots")
    //@ResponseBody
    public String honeypots(){
        return "explorer/honeypots";
    }

    @RequestMapping(value = "/nids")
    //@ResponseBody
    public String nids(){
        return "explorer/nids";
    }

    @RequestMapping(value = "/gtmw")
    //@ResponseBody
    public String gtmw(){
        return "explorer/gtmw";
    }

    @RequestMapping(value = "/login")
    public String login(ModelMap modelMap){
        modelMap.addAttribute("name", "test");
        return "explorer/login";
    }

    @RequestMapping(value = "/enterprises_explorer")
    public String enterprises_explorer(ModelMap map){
        map.addAttribute("name", "enterprises");
        return "explorer/enterprises";
    }

    @RequestMapping(value = "/orderer_explorer")
    public String orderer_explorer(ModelMap map){
        map.addAttribute("name", "orderer_explorer");
        return "explorer/orderers";
    }

    @RequestMapping(value = "/peers_explorer")
    public String peers_explorer(ModelMap map){
        map.addAttribute("name", "peers_explorer");
        return "explorer/peers";
    }

    @RequestMapping(value = "/cas_explorer")
    public String cas_explorer(ModelMap map){
        map.addAttribute("name", "cas_explorer");
        return "explorer/cas";
    }

    @RequestMapping(value = "/channels_explorer")
    public String channels_explorer(ModelMap map){
        map.addAttribute("name", "channels_explorer");
        return "explorer/channels";
    }

    @RequestMapping(value = "/blocks_explorer")
    public String blocks_explorer(ModelMap map){
        map.addAttribute("name", "blocks_explorer");
        return "explorer/blocks";
    }

    @RequestMapping(value = "/transactions_explorer")
    public String transactions_explorer(ModelMap map){
        map.addAttribute("name", "transactions_explorer");
        return "explorer/transactions";
    }

    @RequestMapping(value = "/chaincodes_explorer")
    public String chaincodes_explorer(ModelMap map){
        map.addAttribute("name", "chaincodes_explorer");
        return "explorer/chaincodes";
    }

    // data replication web page
    @RequestMapping(value = "/dataReplication")
    public String data_replication(ModelMap map){
        map.addAttribute("name", "data replication");
        return "explorer/datareplication";
    }


    // Error
    @RequestMapping(value = "/error500")
    public String error500(ModelMap map){
        map.addAttribute("name", "error500");
        return "explorer/500";
    }

    @RequestMapping(value = "/error404")
    public String error404(ModelMap map){
        map.addAttribute("name", "error404");
        return "explorer/404";
    }

}
