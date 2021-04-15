const bitcoinMessage = require('bitcoinjs-message');

const TimeoutRequestsWindowTime = 5*60*1000;
const TimeoutMempoolValidWindowTime = 30*60*1000;

class Mempool {
    constructor() {
        this.mempool = {};
        this.mempoolValid = {};
        this.timeoutRequests= {};
        this.timeoutMempoolValid = [];
    }

    // Add a new validationRequest or retrieve an existing one
    addRequestValidation(address) {
        return new Promise((resolve, reject) => {
            if (address in this.mempool) {
                const req = this.mempool[address];
                let timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.requestTimeStamp;
                let timeLeft = (TimeoutRequestsWindowTime/1000) - timeElapse;
                req.validationWindow = timeLeft;
                resolve(req);
            } 
            else {
                let timeStamp = (new Date().getTime().toString().slice(0,-3));
                const req = {
                    walletAddress: address,
                    requestTimeStamp: timeStamp,
                    message:`${address}:${timeStamp}:starRegistry`,
                    validationWindow: TimeoutRequestsWindowTime/1000
                }
            
                // Add request to mempool
                this.mempool[address] = req;
                // Set timout to remove entry from mempool
                this.timeoutRequests[req.address] = 
                    setTimeout(() => this.removeValidationRequest(req.address), TimeoutRequestsWindowTime);
                resolve(req);
            }
        })
    }

    // Remove validationRequest on timeout
    removeValidationRequest(address) {
        delete this.mempool[address];
    }

    // Validate request by wallet address
    validateRequestByWallet(address, signature) {
        return new Promise((resolve, reject) => {
            if (address in this.mempoolValid) {
                if (bitcoinMessage.verify(this.mempoolValid[address].status.message, address, signature)) {
                    const req = this.mempoolValid[address];
                    let timeElapse = (new Date().getTime().toString().slice(0,-3)) - req.status.requestTimeStamp;
                    let timeLeft = (TimeoutMempoolValidWindowTime/1000) - timeElapse;
                    req.status.validationWindow = timeLeft;
                    resolve(req);
                } 
                else {
                    resolve({message:'Signature invalid. Please try again.'});
                }
            }
            else if (address in this.mempool) {
                if (bitcoinMessage.verify(this.mempool[address].message, address, signature)) {
                    const req = { 
                        registerStar: true,
                        status: Object.assign({}, this.mempool[address], 
                        {
                            validationWindow: TimeoutMempoolValidWindowTime/1000,
                            messageSignature: true,
                        })
                    }
            
                    clearTimeout(this.timeoutRequests[address]);
                    this.removeValidationRequest(address);
                    // Add request to valid request mempool
                    this.mempoolValid[address] = req;
                    // Set timout to remove entry from valid rquest mempool
                    this.timeoutMempoolValid[address] = 
                        setTimeout( () => this.removeRequestByWallet(address), TimeoutMempoolValidWindowTime);
                    resolve(req);
                } else {
                    resolve({message:'Signature invalid. Please try again.'});
                }
            } 
            else {
                resolve({message: "Validation request expired or not created."});
            }
        })
    }

    // Remove validation request on timeout
    removeRequestByWallet(address) {
        delete this.mempoolValid[address];
    }
}

module.exports.Mempool = Mempool;