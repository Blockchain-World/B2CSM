# B2CSM

This is the code for the B2CSM prototype. It builds on top of the popular permissioned blockchain platform - [Hyperledger Fabric](https://hyperledger-fabric.readthedocs.io/en/release-1.2/whatis.html).

**Note: We use real cyber data during our project, as elaborated in the paper. But here we replace with *synthetic* data (e.g., the IP address in the network topology). It has no any impact for the functions of the prototype.**

## Software Configuration
This prototype run successfully on the following configurations:
- Ubuntu 16.04
- Hyperledger Fabric (v1.2)
- Java 1.8.0
- Golang 1.11.10
- Docker (19.03.2)
- Maven 3.6.3
- Git (2.7.4)

## Network Topology
This prototype runs in a fully distributed environment with **four** peer nodes. As byzantine fault tolerance requires that N > 3f, where N is the total number of the full nodes in the blockchain network, and f is the number of faulty nodes that can be tolerated. In this prototype, it tolerates **one** malicious node to act arbitrarily.

## B2CSM Code
The main files and their functionalities are:

- b2csm_node1  
    - bftorderer.sh (start the orderer service for the ordering service)
    - bftfrontends.sh (start the fontend for oordering service)
    - bftpeer.sh (start the peer service for the node)
    - couchdb_peer0_ent1.sh (start the state database for this node)
    - ent1ca.sh (start the CA service for all nodes)
    - bftclient.sh (start the client, namely the B2CSM App)
    - configtx.yaml (the configuration for enterprises/organizations, orderers, channels, endorsement policy etc.)
    - crypto-config.yaml (generate pk, sk, certificates etc. for nodes and enterprise)

- b2csm_node2
    - similar to node1 without CA service

- b2csm_node3
    - similar to node1 without CA service

- b2csm_node4
    - similar to node1 without CA and frontend service

- b2csm-explorer (the B2CSM middleware)
    - honeypots (N-CSM)
    - nids (T-CSM)
    - gtmw (A-CSM)
    - chaincodes (location: *src/test/fixture/sdkintegration/gocc/sample1/src/github.com/example_cc/*)
- sigverifyService
    - signature verification service for  client 

## Run B2CSM Prototype
### 1. Network Construction
#### 1.1 Clone the code
- `git clone https://github.com/Blockchain-World/B2CSM.git`

#### 1.2 Place code on the servers
- Since B2CSM runs on a fully distributed environment, all files in the *b2csm_nodex* directory ("x" means the four nodes: node1, node2, node3, node4) need to be copied to the four physical servers respectively. 

- The recommended target directory on each server are */opt/gopath/src/b2csm/*, where */opt/gopath* is the golang environment variable configured during the installation of golang environment. 

#### 1.3 Start B2CSM Blockchain Network
- From node1 to node4, start the `orderer` service one by one.
```
./bftorderer.sh
```
**Note:** the order matters, and always start the next orderer after the current one shows `Ready to process operations`.

- From node1 to node3, start the `frontend` service.
```
./bftfrontends.sh
```

- From node1 to node4, start the `state database` - couchdb. For example, on node1:
```
./couchdb_peer0_ent1.sh
```

- On node1, start `CA` service.
```
./ent1ca.sh
```

- From node1 to node4, start the `peer` service:
```
./bftpeer.sh
```
**Note:** If shows `warning`, it is normal since the peers tries to connect other peer nodes which are not started yet. These warning will disappear once all peer nodes find each other via `gossip protocol`.

#### 1.4 Initialize B2CSM Blockahain Network
- On node1, we start the client to initialize the B2CSM blockchain network:
```
./bftclient.sh // enter into the client container
cd bft-config/
./settingup.sh
```
**Note:** 
- the script `settingup.sh` will generate three channels (corresponding to N-CSM, T-CSM and A-CSM), update anchor peers, join peer nodes to these three channels. The script shows `Done` means that it executes successfully. 
- When re-running the script the initialize the blockchain network, the following files need to be removed manually:
```
rm b2csm-*
rm channel-artifacts/b2csm*
rm channel-artifacts/HoneypotEnt1MSPanchor.tx
rm channel-artifacts/NIDSEnt1MSPanchor.tx
rm channel-artifacts/GTMWEnt1MSPanchor.tx
```

Till now, all the terminals running on the four nodes are as follows:
- Node1:

![node1_terminal](https://github.com/Blockchain-World/B2CSM/blob/master/images/node1_Info_Anon.png)

- Node2:

![node2_terminal](https://github.com/Blockchain-World/B2CSM/blob/master/images/node2_Info_Anon.png)

- Node3:

![nonde3_terminal](https://github.com/Blockchain-World/B2CSM/blob/master/images/node3_Info_Anon.png)

- Node4:

![node4_terminal](https://github.com/Blockchain-World/B2CSM/blob/master/images/node4_Info_Anon.png)

### 2. Running Middleware
- The `b2csm-explorer` contains the middleware of B2CSM. Using *manven* can start the project, or simply using an IDE (e.g., IntelliJ IDEA) to start.

### 3. Applications Initialization
- In current prototype, the applications initialization is completed through a tool - `Postman` (Integrating these functions to B2CSM is the future work).

- The `B2CSM_Initialization.json` is exported from `Postman`, and users can import this json file and execute the following scripts:
    - `chaincode install` (install chaincode)
    - `chaincode instantiation` (instantiate chaincode)
    - `replicateLedger` (upload real cyber datasets to B2CSM blockchain and state database)
    - `chaincode invoke` (test invocation of cyber data in B2CSM blockchain network)
    - `queryBlockByNumber` (test retrieving blocks from B2CSM blockchain network according to block number)

The following are some example screenshots:

- Chaincode Installation

![chaincode_installation_N_CSM](https://github.com/Blockchain-World/B2CSM/blob/master/images/chaincode_installation_N_CSM.png)

- Chaincode Instantiation

![chaincode_instantiation_N_CSM](https://github.com/Blockchain-World/B2CSM/blob/master/images/chaincode_instantiation_N_CSM.PNG)

- Data Replication (N-CSM)

![data_replication_N_CSM](https://github.com/Blockchain-World/B2CSM/blob/master/images/data_replication_N_CSM.PNG)

### 4. Client Side
- Run `sigVerifyService` using maven or simply using an IDE. This service is to verify the signatures received from multiple B2CSM middlewares. The start operations are similar to start the `b2csm-explorer`.

- From browser, a client can interact with the B2CSM prototype by entering one of the middleware server address, for example:

`http://IP_ADDRESS:PORT/b2csm/index`


### 5. System Screenshots
The following are some screenshots of the prototype. For demo purpose, some parameters (e.g., the topology (i.e., IP address) of the network.) are *hard-coded* and the visualization of specific CSM functions form one of our future work.

#### 5.1 N-CSM

- N-CSM (Query 1: *Identify Victims*)

![N_CSM_Q1](https://github.com/Blockchain-World/B2CSM/blob/master/images/N_CSM_Q1.PNG)

- N-CSM (Query 2: *Identify Potential Attackers*)

![N_CSM_Q2](https://github.com/Blockchain-World/B2CSM/blob/master/images/N_CSM_Q2.PNG)

- N-CSM (Query 3: *Identify Potential Victims*)

![N_CSM_Q3](https://github.com/Blockchain-World/B2CSM/blob/master/images/N_CSM_Q3.PNG)

#### 5.2 T-CSM

- T-CSM (Query 1: *Infer Attack Paths*)

![T_CSM_Q1](https://github.com/Blockchain-World/B2CSM/blob/master/images/T_CSM_Q1.PNG)

- T-CSM (Query 2: *Identify Victims of Zero-day Attacks*)

![T_CSM_Q2](https://github.com/Blockchain-World/B2CSM/blob/master/images/T_CSM_Q2.PNG)

- T-CSM (Query 3: *Measure Cascading Damages*)

![T_CSM_Q3](https://github.com/Blockchain-World/B2CSM/blob/master/images/T_CSM_Q3.PNG)

#### 5.3 A-CSM

- A-CSM (Query 1: *Identify Suspicious Apps*)

*(Here, the APP ID is too long to show properly in web page, so only the first several bits are shown in the visualized result)*

![A_CSM_Q1](https://github.com/Blockchain-World/B2CSM/blob/master/images/A_CSM_Q1.PNG)

*(Here, the APP ID is too long to show properly in web page, so only the first several bits are shown in the visualized result)*

- A-CSM (Query 2: *Identify Victim Apps*)

![A_CSM_Q2](https://github.com/Blockchain-World/B2CSM/blob/master/images/A_CSM_Q2.PNG)

- A-CSM (Query 3: *Identify Victims of Spoofed Apps*)

*(Here, the APP ID is too long to show properly in web page, so only the first several bits are shown in the visualized result)*

![A_CSM_Q3](https://github.com/Blockchain-World/B2CSM/blob/master/images/A_CSM_Q3.PNG)
