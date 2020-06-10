#!/bin/sh
docker run --rm -it \
--network="b2csmnetwork" \
--name couchdb_peer3_ent1 \
-p 5984:5984 \
-e COUCHDB_USER=admin \
-e COUCHDB_PASSWORD=password \
-e CORE_VM_DOCKER_HOSTCONFIG_NETWORKMODE=b2csmnetwork hyperledger/fabric-couchdb
