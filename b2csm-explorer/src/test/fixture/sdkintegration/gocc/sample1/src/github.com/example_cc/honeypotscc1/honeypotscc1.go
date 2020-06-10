package main
import (
	"encoding/binary"
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	"strconv"
)

var logger = shim.NewLogger("HoneypotsCC")

type HoneypotsChaincode struct {
}

type Honeypots struct {
	ColumnIPs []string `json:"columnIPs"`
	DayData   [][]string `json:"dayData"`
	Daypoint  string `json:"daypoint"`
	RowsIPs   []string `json:"rowIPs"`
}

func BytesToInt32(buf []byte) int  {
	return int(binary.BigEndian.Uint32(buf))
}

func (t *HoneypotsChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	//fmt.Println("------ B2CSM Init Honeypots -------")
	logger.Info("------------- B2CSM Honeypots CC Init -----------------")
	return shim.Success(nil)
}

func (t *HoneypotsChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	//fmt.Println("------ B2CSM Invoke Honeypots -------")
	logger.Info("------------- B2CSM Honeypots CC Invoke -----------------")
	function, args := stub.GetFunctionAndParameters()
	if function == "initLedger"{
		return t.initLedger(stub)
	}else if function == "invoke" {
		return t.invoke(stub, args)
	} else if function == "queryRawData" {
		return t.queryRawData(stub, args)
	} else if function == "queryCSM"{
		return t.queryCSM(stub, args)
	}
	return shim.Error("Invalid invoke function name. Expecting \"initLedger\" \"invoke\" \"query\"")
}

// for test
func (t *HoneypotsChaincode) initLedger(stub shim.ChaincodeStubInterface) pb.Response {
	const datasetName  = "honeypots"
	var err error
	blocks := []int{2,3}  // 2 days, each requires 2, 3 blocks to store the data
	for i:=1; i<= len(blocks);i++{
		numberOfBlocks,_ :=json.Marshal(blocks[i-1])
		err = stub.PutState(datasetName + "-" + strconv.Itoa(i), numberOfBlocks)
		if err != nil {
			return shim.Error(err.Error())
		}
	}
	
	honeypotsData := []Honeypots{
		Honeypots{
			RowsIPs: []string{"0.0.0.1", "0.0.0.2"},
			ColumnIPs: []string{"1.0.0.1", "1.0.0.2", "1.0.0.3"},
			DayData:[][]string{{"1", "2", "0"}, {"3", "0", "0"}},
		},
		Honeypots{
			RowsIPs: []string{"0.0.0.3", "0.0.0.4"},
			ColumnIPs: []string{"1.0.0.1", "1.0.0.2", "1.0.0.3"},
			DayData:[][]string{{"0", "2", "1"}, {"1", "0", "0"}},
		},
		Honeypots{
			RowsIPs: []string{"0.0.0.1", "0.0.0.3"},
			ColumnIPs: []string{"1.0.0.1", "1.0.0.5", "1.0.0.6"},
			DayData:[][]string{{"0", "1", "1"}, {"3", "0", "0"}},
		},
		Honeypots{
			RowsIPs: []string{"0.0.0.5", "0.0.0.6"},
			ColumnIPs: []string{"1.0.0.1", "1.0.0.5", "1.0.0.6"},
			DayData:[][]string{{"0", "3", "1"}, {"0", "1", "1"}},
		},
		Honeypots{
			RowsIPs: []string{"0.0.0.7"},
			ColumnIPs: []string{"1.0.0.1", "1.0.0.5", "1.0.0.6"},
			DayData:[][]string{{"1", "0", "1"}},
		},
	}

	honeypotsDataIndex := 0
	for i:= 1; i<= len(blocks);i++{
		for j:=0; j< blocks[i-1]; j++{
			honeypotsDataSet, _ := json.Marshal(honeypotsData[honeypotsDataIndex])
			err = stub.PutState(datasetName + "-"+ strconv.Itoa(i) + "-"+  strconv.Itoa(j), honeypotsDataSet)
			if err != nil {
				return shim.Error(err.Error())
			}
			honeypotsDataIndex++
		}
	}

	fmt.Println("------ B2CSM initLedger -------")
	return shim.Success(nil)
}

// Store data to block
func (t *HoneypotsChaincode) invoke(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var blockKey string
	var blockData string
	var err error
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2 [blockKey: keyValue]")
	}
	blockKey = args[0]
	blockData = args[1]
	err = stub.PutState(blockKey, []byte(blockData))
	if err != nil {
		return shim.Error(err.Error())
	}
	return shim.Success(nil)
}

