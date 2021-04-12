const BlockChain = require('./BlockChain.js');
const Block = require('./Block.js');

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
        this.getBlockByIndex();
        this.postNewBlock();
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
                res.status(400).send("Bad request: Empty body");
                res.end()
            }
        });
    }
}

/**
 * Exporting the BlockController class
 * @param {*} app 
 */
module.exports = (app) => { return new BlockController(app);}