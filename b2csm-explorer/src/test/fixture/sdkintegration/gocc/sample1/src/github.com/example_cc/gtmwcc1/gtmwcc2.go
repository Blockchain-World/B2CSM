package main
import (
	"encoding/json"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	"log"
	"net/url"
	"strconv"
	"strings"
)


type B2csmChaincode struct {
}

type WebData struct {
	RowAPPs []string `json:"rowApps"`
	DayData   [][]string `json:"dayData"`
	ColumnURLs   []string `json:"columnURLs"`
}


func (t *B2csmChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("------ B2CSM Init GTMW -------")
	return shim.Success(nil)
}

func (t *B2csmChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("------ B2CSM Invoke GTMW -------")
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
func (t *B2csmChaincode) initLedger(stub shim.ChaincodeStubInterface) pb.Response {
	const datasetName  = "gtmw"
	var err error
	blocks := []int{3}  // 3 blocks to store the data
	numberOfBlocks,_ :=json.Marshal(blocks[0])
	err = stub.PutState(datasetName + "-" + strconv.Itoa(6), numberOfBlocks)
	if err != nil {
		return shim.Error(err.Error())
	}


	blockData := []WebData{
		WebData{
			RowAPPs: []string{"00009974455df3a04802367f147ed15c", "0003d7c67b450589cf0d1c3a498e2359"},
			ColumnURLs: []string{"google.com/", "migsel.com/alive.php?key=Blackshades%5FKey&pcuser=Rivest&pcname=RON%2DAC13BF686B1&hwid=40D0BCBC&country=United+States", "migsel.com/cmd.php?key=Blackshades%5FKey&hwid=40D0BCBC",
			"migsel.com/ddos.bss", "migsel.com/dos.php?key=Blackshades%5FKey&hwid=40D0BCBC", "migsel.com/fg.php?key=Blackshades%5FKey", 
			"az687722.vo.msecnd.net/base.zip", "az687722.vo.msecnd.net/freeware-de-flow-5-text-en-us.zip"},
			DayData:[][]string{{"1", "0", "0", "0", "0", "0", "0", "0"}, {"0", "1", "1", "1", "1", "1", "0", "0"}},
		},     
		WebData{
			RowAPPs: []string{"0009ac1949eec7ad088633b06bf4e466", "000bea9152391803f9e6f251475eeffc"},
			ColumnURLs: []string{"google.com/", "migsel.com/alive.php?key=Blackshades%5FKey&pcuser=Rivest&pcname=RON%2DAC13BF686B1&hwid=40D0BCBC&country=United+States", "migsel.com/cmd.php?key=Blackshades%5FKey&hwid=40D0BCBC",
			"migsel.com/ddos.bss", "migsel.com/dos.php?key=Blackshades%5FKey&hwid=40D0BCBC", "migsel.com/fg.php?key=Blackshades%5FKey", 
			"az687722.vo.msecnd.net/base.zip", "az687722.vo.msecnd.net/freeware-de-flow-5-text-en-us.zip"},
			DayData:[][]string{{"1", "0", "0", "0", "0", "0", "0", "0"}, {"0", "1", "1", "1", "1", "1", "0", "0"}},
		},   		
		WebData{
			RowAPPs: []string{"000bfa5d5e8fd31a5486f654e154cdfc", "000cb2c24181387208c9f39386086a68", "00189811038ead0a68c91731c54f2cc9"},
			ColumnURLs: []string{"google.com/", "migsel.com/alive.php?key=Blackshades%5FKey&pcuser=Rivest&pcname=RON%2DAC13BF686B1&hwid=40D0BCBC&country=United+States", "migsel.com/cmd.php?key=Blackshades%5FKey&hwid=40D0BCBC",
			"migsel.com/ddos.bss", "migsel.com/dos.php?key=Blackshades%5FKey&hwid=40D0BCBC", "migsel.com/fg.php?key=Blackshades%5FKey", 
			"az687722.vo.msecnd.net/base.zip", "az687722.vo.msecnd.net/freeware-de-flow-5-text-en-us.zip"},
			DayData:[][]string{{"0", "0", "0", "0", "0", "0", "1", "1"}, {"1", "0", "0", "0", "0", "0", "0", "0"}, {"1", "1", "1", "0", "0", "0", "0", "0"}},
		},
	}

	for j:=0; j< blocks[0]; j++{
		urlDataSet, _ := json.Marshal(blockData[j])
		stub.PutState(datasetName + "-" + strconv.Itoa(6) + "-" + strconv.Itoa(j), urlDataSet)
	}
	
	return shim.Success(nil)
}

// Store data to block
func (t *B2csmChaincode) invoke(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	var blockKey string
	var blockData string
	var err error
	if len(args) != 2 {
		return shim.Error("Incorrect number of arguments. Expecting 2")
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
func (t *B2csmChaincode) queryRawData(stub shim.ChaincodeStubInterface, args []string) pb.Response {
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
	fmt.Printf("Query Response:%s\n", jsonResp)
	return shim.Success(Avalbytes)
}


func (t *B2csmChaincode) queryCSM(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	if len(args) < 4 || len(args) > 5{
		return shim.Error("Incorrect number of arguments. Expecting 4 argument: [algorithm #, externalIP, tStart, tEnd]")
	}

	var alg = args[0]

	if alg == "A1"{
		return t.urlIdentifySuspiciousApps(stub,args[1:4])  //Algorithm 7
	}else if alg == "A2" {
		return t.urlIdentifyVictimApps(stub, args[1:4]) //Algorithm 8
	} else if alg == "A3" {
		return t.urlSpoofedApps(stub,args[1:5]) //Algorithm 9
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


//convert url to domain name
func parseDomain(arg string) []string{
	u, err := url.Parse(arg)
	if err != nil {
		log.Fatal(err)
	}
	parts := strings.Split(u.Hostname(), ".")
	//domain := parts[len(parts)-2] + "." + parts[len(parts)-1]
	return parts
}

// Levenshtein Distance Algorithm
func levenshtein(str1, str2 []rune) int{
	s1len := len(str1)
	s2len := len(str2)
	column := make([]int, len(str1)+1)

	for y := 1; y <= s1len; y++ {
		column[y] = y
	}
	for x := 1; x <= s2len; x++ {
		column[0] = x
		lastKey := x - 1
		for y := 1; y <= s1len; y++ {
			oldKey := column[y]
			var incr int
			if str1[y-1] != str2[x-1] {
				incr = 1
			}

			column[y] = minimum(column[y]+1, column[y-1]+1, lastKey+incr)
			lastKey = oldKey
		}
	}
	return column[s1len]
}

func minimum(a, b, c int) int{
	if a < b {
		if a < c {
			return a
		}
	} else {
		if b < c {
			return b
		}
	}
	return c
}

func maximum(l []int) int{
	max := l[0]
	for _, v := range l {
		if v > max {
			max = v
		}
	}
	return max
}


func editDistance(url1 string, url2 string) int{
	compo1 :=  parseDomain(url1)
	compo2 :=  parseDomain(url2)
	maxCompo := maximum([]int{len(compo1),len(compo2)})
	totalDistance := 0
	diff := len(compo1)- len(compo2)
	if diff >=0 {
		for i := maxCompo - 1; i >= 0; i-- {
			str1 := []rune(compo1[i])
			if i-diff >= 0 {
				str2 := []rune(compo2[i-diff])
				distance := levenshtein(str1,str2)
				totalDistance += distance
			}else{
				break
			}
		}
	} else{
		for i := maxCompo - 1; i >= 0; i-- {
			str1 := []rune(compo2[i])
			if i+diff >= 0 {
				str2 := []rune(compo1[i+diff])
				distance := levenshtein(str1,str2)
				totalDistance += distance
			}else{
				break
			}
		}
	}
	return totalDistance
}


//Algorithm 7 Identifying suspicious apps
func (t *B2csmChaincode) urlIdentifySuspiciousApps(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	const datasetName  = "gtmw"
	var suspiciousAppsMap map [int][]string
	suspiciousAppsMap = make(map [int][]string)
	var suspiciousAppsList []string
	var maliciousAppExist bool = false
	var suspiciousURLAppsMap = make(map [string][]string)
	var output =[]string{}

	
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3 argument: [maliciousApp, tStart, tEnd]")
	}

	maliciousApp := args[0]
	tStart, _ := strconv.Atoi(args[1])
	tEnd, _ := strconv.Atoi(args[2])

	if tStart > tEnd {
		//TODO: compare with current real timestamp when tStart and tEnd is real timestamp
		return shim.Error("Incorrect tStart(t1) or tEnd(t2)")
	}
	var visitedURLsUnion  []string
	
	// get the block index from tStart (t1) to tEnd (t2)
	for i := tStart; i <= tEnd ; i++ {
		var visitedURLs []string
		var suspiciousApps []string
		blockIndex, err := stub.GetState(datasetName + "-" + strconv.Itoa(i))
		var blockIndexInt int
		if err != nil{
			jsonResp := "{\"Error\":\"Failed to get block index for day " + strconv.Itoa(i) + "\"}"
			return shim.Error(jsonResp)
		}
		if blockIndex == nil{
			jsonResp := "{\"Error\":\"No data for day " + strconv.Itoa(i) + "\"}"
			return shim.Error(jsonResp)
		}else{
			blockIndexInt, _ = strconv.Atoi(string(blockIndex))
		}
		for j := 0; j < blockIndexInt; j++ {
			datasetBlock, err := stub.GetState(datasetName + "-" + strconv.Itoa(i) + "-" + strconv.Itoa(j))
			if err != nil{
				jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + " for day " + strconv.Itoa(i) + "\"}"
				return shim.Error(jsonResp)
			}
			if datasetBlock == nil{
				jsonResp := "{\"Error\":\"No dataset of block " + strconv.Itoa(j) + " for day " + strconv.Itoa(i) + "\"}"
				return shim.Error(jsonResp)
			}
			var dat WebData
			if err := json.Unmarshal(datasetBlock, &dat); err != nil {
				panic(err)
			}
		
			rowApps := dat.RowAPPs
			columnURLs := dat.ColumnURLs
			dayData := dat.DayData

			var contain int = StringsContains(rowApps, maliciousApp)
			if contain == -1 {
				continue
			} else{
				maliciousAppExist = true
				for p := 0; p < len(columnURLs); p++ {
					victimFlag, err := strconv.Atoi(dayData[contain][p])
					if err != nil{
						panic(err)
					}
					if victimFlag > 0 && (StringsContains(visitedURLs,columnURLs[p])== -1){
						visitedURLs = append(visitedURLs, columnURLs[p])
						if StringsContains(visitedURLsUnion,columnURLs[p])== -1{
							visitedURLsUnion = append(visitedURLsUnion, columnURLs[p])
						}
					}
				}
			}
		}
		//get the suspicious Apps visiting the above URLs
		if len(visitedURLs) > 0 {
			for j := 0; j < blockIndexInt; j++ {
				datasetBlock, err := stub.GetState(datasetName + "-" + strconv.Itoa(i) + "-" + strconv.Itoa(j))
				if err != nil{
					jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + "for day " + strconv.Itoa(i) + "\"}"
					return shim.Error(jsonResp)
				}
				var dat WebData
				if err := json.Unmarshal(datasetBlock, &dat); err != nil {
					panic(err)
				}
				rowApps := dat.RowAPPs
				columnURLs := dat.ColumnURLs
				dayData := dat.DayData

				for _, visitURL := range visitedURLs {
					var columnIndex int = StringsContains(columnURLs, visitURL)
					for p := 0; p < len(rowApps); p++ {
						suspiciousAppFlag, err := strconv.Atoi(dayData[p][columnIndex])
						if err != nil {
							panic(err)
						}
						if suspiciousAppFlag > 0{
							if _, ok := suspiciousURLAppsMap[visitURL]; ok {
								if  StringsContains(suspiciousURLAppsMap[visitURL], rowApps[p]) == -1{
									suspiciousURLAppsMap[visitURL]= append(suspiciousURLAppsMap[visitURL], rowApps[p])
								}
							} else{
								suspiciousURLAppsMap[visitURL]= append(suspiciousURLAppsMap[visitURL], rowApps[p])
							}
						}
						if suspiciousAppFlag > 0 && (StringsContains(suspiciousApps, rowApps[p]) == -1) {
							suspiciousApps = append(suspiciousApps, rowApps[p])
						}
					}
				}
			}
		}
		suspiciousAppsMap[i] = suspiciousApps
	}

	if !maliciousAppExist{
		return shim.Error("Input App MD5 does not exist")
	}
	
	for _, suspiciousAppsT := range suspiciousAppsMap{
		for _, s:=range suspiciousAppsT{
			if StringsContains(suspiciousAppsList, s) == -1{
				suspiciousAppsList = append(suspiciousAppsList, s)
			}
		}
	}


	output = append(output,"[" + strings.Join(visitedURLsUnion,",")+"]")
	output = append(output, "#")
	output = append(output,"[" + strings.Join(suspiciousAppsList,",")+"]")
	output = append(output,"$")
	var counter =1
	for _, visitedURL := range visitedURLsUnion{
		fmt.Println("suspiciousApp",visitedURL)
		output = append(output,"[" + strings.Join(suspiciousURLAppsMap[visitedURL],",")+"]" )
		if counter < len(visitedURLsUnion){
			output = append(output,";")
		}
		counter ++
	}

	var suspiciousAppsBytes []byte
	if suspiciousAppsList == nil{
		suspiciousAppsBytes, _ = json.Marshal("No suspicious applications")
	}else{
		suspiciousAppsBytes, _ = json.Marshal(output)
	}	
	return shim.Success(suspiciousAppsBytes)
}



//Algorithm 8: Identifying victims of malicious URL
func (t *B2csmChaincode) urlIdentifyVictimApps(stub shim.ChaincodeStubInterface, args []string) pb.Response  {
	const datasetName  = "gtmw"
	var victimAppsMap map [int][]string
	victimAppsMap = make(map [int][]string)
	var victimAppsList []string
	var maliciousURLExist bool = false
	
	
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3 argument: [maliciousURL, tStart, tEnd]")
	}
	maliciousURL := args[0]
	tStart, _ := strconv.Atoi(args[1])
	tEnd, _ := strconv.Atoi(args[2])

	if tStart > tEnd {
		//TODO: compare with current real timestamp when tStart and tEnd is real timestamp
		return shim.Error("Incorrect tStart(t1) or tEnd(t2)")
	}

	// get the block index from tStart (t1) to tEnd (t2)
	for i := tStart; i <= tEnd ; i++ {
		var victimApps []string
		blockIndex, err := stub.GetState(datasetName + "-" + strconv.Itoa(i))
		var blockIndexInt int
		if err != nil{
			jsonResp := "{\"Error\":\"Failed to get block index for day " + strconv.Itoa(i) + "\"}"
			return shim.Error(jsonResp)
		}
		if blockIndex == nil{
			jsonResp := "{\"Error\":\"No data for day " + strconv.Itoa(i) + "\"}"
			return shim.Error(jsonResp)
		}else{
			blockIndexInt, _ = strconv.Atoi(string(blockIndex))
		}

		for j := 0; j < blockIndexInt; j++ {
			datasetBlock, err := stub.GetState(datasetName + "-" + strconv.Itoa(i) + "-" + strconv.Itoa(j))
			if err != nil{
				jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + "for day " + strconv.Itoa(i) + "\"}"
				return shim.Error(jsonResp)
			}
			if datasetBlock == nil{
				jsonResp := "{\"Error\":\"No dataset of block " + strconv.Itoa(j) + " for day " + strconv.Itoa(i) + "\"}"
				return shim.Error(jsonResp)
			}
			var dat WebData
			if err := json.Unmarshal(datasetBlock, &dat); err != nil {
				panic(err)
			}
			rowApps := dat.RowAPPs
			columnURLs := dat.ColumnURLs
			dayData := dat.DayData

			var contain int = StringsContains(columnURLs, maliciousURL)
			if contain == -1 { //unable to identify the victim's IP
				continue
			} else{
				maliciousURLExist = true
				for p := 0; p < len(rowApps); p++ {
					victimFlag, err := strconv.Atoi(dayData[p][contain])
					if err != nil{
						panic(err)
					}
					if victimFlag > 0 && (StringsContains(victimApps,rowApps[p])== -1){
						victimApps = append(victimApps, rowApps[p])
					}
				}
			}
		}
		victimAppsMap[i] = victimApps
	}

	for _, victimAppsT := range victimAppsMap{
		for _, v:=range victimAppsT{
			if StringsContains(victimAppsList, v) == -1{
				victimAppsList = append(victimAppsList, v)
			}
		}
	}

	if !maliciousURLExist{
		return shim.Error("Input malicous URL does not exist")
	}

	var victimAppsBytes []byte
	if victimAppsList == nil{
		victimAppsBytes, _ = json.Marshal("No application has accessed the malicious URL")
	}else{
		victimAppsBytes, _ = json.Marshal(victimAppsList)
	}	
	return shim.Success(victimAppsBytes)
}


//Algorithm 9: Identifying victims of spoofed URL
func (t *B2csmChaincode) urlSpoofedApps(stub shim.ChaincodeStubInterface, args []string) (pb.Response) {
	const datasetName  = "gtmw"
	var victimAppsMap map [int][]string
	victimAppsMap = make(map [int][]string)
	var victimAppsList []string

	var spoofedURLsMap map [int][]string
	spoofedURLsMap = make(map [int][]string)
	var spoofedURLsList =[]string{}

	var spoofedURLAppsMap = make(map [string][]string)
	output :=[]string{}



	if len(args) != 4 {
		return shim.Error("Incorrect number of arguments. Expecting 4 argument: [providedURL, tStart, tEnd, distanceThreshold]")
	}

	providedURL := args[0]
	tStart, _ := strconv.Atoi(args[1])
	tEnd, _ := strconv.Atoi(args[2])
	distanceThreshold, _ := strconv.Atoi(args[3])

	if tStart > tEnd {
		return shim.Error("Incorrect tStart(t1) or tEnd(t2)")
	}
        
	if distanceThreshold > 5 {
		return shim.Error("Too high threshold")
	}


	for i := tStart; i <= tEnd ; i++ {
		var victimApps []string
		var spoofedURLs []string

		blockIndex, err := stub.GetState(datasetName + "-" + strconv.Itoa(i))
		var blockIndexInt int
		if err != nil{
			jsonResp := "{\"Error\":\"Failed to get block index for day " + strconv.Itoa(i) + "\"}"
			return shim.Error(jsonResp)
		}
		if blockIndex == nil{
			jsonResp := "{\"Error\":\"No data for day " + strconv.Itoa(i) + "\"}"
			return shim.Error(jsonResp)
		}else{
			blockIndexInt, _ = strconv.Atoi(string(blockIndex))
		}

		for j := 0; j < blockIndexInt; j++ {
			datasetBlock, err := stub.GetState(datasetName + "-" + strconv.Itoa(i) + "-" + strconv.Itoa(j))
			if err != nil{
				jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + "for day " + strconv.Itoa(i) + "\"}"
				return shim.Error(jsonResp)
			}
			if datasetBlock == nil{
				jsonResp := "{\"Error\":\"No dataset of block " + strconv.Itoa(j) + " for day " + strconv.Itoa(i) + "\"}"
				return shim.Error(jsonResp)
			}

			var dat WebData
			if err := json.Unmarshal(datasetBlock, &dat); err != nil {
				panic(err)
			}
		
			rowApps := dat.RowAPPs
			columnURLs := dat.ColumnURLs
			dayData := dat.DayData

			for _, u := range columnURLs {
				if  editDistance("http://"+u, "http://"+providedURL) > 0 && editDistance("http://"+u, "http://"+providedURL) <= distanceThreshold && (StringsContains(spoofedURLs, u) == -1) {
					spoofedURLs = append(spoofedURLs, u)
				}
			}

			for _, su := range spoofedURLs {
				indexURL := StringsContains(columnURLs, su)
				if indexURL == -1 {
					continue
				} else {
					for p := 0; p < len(rowApps); p++ {
						victimFlag, err := strconv.Atoi(dayData[p][indexURL])
						if err != nil {
							panic(err)
						}

					        if victimFlag > 0 {
							if _, ok := spoofedURLAppsMap[su]; ok {
								if  StringsContains(spoofedURLAppsMap[su], rowApps[p]) == -1{
									spoofedURLAppsMap[su]= append(spoofedURLAppsMap[su], rowApps[p])
								}
							} else{
								spoofedURLAppsMap[su]= append(spoofedURLAppsMap[su], rowApps[p])
							}
						}

						if victimFlag > 0 && (StringsContains(victimApps, rowApps[p]) == -1) {
							victimApps = append(victimApps, rowApps[p])
						}
					}
				}
			}
		}
		victimAppsMap[i] = victimApps
		spoofedURLsMap[i] = spoofedURLs
	}

	for _, victimAppsT := range victimAppsMap{
		for _, v:=range victimAppsT{
			if StringsContains(victimAppsList, v) == -1{
				victimAppsList = append(victimAppsList, v)
			}
		}
	}

	for _, spoofedURLsT := range spoofedURLsMap{
		for _, s:=range spoofedURLsT{
			if StringsContains(spoofedURLsList, s) == -1{
				spoofedURLsList = append(spoofedURLsList, s)
			}
		}
	}

	
	if len(spoofedURLsList) != 0 {
		output = append(output,"[" + strings.Join(spoofedURLsList,",")+"]")
		output = append(output, "#")
		output = append(output,"[" + strings.Join(victimAppsList,",")+"]")
		output = append(output,"$")
		var counter =1
		for _, visitedURL := range spoofedURLsList{
			fmt.Println("suspiciousApp",visitedURL)
			output = append(output,"[" + strings.Join(spoofedURLAppsMap[visitedURL],",")+"]" )
			if counter < len(spoofedURLsList){
				output = append(output,";")
			}
			counter ++
		}
	}
	
	fmt.Printf("Query Response of potential victimApps: %v\n", victimAppsList)
	fmt.Printf("Query Response of spoofedURLs: %v\n", spoofedURLsList)
	outputBytes, _ := json.Marshal(output)
	return shim.Success(outputBytes)
}

func main()  {
	err := shim.Start(new(B2csmChaincode))
	if err != nil {
		fmt.Printf("failed: %v", err)
	}
}



