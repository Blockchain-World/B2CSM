package main
import (
	"encoding/json"
	"container/list"
	"fmt"
	"github.com/hyperledger/fabric/core/chaincode/shim"
	pb "github.com/hyperledger/fabric/protos/peer"
	"strconv"
	"strings"
	"net"
	"bytes"
)

type B2csmChaincode struct {
}

type NIDS struct {
	ColumnIPs []string `json:"columnIPs"`
	DayData   [][]string `json:"dayData"`
	Daypoint  string `json:"daypoint"`
	RowsIPs   []string `json:"rowIPs"`
}

type Node struct {
	name string
}

type AttackGraph struct {
	nodes []*Node
	edges map[string]map[string][]string
}


func (t *B2csmChaincode) Init(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("------ B2CSM Init -------")
	return shim.Success(nil)
}

func (t *B2csmChaincode) Invoke(stub shim.ChaincodeStubInterface) pb.Response {
	fmt.Println("------ B2CSM Invoke -------")
	function, args := stub.GetFunctionAndParameters()
	if function == "invoke" {
		return t.invoke(stub, args)
	} else if function == "queryRawData" {
		return t.queryRawData(stub, args)
	} else if function == "queryCSM"{
		return t.queryCSM(stub, args)
	}
	return shim.Error("Invalid invoke function name. Expecting \"initLedger\" \"invoke\" \"query\"")
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
		return t.inferAttackPaths(stub,args[1:4])  //Algorithm 4
	}else if alg == "A2" {
		return t.identifyZeroDay(stub,args[1:4])
	} else if alg == "A3" {
		return t.inferDamages(stub,args[1:4])
	}
	return shim.Error("Invalid query algorithm name. Expecting \"A1\" \"A2\" \"A3\"")
}


func (n *Node) String() string {
	return fmt.Sprintf("%v", n.name)
}

func (g *AttackGraph) AddNode(n *Node) {
	g.nodes = append(g.nodes, n)
}

