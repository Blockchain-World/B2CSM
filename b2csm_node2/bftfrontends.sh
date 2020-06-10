#!/bin/sh
docker run --rm -it \
--network="b2csmnetwork" \
--name 2000.frontend.b2csm \
-p 7050:7050 \
-v $(pwd)/frontend_material/:/bft-config/ \
-v $(pwd)/crypto-config/ordererOrganizations/frontend.b2csm/orderers/2000.frontend.b2csm/msp:/bft-config/msp \
-v $(pwd)/channel-artifacts/genesis.block:/bft-config/config/genesis.block \
-e FABRIC_CFG_PATH=/bft-config/ \
-e FRONTEND_CONFIG_DIR=/bft-config/config/ \
bftsmart/fabric-frontend:amd64-1.2.0 2000
