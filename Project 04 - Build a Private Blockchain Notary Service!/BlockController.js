const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');
const Mempool = require('./Mempool.js');
const hex2ascii = require('hex2ascii')

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
        this.requestValidation();
        this.validate();
        this.block();
        this.getBlockByHash();
        this.getBlockByWalletAddress();
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
     * Implement a POST Endpoint to submit a validation request, url: "/requestValidation"
     */
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

    /**
     * Implement a POST Endpoint to send a validation request, url: "/message-signature/validate"
     */
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

    /**
     * Implement a POST Endpoint to send star data to be stored, url: "/block"
     */
    block() {
        this.app.post("/block", (req, res, next) => {
            if(req.body.address && req.body.star) {
                if(req.body.star.dec && req.body.star.ra && req.body.star.story) {
                    if(this.mempool.verifyAddressRequest(req.body.address)) {
                        // Star story supports ASCII text
                        req.body.star.story = req.body.star.story.replace(/[^\x00-\x7F]/g, "");
                        // Star story limited to 250 words (500 bytes)
                        // Each character of a string is 16-bit in js
                        req.body.star.story = req.body.star.story.substring(0,250);
                        // Star story is hex encoded
                        req.body.star.story = new Buffer(req.body.star.story).toString('hex');
                        this.blockChain.addBlock(new Block.Block(req.body)).then((blockObj) => {
                            blockObj.body.star.storyDecoded = hex2ascii(blockObj.body.star.story);
                            this.mempool.removeAddressRequest(req.body.address);
                            res.send(blockObj);
                        }).catch((err) => {
                            next(err);
                        })
                    }
                    else {
                        res.send({message: "No verified request found"});
                    }
                }
                else {
                    res.send({message: "Star object has no dec, ra, or story"});
                }
            }
            else {
                res.send({message: "Request body has no address or star"});
            }
        })
    }

    /**
     * Implement a GET Endpoint to retrieve a block by hash, url: "/stars/hash::hash"
     */
    getBlockByHash() {
        this.app.get("/stars/hash::hash", (req, res, next) => {
            this.blockChain.getBlockByHash(req.params.hash).then((block) => {
                if(block){
                    block.body.star.storyDecoded = hex2ascii(block.body.star.story);
                    res.send(block);
                }
                else {
                    res.send({message: "Block not found"});
                }
            }).catch((err) => {
                next(err);
            })
        })
    }

    /**
     * Implement a GET Endpoint to retrieve a block by wallet address, url: "/stars/address::address"
     */
    getBlockByWalletAddress() {
        this.app.get("/stars/address::address", (req, res, next) => {
            this.blockChain.getBlockByWalletAddress(req.params.address).then((blocks) => {
                blocks.map((block) => {block.body.star.storyDecoded = hex2ascii(block.body.star.story)});
                res.send(blocks);
            }).catch((err) => {
                next(err);
            })
        })
    }
}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}