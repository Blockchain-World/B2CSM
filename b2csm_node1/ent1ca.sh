#!/bin/sh
docker run --rm \
-it \
--network="b2csmnetwork" \
--name ca.ent1.b2csm \
-p 7054:7054 \
-e FABRIC_CA_HOME=/etc/hyperledger/fabric-ca-server-config \
-e FABRIC_CA_SERVER_CA_NAME=ca.ent1.b2csm \
-e FABRIC_CA_SERVER_CA_CERTFILE=/etc/hyperledger/fabric-ca-server-config/ca.ent1.b2csm-cert.pem \
-e FABRIC_CA_SERVER_CA_KEYFILE=/etc/hyperledger/fabric-ca-server-config/982dd87991df3f93defe9527d693b671efa17d30b63fc64c4bb67454635dde60_sk \
-v $(pwd)/crypto-config/peerOrganizations/ent1.b2csm/ca/:/etc/hyperledger/fabric-ca-server-config \
-v $(pwd)/fabric-ca-server-config.yaml:/etc/hyperledger/fabric-ca-server-config/fabric-ca-server-config.yaml \
-e CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=b2csmnetwork hyperledger/fabric-ca sh \
-c 'fabric-ca-server start -b admin:adminpw -d'