// AddEdge adds an edge to the graph
func (g *AttackGraph) UpdateEdge(n1, n2 *Node, alert string) {
	if g.edges == nil {
		g.edges = make(map[string]map[string][]string)
	}
	if g.edges[n1.name] == nil {
		g.edges[n1.name] = make(map[string][]string)
	}

	var alerts []string = strings.Split(alert, ",")

	if g.edges[n1.name][n2.name] ==nil{
		g.edges[n1.name][n2.name] = alerts
	} else{
		for _, eachAlert:=range alerts {
			g.edges[n1.name][n2.name] = append(g.edges[n1.name][n2.name], eachAlert)
		}
	}
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

// Contains tells whether a contains x.
func (g *AttackGraph) nodeContains(x string) bool {
	for _, n := range g.nodes {
		if x == n.name {
			return true
		}
	}
	return false
}

func (g *AttackGraph) nodeReference(x string) *Node {
	for _, n := range g.nodes {
		if x == n.name {
			return n
		}
	}
	return nil
}


func subset(setA,setB []string) bool{
	for i := 0; i < len(setA); i++{
		j := 0
		for ; j < len(setB); j++{
			if setA[i] == setB[j]{
				break
			}
		}
		if j == len(setB){
			return false
		}
	}
	return  true
}


func checkIP(ip,ipLower,ipUpper string) bool{
	ip1 := net.ParseIP(ipLower)
	ip2 := net.ParseIP(ipUpper)
	trial := net.ParseIP(ip)
	if trial.To4() == nil {
		return false
	}
	if bytes.Compare(trial, ip1) >= 0 && bytes.Compare(trial, ip2) <= 0 {
		return true
	}
	return false
}


//Algorithm 4
func (t *B2csmChaincode) inferAttackPaths(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	const datasetName  = "nids"
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3 argument: [victimIP, tStart, tEnd]")
	}
	victimIP := args[0]
	tStart, _ := strconv.Atoi(args[1])
	tEnd, _ := strconv.Atoi(args[2])

	ipInternalSubnet1L := "192.168.60.32"
	ipInternalSubnet1U := "192.168.60.63"
	ipInternalSubnet2L := "192.168.60.96"
	ipInternalSubnet2U := "192.168.60.127"

	if !checkIP(victimIP,ipInternalSubnet1L,ipInternalSubnet1U) && !checkIP(victimIP,ipInternalSubnet2L,ipInternalSubnet2U){
		return shim.Error("Incorrect IP address of the victim host in the Internal network :)")
	}

	if tStart > tEnd {
		//TODO: compare with current real timestamp when tStart and tEnd is real timestamp
		return shim.Error("Incorrect tStart(t1) or tEnd(t2)")
	}

	var AG AttackGraph

	root := &Node{
		name: victimIP,
	}
	AG.AddNode(root)

	for i := tEnd; i >= tStart ; i-- {
		queue := list.New() //initial FIFO
		for n := 0; n < len(AG.nodes); n++ {
			queue.PushBack(AG.nodes[n])
		}
		var searchedNodes []string
		for {
			if queue.Len() > 0 {
				qnode := queue.Front()
				blockIndex, err := stub.GetState(datasetName + "-" + "G2" + "-" + strconv.Itoa(i))
				var blockIndexInt int
				if err != nil {
					jsonResp := "{\"Error\":\"Failed to get block index of G2 for day " + strconv.Itoa(i) + "\"}"
					return shim.Error(jsonResp)
				}
				if blockIndex == nil {
					jsonResp := "{\"Error\":\"No data of G2 for day " + strconv.Itoa(i) + "\"}"
					return shim.Error(jsonResp)
				} else {
					blockIndexInt, _ = strconv.Atoi(string(blockIndex))
				}
				for j := 0; j < blockIndexInt; j++ {
					datasetBlock, err := stub.GetState(datasetName + "-" + "G2" + "-" + strconv.Itoa(i) + "-" + strconv.Itoa(j))
					if err != nil {
						jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + " of G2 for day " + strconv.Itoa(i) + "\"}"
						return shim.Error(jsonResp)
					}
					if datasetBlock == nil {
						jsonResp := "{\"Error\":\"No dataset of block " + strconv.Itoa(j) + " of G2 for day " + strconv.Itoa(i) + "\"}"
						return shim.Error(jsonResp)
					}
					var dat NIDS
					if err := json.Unmarshal(datasetBlock, &dat); err != nil {
						panic(err)
					}
					rowIPs := dat.RowsIPs
					columnIPs := dat.ColumnIPs
					dayData := dat.DayData

					var contain int = StringsContains(columnIPs, qnode.Value.(*Node).name)
					if contain == -1 {
						continue
					} else {
						for p := 0; p < len(rowIPs); p++ {
							if dayData[p][contain] != "nil" {
								if !AG.nodeContains(rowIPs[p]) {
									newNode := &Node{
										name: rowIPs[p],
									}
									AG.AddNode(newNode)
									AG.UpdateEdge(newNode, AG.nodeReference(qnode.Value.(*Node).name), dayData[p][contain])
								}
								var queueList []string
								for e := queue.Front(); e != nil; e = e.Next() {
									queueList = append(queueList, e.Value.(*Node).name)
								}
								if StringsContains(queueList, rowIPs[p]) == -1 && (StringsContains(searchedNodes, rowIPs[p]) == -1) {
									queue.PushBack(AG.nodeReference(rowIPs[p]))
								}
							}
						}
					}
				}
				searchedNodes = append(searchedNodes, qnode.Value.(*Node).name)
				queue.Remove(qnode)
			} else {
				break
			}
		}

		indexAG := []int{1, 3}
		for _, ag := range indexAG {
			for n := 0; n < len(AG.nodes); n++ {
				queue.PushBack(AG.nodes[n])
			}
			searchedNodes = []string{}
			for {
				if queue.Len() > 0 {
					qnode := queue.Front()
					blockIndex, err := stub.GetState(datasetName + "-" + "G" + strconv.Itoa(ag) + "-" + strconv.Itoa(i))
					var blockIndexInt int
					if err != nil {
						jsonResp := "{\"Error\":\"Failed to get block index of G" + strconv.Itoa(ag) + " for day " + strconv.Itoa(i) + "\"}"
						return shim.Error(jsonResp)
					}
					if blockIndex == nil {
						jsonResp := "{\"Error\":\"No data of G" + strconv.Itoa(ag) + " for day " + strconv.Itoa(i) + "\"}"
						return shim.Error(jsonResp)
					} else {
						blockIndexInt, _ = strconv.Atoi(string(blockIndex))
					}
					for j := 0; j < blockIndexInt; j++ {
						datasetBlock, err := stub.GetState(datasetName + "-" + "G" + strconv.Itoa(ag) + "-" + strconv.Itoa(i) + "-" + strconv.Itoa(j))
						if err != nil {
							jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + " of G" + strconv.Itoa(ag) + " for day " + strconv.Itoa(i) + "\"}"
							return shim.Error(jsonResp)
						}
						if datasetBlock == nil {
							jsonResp := "{\"Error\":\"No dataset of block " + strconv.Itoa(j) + " of G" + strconv.Itoa(ag) + " for day " + strconv.Itoa(i) + "\"}"
							return shim.Error(jsonResp)
						}
						var dat NIDS
						if err := json.Unmarshal(datasetBlock, &dat); err != nil {
							panic(err)
						}
						rowIPs := dat.RowsIPs
						columnIPs := dat.ColumnIPs
						dayData := dat.DayData

						var contain int = StringsContains(columnIPs, qnode.Value.(*Node).name)
						if contain == -1 {
							continue
						} else {
							for p := 0; p < len(rowIPs); p++ {
								if dayData[p][contain] != "nil" {
									if !AG.nodeContains(rowIPs[p]) {
										newNode := &Node{
											name: rowIPs[p],
										}
										AG.AddNode(newNode)
										AG.UpdateEdge(newNode, AG.nodeReference(qnode.Value.(*Node).name), dayData[p][contain])
									} else {
										AG.UpdateEdge(AG.nodeReference(rowIPs[p]), AG.nodeReference(qnode.Value.(*Node).name), dayData[p][contain])
									}
								}
							}
						}
					}
					searchedNodes = append(searchedNodes, qnode.Value.(*Node).name)
					queue.Remove(qnode)
				} else {
					break
				}
			}
		}
	}
	AG.AdjList()

	var AGBytes []byte
	AGBytes, _ = json.Marshal(AG.edges)
	return shim.Success(AGBytes)
}

