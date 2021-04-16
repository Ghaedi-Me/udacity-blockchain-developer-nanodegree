/* ===== Blockchain Class ==========================
|  Class with a constructor for new blockchain 		|
|  ================================================*/

const SHA256 = require('crypto-js/sha256');
const LevelSandbox = require('./LevelSandbox.js');
const Block = require('./Block.js');

class Blockchain {
    constructor() {
        this.bd = new LevelSandbox.LevelSandbox();
        this.generateGenesisBlock();
    }

    // Helper method to create a Genesis Block (always with height = 0)
    // You have to options, because the method will always execute when you create your blockchain
    // you will need to set this up statically or instead you can verify if the height !== 0 then you
    // will not create the genesis block
    generateGenesisBlock(){
        this.getBlockHeight().then((blockHeight) => {
            if((blockHeight+1) !== 0);
            else{
                this.addBlock(new Block.Block("First block in the chain - Genesis block"));
            }
        }) .catch((err) => {console.log(err)})
    }

    // Get block height, it is a helper method that return the height of the blockchain
    getBlockHeight() {
        return new Promise((resolve, reject) => {
            this.bd.getBlocksCount().then((blocksCount) => {
                resolve(blocksCount - 1);
            }).catch((err) => {
                reject(err);
            })
        })
    }

    // Add new block
    addBlock(block) {
        return new Promise((resolve, reject) => {
            // Block height
            this.getBlockHeight().then((blockHeight) => {
                block.height = blockHeight + 1;
                // UTC timestamp
                block.time = new Date().getTime().toString().slice(0,-3);
                // previous block hash
                if(block.height>0){
                    this.getBlockByHeight(block.height-1).then((previousBlock) => {
                        block.previousBlockHash = previousBlock.hash;
                        // Block hash with SHA256 using block and converting to a string
                        block.hash = SHA256(JSON.stringify(block)).toString();
                        // Adding block object to chain
                        this.bd.addLevelDBData(block.height, JSON.stringify(block).toString()).then((addedBlock) => {
                            resolve(addedBlock);
                        }).catch((err) => {
                            reject(err);
                        });
                    }).catch((err) => {
                        reject(err);
                    })
                }
                else {
                    // Block hash with SHA256 using block and converting to a string
                    block.hash = SHA256(JSON.stringify(block)).toString();
                    // Adding block object to chain
                    this.bd.addLevelDBData(block.height, JSON.stringify(block).toString()).then((addedBlock) => {
                        resolve(addedBlock);
                    }).catch((err) => {
                        reject(err);
                    });
                }
            }).catch((err) => {
                reject(err);
            })
        })
    }

    // Validate if Block is being tampered by Block Height
    validateBlock(height) {
        return new Promise((resolve, reject) => {
            // get block object
            this.getBlockByHeight(height).then((res) => {
                let block = res;
                // get block hash
                let blockHash = block.hash;
                // remove block hash to test block integrity
                block.hash = '';
                // generate block hash
                let validBlockHash = SHA256(JSON.stringify(block)).toString();
                // Compare
                if (blockHash===validBlockHash) {
                    resolve(true);
                } else {
                    resolve(false);
                }
            }).catch((err) => {
                reject(err);
            })
        })
    }

    // Validate Blockchain
    validateChain() {
        return new Promise((resolve, reject) => {
            let errorLog = [];
            this.getBlockHeight().then((blockHeight) => {
                let blocksCount = blockHeight + 1;
                for (var i = 0; i < blocksCount-1; i++) {
                    // validate block
                    this.validateBlock(i).then((res) => {
                        if(!res) errorLog.push(i);
                        // compare blocks hash link
                        this.getBlockByHeight(i).then((block) => {
                            let blockHash = block.hash;
                            this.getBlockByHeight(i+1).then((nextBlock) => {
                                let previousHash = nextBlock.previousBlockHash;
                                if (blockHash!==previousHash) {
                                    errorLog.push(i);
                                }
                            }).catch((err) => {
                                reject(err);
                            })
                        }).catch((err) => {
                            reject(err);
                        }) 
                    }).catch((err) => {
                        reject(err);
                    })
                }
            }).catch((err) => {
                reject(err);
            })
            resolve(errorLog);
        })
    }

    // Get Block By Hash
    getBlockByHash(hash) {
        return new Promise((resolve, reject) => {
            this.bd.getBlockByHash(hash).then((block) => {
                resolve(JSON.parse(block));
            }).catch((err) => {
                reject(err);
            })
        })
    }

    // Get Block By Wallet Address
    getBlockByWalletAddress(address) {
        return new Promise((resolve, reject) => {
            this.bd.getBlockByWalletAddress(address).then((blocks) => {
                let blocksObj = blocks.map((block) => {return JSON.parse(block)})
                resolve(blocksObj);
            }).catch((err) => {
                reject(err);
            })
        })
    }

    // Get Block By Height
    getBlockByHeight(height) {
        // return object as a single string
        return new Promise((resolve, reject) => {
            this.bd.getLevelDBData(height).then((block) => {
                resolve(JSON.parse(block));
            }).catch((err) => {
                reject(err);
            })
        })
    }
}

module.exports.Blockchain = Blockchain;