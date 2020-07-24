import { MongoClient, Db } from 'mongodb'

const url = 'mongodb://localhost:27017';
const dbName = 'lambdabot'
const collectionName = 'lambdaScore'
let DB: Db
const client = new MongoClient(url, { useUnifiedTopology: true })

export const initDB = () => {
    client.connect((err) => {
        if (!err) {
            console.log('connected to db')
        }
        DB = client.db(dbName)
    })
}
export const upsert = (async (id: any, data: any): Promise<boolean> => {
    await DB.collection(dbName).updateOne(
        { id: id },
        { $set: data },
        { upsert: true }
    )
    return true
})

export const query = (async (id: any): Promise<boolean> => {
    const obj = await DB.collection(dbName).findOne({ id: id })
    console.log(obj)
    if (obj.canPost) {
        return true
    } else {
        return false
    }
})