// query callback representing the query of a chaincode
func (t *HoneypotsChaincode) queryRawData(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var A string // Entities
	var err error

	if len(args) != 1 {
		return shim.Error("Incorrect number of arguments. Expecting key to query")
	}
	A = args[0]
	// Get the state from the ledger
	Avalbytes, err := stub.GetState(A)
	if err != nil {
		jsonResp := "{\"Error\":\"Failed to get state for " + A + "\"}"
		return shim.Error(jsonResp)
	}

	if Avalbytes == nil {
		jsonResp := "{\"Error\":\"Nil result for " + A + "\"}"
		return shim.Error(jsonResp)
	}

	jsonResp := "{\"blockKey\":\"" + A + "\",\"blockData\":\"" + string(Avalbytes) + "\"}"
	//fmt.Printf("Query Response:%s\n", jsonResp)
	logger.Info("Query Response: %s\n", jsonResp)
	return shim.Success(Avalbytes)
}

func (t *HoneypotsChaincode) queryCSM(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4 argument: [algorithm #, externalIP, tStart, tEnd]")
	}

	var alg = args[0]

	if alg == "A1"{
		return t.honeypotsIdentifyVictims(stub,args[1:4])
	}else if alg == "A2" {
		return t.honeypotsIdentifyAttackers(stub, args[1:4])
	} else if alg == "A3" {
		return t.honeypotsIdentifyPotentialVictims(stub,args[1:4])
	}
	return shim.Error("Invalid query algorithm name. Expecting \"A1\" \"A2\" \"A3\"")
}


func StringsContains(array []string, val string) (index int) {
	index = -1  // val is not in array
	for i := 0; i < len(array); i++ {
		if array[i] == val {
			index = i
			return index
		}
	}
	return index
}


func (t *HoneypotsChaincode) honeypotsIdentifyVictims(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	const datasetName  = "honeypots"
	var externalIP string
	var victims map [int][]string
	victims = make(map [int][]string)

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3 argument: [externalIP, tStart, tEnd]")
	}

	externalIP = args[0]
	tStart, _ := strconv.Atoi(args[1])
	tEnd, _ := strconv.Atoi(args[2])

	if tStart > tEnd {
		//TODO: compare with current real timestamp when tStart and tEnd is real timestamp
		return shim.Error("Incorrect tStart(t1) or tEnd(t2)")
	}
	// get the block index from tStart (t1) to tEnd (t2)
	for i := tStart; i <= tEnd ; i++ {
		var victimsT []string
		blockIndex, err := stub.GetState(datasetName + "-" + strconv.Itoa(i))
		blockIndexInt, _ := strconv.Atoi(string(blockIndex))
		if err != nil{
			//TODO: return this message as response instead of error.
			jsonResp := "{\"Error\":\"Failed to get block index for day " + strconv.Itoa(i) + "\"}"
			return shim.Error(jsonResp)
		}
		for j := 0; j < blockIndexInt; j++ {
			datasetBlock, err := stub.GetState(datasetName + "-" + strconv.Itoa(i) + "-" + strconv.Itoa(j))
			if err != nil{
				jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + "for day " + strconv.Itoa(i) + "\"}"
				return shim.Error(jsonResp)
			}
			var dat Honeypots
			if err := json.Unmarshal(datasetBlock, &dat); err != nil {
				panic(err)
			}
			//fmt.Printf("block json: %v", dat)
			rowIPs := dat.RowsIPs
			columnIPs := dat.ColumnIPs
			dayData := dat.DayData

			var contain int = StringsContains(rowIPs, externalIP)
			if contain == -1 { //unable to identify attacker's IP
				continue
			} else{
				for p := 0; p < len(columnIPs); p++ {
					victimFlag, err := strconv.Atoi(dayData[contain][p])
					if err != nil{
						panic(err)
					}
					if victimFlag > 0 && (StringsContains(victimsT,columnIPs[p])== -1){
						victimsT = append(victimsT, columnIPs[p])
					}
				}
			}
		}
		victims[i] = victimsT
	}
	//fmt.Printf("Query Response of victims:%v\n", victims)
	logger.Info("Query Response of victims:%v\n", victims)
	victimsBytes, _ := json.Marshal(victims)
	return shim.Success(victimsBytes)
}


