/* ===== Persist data with LevelDB ==================
|  Learn more: level: https://github.com/Level/level |
/===================================================*/

const level = require('level');
const chainDB = './chaindata';

class LevelSandbox {
    constructor() {
        this.db = level(chainDB);
    }

    // Get data from levelDB with key (Promise)
    getLevelDBData(key){
        return new Promise((resolve, reject) => {
            this.db.get(key, (err, value) => {
                if (err) {
                    reject(err);
                }
                resolve(value);
            })
        });
    }

    // Add data to levelDB with key and value (Promise)
    addLevelDBData(key, value) {
        return new Promise((resolve, reject) => {
            let dataArray = []
            this.db.createReadStream().on('data', (data) => {
                dataArray.push(data);
            }).on('error', (err) => {
                reject(err);
            }).on('close', () => {
                this.db.put(key, value, (err) => {
                    if (err) {
                        reject(err);
                    }
                })
                resolve(dataArray);
            });
        })
    }

    // Method that return the height
    getBlocksCount() {
        return new Promise((resolve, reject) => {
            let i = 0;
            this.db.createReadStream().on('data', (data) => {
                i++;
            }).on('error', (err) => {
                reject(err);
            }).on('close', () => {
                resolve(i);
            });
        });
    }       
}

module.exports.LevelSandbox = LevelSandbox;