func (t *B2csmChaincode) identifyZeroDay(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	const datasetName = "nids"
	var attackSignature []string
	var matchedVictims []string

	if len(args) != 3 {
		fmt.Println("Incorrect number of arguments. Expecting 3 argument: [attackSignature, tStart, tEnd]")
	}

	attackSignature = strings.Split(args[0], ",")
	tStart, _ := strconv.Atoi(args[1])
	tEnd, _ := strconv.Atoi(args[2])

	if tStart > tEnd {
		//TODO: compare with current real timestamp when tStart and tEnd is real timestamp
		fmt.Println("Incorrect tStart(t1) or tEnd(t2)")
	}

	for t := tStart; t <= tEnd; t++ {
		for indexG := 1; indexG <= 3; indexG++ {
			blockIndex, err := stub.GetState(datasetName + "-" + "G" + strconv.Itoa(indexG) + "-" + strconv.Itoa(t))
			var blockIndexInt int
			if err != nil {
				jsonResp := "{\"Error\":\"Failed to get block index of G" + strconv.Itoa(indexG) + " for day " + strconv.Itoa(t) + "\"}"
				return shim.Error(jsonResp)
			}
			if blockIndex == nil {
				jsonResp := "{\"Error\":\"No data of G" + strconv.Itoa(indexG) + " for day " + strconv.Itoa(t) + "\"}"
				return shim.Error(jsonResp)
			} else {
				blockIndexInt, _ = strconv.Atoi(string(blockIndex))
			}
			for j := 0; j < blockIndexInt; j++ {
				datasetBlock, err := stub.GetState(datasetName + "-" + "G" + strconv.Itoa(indexG) + "-" + strconv.Itoa(t) + "-" + strconv.Itoa(j))
				if err != nil {
					jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + " of G" + strconv.Itoa(indexG) + " for day " + strconv.Itoa(t) + "\"}"
					return shim.Error(jsonResp)
				}
				if datasetBlock == nil {
					jsonResp := "{\"Error\":\"No dataset of block " + strconv.Itoa(j) + " of G" + strconv.Itoa(indexG) + " for day " + strconv.Itoa(t) + "\"}"
					return shim.Error(jsonResp)
				}
				var dat NIDS
				if err := json.Unmarshal(datasetBlock, &dat); err != nil {
					panic(err)
				}
				rowIPs := dat.RowsIPs
				columnIPs := dat.ColumnIPs
				dayData := dat.DayData

				for p := 0; p < len(rowIPs); p++ {
					for q := 0; q < len(columnIPs); q++ {
						alters := strings.Split(dayData[p][q], ",")
						if subset(attackSignature, alters) {
							s := "(" + strconv.Itoa(t)+ ", " + rowIPs[p] + ", " + columnIPs[q] + ")"
							matchedVictims = append(matchedVictims, s)
						}
					}
				}
			}
		}
	}
	fmt.Println(matchedVictims)
	var victimZeroDayBytes []byte
	if matchedVictims == nil{
		victimZeroDayBytes, _ = json.Marshal("No victims of zero-day attacks")
	}else{
		victimZeroDayBytes, _ = json.Marshal(matchedVictims)
	}
	return shim.Success(victimZeroDayBytes)
}

