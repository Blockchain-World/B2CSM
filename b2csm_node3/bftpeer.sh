#!/bin/sh
docker create --rm -it \
--network=bridge \
--name 2.peer.ent1.b2csm \
--privileged \
-p 7051:7051 \
-p 7053:7053 \
-v $(pwd)/peer_material/:/bft-config/ \
-v $(pwd)/crypto-config/peerOrganizations/ent1.b2csm/peers/2.peer.ent1.b2csm/msp:/bft-config/msp \
-v $(pwd)/channel-artifacts/genesis.block:/bft-config/config/genesis.block \
-v /var/run/:/var/run/ \
-e FABRIC_CFG_PATH=/bft-config/ \
-e FRONTEND_CONFIG_DIR=/bft-config/config/ \
hyperledger/fabric-peer:amd64-1.2.0
docker network connect b2csmnetwork 2.peer.ent1.b2csm
docker start -a 2.peer.ent1.b2csm
