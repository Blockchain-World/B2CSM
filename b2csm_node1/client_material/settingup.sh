#!/bin/bash
#remove unused files
# rm -rf b2csm-*
# rm -rf ./channel-artifacts/b2csm*
# rm -rf ./channel-artifacts/GTMWEnt1MSPanchor.tx
# rm -rf ./channel-artifacts/HoneypotEnt1MSPanchor.tx
# rm -rf ./channel-artifacts/NIDSEnt1MSPanchor.tx
# sleep 1
source 0.peer.ent1.b2csm.context.sh
echo 'Start to create channels...'
export CHANNEL_NAME=b2csm-honeypots
configtxgen -profile B2CSMChannel -outputCreateChannelTx ./channel-artifacts/b2csmhoneypotschannel.tx -channelID $CHANNEL_NAME
echo ' Create channel: ' + $CHANNEL_NAME
sleep 1

export CHANNEL_NAME=b2csm-nids
configtxgen -profile B2CSMChannel -outputCreateChannelTx ./channel-artifacts/b2csmnidschannel.tx -channelID $CHANNEL_NAME

sleep 1

export CHANNEL_NAME=b2csm-gtmw
configtxgen -profile B2CSMChannel -outputCreateChannelTx ./channel-artifacts/b2csmgtmwchannel.tx -channelID $CHANNEL_NAME
echo ' Create channel: ' + $CHANNEL_NAME
sleep 1
#
echo 'Update the anchor peer node for enterprise...'
configtxgen -profile B2CSMChannel -outputAnchorPeersUpdate ./channel-artifacts/HoneypotEnt1MSPanchor.tx -channelID b2csm-honeypots -asOrg Ent1
sleep 1
#
configtxgen -profile B2CSMChannel -outputAnchorPeersUpdate ./channel-artifacts/NIDSEnt1MSPanchor.tx -channelID b2csm-nids -asOrg Ent1
sleep 1
#
configtxgen -profile B2CSMChannel -outputAnchorPeersUpdate ./channel-artifacts/GTMWEnt1MSPanchor.tx -channelID b2csm-gtmw -asOrg Ent1
sleep 1

echo 'Create and join a new channel...'
source 0.peer.ent1.b2csm.context.sh
peer channel create -o 1000.frontend.b2csm:7050 -c b2csm-honeypots -f ./channel-artifacts/b2csmhoneypotschannel.tx
sleep 1
peer channel create -o 2000.frontend.b2csm:7050 -c b2csm-nids -f ./channel-artifacts/b2csmnidschannel.tx
sleep 1
peer channel create -o 3000.frontend.b2csm:7050 -c b2csm-gtmw -f ./channel-artifacts/b2csmgtmwchannel.tx

echo 'Update anchors...'
source 0.peer.ent1.b2csm.context.sh
peer channel update -o 1000.frontend.b2csm:7050 -c b2csm-honeypots -f ./channel-artifacts/HoneypotEnt1MSPanchor.tx
sleep 1
peer channel update -o 2000.frontend.b2csm:7050 -c b2csm-nids -f ./channel-artifacts/NIDSEnt1MSPanchor.tx
sleep 1
peer channel update -o 3000.frontend.b2csm:7050 -c b2csm-gtmw -f ./channel-artifacts/GTMWEnt1MSPanchor.tx
sleep 1

echo 'Make peers join the channel...'
source 0.peer.ent1.b2csm.context.sh
echo 'Peer 0.peer.ent1.b2csm join the three channels...'
peer channel join -b b2csm-honeypots.block
sleep 1
peer channel join -b b2csm-nids.block
sleep 1
peer channel join -b b2csm-gtmw.block
#
source 1.peer.ent1.b2csm.context.sh
echo 'Peer 1.peer.ent1.b2csm join the three channels...'
peer channel join -b b2csm-honeypots.block
sleep 1
peer channel join -b b2csm-nids.block
sleep 1
peer channel join -b b2csm-gtmw.block
#
source 2.peer.ent1.b2csm.context.sh
echo 'Peer 2.peer.ent1.b2csm join the three channels...'
peer channel join -b b2csm-honeypots.block
sleep 1
peer channel join -b b2csm-nids.block
sleep 1
peer channel join -b b2csm-gtmw.block
#
source 3.peer.ent1.b2csm.context.sh
echo 'Peer 3.peer.ent1.b2csm join the three channels...'
peer channel join -b b2csm-honeypots.block
sleep 1
peer channel join -b b2csm-nids.block
sleep 1
peer channel join -b b2csm-gtmw.block
sleep 1
source 0.peer.ent1.b2csm.context.sh
echo "Done."
