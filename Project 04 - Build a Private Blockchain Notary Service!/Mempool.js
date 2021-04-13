const TimeoutRequestsWindowTime = 5*60*1000;

class Mempool {
    constructor() {
        this.mempool = {};
        this.mempoolValid = {};
        this.timeoutRequests= {};
    }

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
            
                // add request to mempool
                this.mempool[address] = req;
                // set timout to remove entry from mempool
                this.timeoutRequests[req.address] = 
                    setTimeout(() => this.removeRequestValidation(req.address),
                                TimeoutRequestsWindowTime)
                resolve(req);
            }
        })
    }

    removeValidationRequest(address) {
        delete this.mempool[address];
    }
}

module.exports.Mempool = Mempool;