func (t *B2csmChaincode) inferDamages(stub shim.ChaincodeStubInterface, args []string) pb.Response {
	const datasetName  = "nids"
	if len(args) != 3 {
		return shim.Error("Incorrect number of arguments. Expecting 3 argument: [attackerIP, tStart, tEnd]")
	}

	attackerIP := args[0]
	tStart, _ := strconv.Atoi(args[1])
	tEnd, _ := strconv.Atoi(args[2])

	ipInternalSubnet1L := "192.168.60.1"
	ipInternalSubnet1U := "192.168.60.63"
	ipInternalSubnet2L := "192.168.60.96"
	ipInternalSubnet2U := "192.168.60.127"

	if checkIP(attackerIP,ipInternalSubnet1L,ipInternalSubnet1U) || checkIP(attackerIP,ipInternalSubnet2L,ipInternalSubnet2U){
		return shim.Error("Incorrect IP address of an attacker from the Internet^_^")
	}

	if tStart > tEnd {
		//TODO: compare with current real timestamp when tStart and tEnd is real timestamp
		return shim.Error("Incorrect tStart(t1) or tEnd(t2)")
	}

	var AG AttackGraph

	root := &Node{
		name: attackerIP,
	}
	AG.AddNode(root)

	for i := tStart; i <= tEnd ; i++ {
		queue := list.New() //initial FIFO
		var searchedNodes []string
		indexAG := []int{1, 3}
		for _, ag := range indexAG {
			for n := 0; n < len(AG.nodes); n++ {
				queue.PushBack(AG.nodes[n])
			}
			searchedNodes = []string{}
			for {
				if queue.Len() > 0 {
					qnode := queue.Front()
					blockIndex, err := stub.GetState(datasetName + "-" + "G" + strconv.Itoa(ag) + "-" + strconv.Itoa(i))
					var blockIndexInt int
					if err != nil {
						jsonResp := "{\"Error\":\"Failed to get block index of G" + strconv.Itoa(ag) + " for day " + strconv.Itoa(i) + "\"}"
						return shim.Error(jsonResp)
					}
					if blockIndex == nil {
						jsonResp := "{\"Error\":\"No data of G" + strconv.Itoa(ag) + " for day " + strconv.Itoa(i) + "\"}"
						return shim.Error(jsonResp)
					} else {
						blockIndexInt, _ = strconv.Atoi(string(blockIndex))
					}
					for j := 0; j < blockIndexInt; j++ {
						datasetBlock, err := stub.GetState(datasetName + "-" + "G" + strconv.Itoa(ag) + "-" + strconv.Itoa(i) + "-" + strconv.Itoa(j))
						if err != nil {
							jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + " of G" + strconv.Itoa(ag) + " for day " + strconv.Itoa(i) + "\"}"
							return shim.Error(jsonResp)
						}
						if datasetBlock == nil {
							jsonResp := "{\"Error\":\"No dataset of block " + strconv.Itoa(j) + " of G" + strconv.Itoa(ag) + " for day " + strconv.Itoa(i) + "\"}"
							return shim.Error(jsonResp)
						}
						var dat NIDS
						if err := json.Unmarshal(datasetBlock, &dat); err != nil {
							panic(err)
						}
						rowIPs := dat.RowsIPs
						columnIPs := dat.ColumnIPs
						dayData := dat.DayData

						var contain int = StringsContains(rowIPs, qnode.Value.(*Node).name)
						if contain == -1 {
							continue
						} else {
							for p := 0; p < len(columnIPs); p++ {
								if dayData[contain][p] != "nil" {
									if !AG.nodeContains(columnIPs[p]) {
										newNode := &Node{
											name: columnIPs[p],
										}
										AG.AddNode(newNode)
										AG.UpdateEdge(AG.nodeReference(qnode.Value.(*Node).name),newNode, dayData[contain][p])
									}
								}
							}
						}
					}
					searchedNodes = append(searchedNodes, qnode.Value.(*Node).name)
					queue.Remove(qnode)
				} else {
					break
				}
			}
		}

		for n := 0; n < len(AG.nodes); n++ {
			queue.PushBack(AG.nodes[n])
		}
		searchedNodes = []string{}

		for {
			if queue.Len() > 0 {
				qnode := queue.Front()
				blockIndex, err := stub.GetState(datasetName + "-" + "G2" + "-" + strconv.Itoa(i))
				var blockIndexInt int
				if err != nil {
					jsonResp := "{\"Error\":\"Failed to get block index of G2 for day " + strconv.Itoa(i) + "\"}"
					return shim.Error(jsonResp)
				}
				if blockIndex == nil {
					jsonResp := "{\"Error\":\"No data of G2 for day " + strconv.Itoa(i) + "\"}"
					return shim.Error(jsonResp)
				} else {
					blockIndexInt, _ = strconv.Atoi(string(blockIndex))
				}
				for j := 0; j < blockIndexInt; j++ {
					datasetBlock, err := stub.GetState(datasetName + "-" + "G2" + "-" + strconv.Itoa(i) + "-" + strconv.Itoa(j))
					if err != nil {
						jsonResp := "{\"Error\":\"Failed to get dataset block " + strconv.Itoa(j) + " of G2 for day " + strconv.Itoa(i) + "\"}"
						return shim.Error(jsonResp)
					}
					if datasetBlock == nil {
						jsonResp := "{\"Error\":\"No dataset of block " + strconv.Itoa(j) + " of G2 for day " + strconv.Itoa(i) + "\"}"
						return shim.Error(jsonResp)
					}
					var dat NIDS
					if err := json.Unmarshal(datasetBlock, &dat); err != nil {
						panic(err)
					}
					rowIPs := dat.RowsIPs
					columnIPs := dat.ColumnIPs
					dayData := dat.DayData

					var contain int = StringsContains(rowIPs, qnode.Value.(*Node).name)
					if contain == -1 {
						continue
					} else {
						for p := 0; p < len(columnIPs); p++ {
							if dayData[contain][p] != "nil" {
								if !AG.nodeContains(columnIPs[p]) {
									newNode := &Node{
										name: columnIPs[p],
									}
									AG.AddNode(newNode)
									AG.UpdateEdge(AG.nodeReference(qnode.Value.(*Node).name), newNode, dayData[contain][p])
								}
								var queueList []string
								for e := queue.Front(); e != nil; e = e.Next() {
									queueList = append(queueList, e.Value.(*Node).name)
								}
								if StringsContains(queueList, columnIPs[p]) == -1 && (StringsContains(searchedNodes, columnIPs[p]) == -1) {
									queue.PushBack(AG.nodeReference(columnIPs[p]))
								}
							}
						}
					}
				}
				searchedNodes = append(searchedNodes, qnode.Value.(*Node).name)
				queue.Remove(qnode)
			} else {
				break
			}
		}
	}
	AG.AdjList()

	var AGBytes []byte
	AGBytes, _ = json.Marshal(AG.edges)
	return shim.Success(AGBytes)
}

func (g *AttackGraph) AdjList() {
	s := ""
	for i := 0; i < len(g.nodes); i++ {
		s += g.nodes[i].String() + " -> "

		for j := range g.edges[g.nodes[i].name] {
			s += j + " "
		}
		s += "\n"
	}
	fmt.Println(s)
}

func (g *AttackGraph) AdjAlertList() {
	s := ""
	for i := 0; i < len(g.nodes); i++ {
		s = g.nodes[i].String() + " -> "

		for j := range g.edges[g.nodes[i].name] {
			for _, st := range g.edges[g.nodes[i].name][j] {
				s += st + " "
			}
		}
		s += "\n"
		fmt.Println(s)
	}
}

func main(){
	err := shim.Start(new(B2csmChaincode))
	if err != nil {
		fmt.Printf("failed: %v", err)
	}
}