func (t *HoneypotsChaincode) honeypotsIdentifyAttackers(stub shim.ChaincodeStubInterface, args []string) pb.Response  {
	const datasetName  = "honeypots"
	var internalIP string
	var attackers map [int][]string
	attackers = make(map [int][]string)

	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3 argument: [internalIP, tStart, tEnd]")
	}

	internalIP = args[0]
	tStart, _ := strconv.Atoi(args[1])
	tEnd, _ := strconv.Atoi(args[2])

	if tStart > tEnd {
		//TODO: compare with current real timestamp when tStart and tEnd is real timestamp
		return shim.Error("Incorrect tStart(t1) or tEnd(t2)")
	}

	// get the block index from tStart (t1) to tEnd (t2)
	//TODO: decide if <=tEnd
	for i := tStart; i <= tEnd ; i++ {
		var attackersT []string
		blockIndex, err := stub.GetState(datasetName + "-" + strconv.Itoa(i))
		blockIndexInt, _ := strconv.Atoi(string(blockIndex))
		if err != nil{
			jsonResp := "{\"Error\":\"Failed to get block index for day " + strconv.Itoa(i) + "\"}"
			return shim.Error(jsonResp)
		}
		for j := 0; j < blockIndexInt; j++ {
			datasetBlock, err := stub.GetState(datasetName + "-" + strconv.Itoa(i) + "-" + strconv.Itoa(j))
			if err != nil{
				jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + "for day " + strconv.Itoa(i) + "\"}"
				return shim.Error(jsonResp)
			}
			var dat Honeypots
			if err := json.Unmarshal(datasetBlock, &dat); err != nil {
				panic(err)
			}
			//fmt.Printf("block json: %v", dat)
			rowIPs := dat.RowsIPs
			columnIPs := dat.ColumnIPs
			dayData := dat.DayData

			var contain = StringsContains(columnIPs, internalIP)
			if contain == -1 { //unable to identify the victim's IP
				continue
			} else{
				for p := 0; p < len(rowIPs); p++ {
					attackerFlag, err := strconv.Atoi(dayData[p][contain])
					if err != nil{
						panic(err)
					}
					if attackerFlag > 0 && (StringsContains(attackersT,rowIPs[p])== -1){
						attackersT = append(attackersT, rowIPs[p])
					}
				}
			}
		}
		attackers[i] = attackersT
	}
	//fmt.Printf("Query Response of potential attackers: %v\n", attackers)
	logger.Info("Query Response of potential attackers: %v\n", attackers)
	attackersBytes, _ := json.Marshal(attackers)
	return shim.Success(attackersBytes)
}


func (t *HoneypotsChaincode) honeypotsIdentifyPotentialVictims(stub shim.ChaincodeStubInterface, args []string) pb.Response  {
	const datasetName  = "honeypots"
	var attackers map [int][]string
	//identify the attackers for each day first
	var results pb.Response = t.honeypotsIdentifyAttackers(stub,args)
	if err := json.Unmarshal(results.Payload, &attackers); err != nil {
		panic(err)
	}
	var victims map [int][]string
	victims = make(map [int][]string)
	for t, attackersT := range attackers {
		var victimsT []string
		blockIndex, err := stub.GetState(datasetName + "-" + strconv.Itoa(t))
		blockIndexInt, _ := strconv.Atoi(string(blockIndex))
		if err != nil{
			jsonResp := "{\"Error\":\"Failed to get block index for day " + strconv.Itoa(t) + "\"}"
			return shim.Error(jsonResp)
		}
		for j := 0; j < blockIndexInt; j++ {
			datasetBlock, err := stub.GetState(datasetName + "-" + strconv.Itoa(t) + "-" + strconv.Itoa(j))
			if err != nil{
				jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + "for day " + strconv.Itoa(t) + "\"}"
				return shim.Error(jsonResp)
			}
			var dat Honeypots
			if err := json.Unmarshal(datasetBlock, &dat); err != nil {
				panic(err)
			}
			//fmt.Printf("block json: %v\n", dat)
			rowIPs := dat.RowsIPs
			columnIPs := dat.ColumnIPs
			dayData := dat.DayData
			for _,attackerIP :=range attackersT{
				var contain int = StringsContains(rowIPs, attackerIP)
				if contain == -1 {
					continue
				}else{
					for p := 0; p < len(columnIPs); p++ {
						victimFlag, err := strconv.Atoi(dayData[contain][p])
						if err != nil{
							panic(err)
						}
						if victimFlag > 0 && (StringsContains(victimsT,columnIPs[p])== -1){
							victimsT = append(victimsT, columnIPs[p])
						}
					}
				}
			}
		}
		victims[t] = victimsT
	}
	//fmt.Printf("Query Response of potential victims: %v\n", victims)
	logger.Info("Query Response of potential victims: %v\n", victims)
	victimsBytes, _ := json.Marshal(victims)
	return shim.Success(victimsBytes)
}


func main()  {
	err := shim.Start(new(HoneypotsChaincode))
	if err != nil {
		fmt.Printf("failed: %v", err)
	}
}

























































