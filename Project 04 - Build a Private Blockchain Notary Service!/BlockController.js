const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');
const Mempool = require('./Mempool.js');

/**
 * Controller Definition to encapsulate routes to work with blocks
 */
class BlockController {
    /**
     * Constructor to create a new BlockController, you need to initialize here all your endpoints
     * @param {*} app 
     */
    constructor(app) {
        this.app = app;
        this.blockChain = new BlockChain.Blockchain();
        this.mempool = new Mempool.Mempool();
        this.getBlockByIndex();
        this.postNewBlock();
        this.requestValidation();
        this.validate();
    }

    /**
     * Implement a GET Endpoint to retrieve a block by index, url: "/api/block/:index"
     */
    getBlockByIndex() {
        this.app.get("/block/:index", (req, res, next) => {
            this.blockChain.getBlock(req.params.index).then((block) => {
                res.send(block);
            }).catch((err) => {
                next(err);
            })
        });
    }

    /**
     * Implement a POST Endpoint to add a new Block, url: "/api/block"
     */
    postNewBlock() {
        this.app.post("/block", (req, res, next) => {
            if(req.body.body) {
                this.blockChain.addBlock(new Block.Block(req.body.body)).then((addedBlock) => {
                    res.send(addedBlock)
                }).catch((err) => {
                    next(err);
                });
            }
            else {
                res.send({messgae: "Request body has no body key"});
            }
        });
    }

    requestValidation() {
        this.app.post("/requestValidation", (req, res, next) => {
            if(req.body.address) {
                this.mempool.addRequestValidation(req.body.address).then((requestObject) => {
                    res.send(requestObject);
                }).catch((err) => {
                    next(err);
                })
            }
            else {
                res.send({message: "Request body has no address"});
            }
        })
    }

    validate() {
        this.app.post("/message-signature/validate", (req, res, next) => {
            if(req.body.address && req.body.signature) {
                this.mempool.validateRequestByWallet(req.body.address, req.body.signature).then((validRequestObj) => {
                    res.send(validRequestObj);
                }).catch((err) => {
                    next(err);
                })
            }
            else {
                res.send({message: "Request body has no address or signature"});
            }
        })
    }
}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}