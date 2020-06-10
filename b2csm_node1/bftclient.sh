#!/bin/sh
docker run --rm -it \
--network="b2csmnetwork" \
--name 0.client.ent1.b2csm \
-v $(pwd)/client_material/:/bft-config/ \
-v $(pwd)/crypto-config/peerOrganizations/ent1.b2csm/users/Admin@ent1.b2csm/msp:/bft-config/msp \
-v $(pwd)/crypto-config:/bft-config/crypto-config \
-v $(pwd)/channel-artifacts:/bft-config/channel-artifacts \
-v /opt/gopath/src/github.com/hyperledger/fabric/examples/chaincode/go:/opt/gopath/src/github.com/hyperledger/fabric/examples/chaincode/go \
-v /var/run/:/var/run/ \
-e FABRIC_CFG_PATH=/bft-config/ \
-e CORE_PEER_ADDRESS=0.peer.ent1.b2csm:7051 \
bftsmart/fabric-tools:amd64-1.2.0
