#!/bin/sh
docker run --rm -it \
--network="b2csmnetwork" \
--name 1.orderer.b2csm \
-v $(pwd)/orderingnode_material/:/bft-config/ \
-v $(pwd)/crypto-config/ordererOrganizations/orderer.b2csm/orderers/1.orderer.b2csm/msp:/bft-config/msp \
-v $(pwd)/channel-artifacts/:/bft-config/channel-artifacts/ \
-e NODE_CONFIG_DIR=/bft-config/config \
-e ORDERER_GENERAL_GENESISFILE=/bft-config/channel-artifacts/genesis.block \
-e ORDERER_GENERAL_LOCALMSPID=OrdererMSP \
-e ORDERER_GENERAL_LOCALMSPDIR=/bft-config/msp \
bftsmart/fabric-orderingnode:amd64-1.2.0 1
