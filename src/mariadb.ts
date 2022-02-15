import * as mariadb from 'mariadb'
let pool: mariadb.Pool

export async function init() {
    try {
        console.log('attempting to connect to mariadb')
        pool = await mariadb.createPool({
            host: process.env.MARIADB_HOST,
            user: process.env.MARIADB_USER,
            password: process.env.MARIADB_PASSWORD,
            port: parseInt(process.env.MARIADB_PORT as string),
        })
        console.log('connected')
        await ensureTable()
    } catch (err) {
        console.log('error connecting to db', err)
    }
}

export async function ensureTable() {
    console.log('creating database lambda_users')
    let conn
    try {
        conn = await pool.getConnection()
        await conn.query("CREATE DATABASE IF NOT EXISTS lambda_users")
        console.log('lambda_users created')
        await conn.query("USE lambda_users")
        console.log('creating table users')
        await conn.query("CREATE TABLE IF NOT EXISTS users (id VARCHAR(30) PRIMARY KEY, lambda INT(5) NOT NULL)")
        console.log('table created')
    } catch (err) {
        console.log('could not create db/table')
        console.log(err)
        if (conn) {
            conn.release()
        }
        throw err
    } finally {
        if (conn) {
            await conn.release()
        }
    }
}

export async function upsert(id: string | undefined, data: number) {
    if (!id) {
        return
    }
    console.log('inserting', id, data)
    let conn
    try {
        conn = await pool.getConnection()
        await conn.query("USE lambda_users")
        await conn.query(`INSERT INTO users VALUES (${id},${data}) ON DUPLICATE KEY UPDATE lambda = lambda + ${data}`)
    } catch (err) {
        console.log('error upsert')
        console.log(err)
        if (conn) {
            conn.release()
        }
        throw err
    } finally {
        if (conn) {
            await conn.release()
        }
    }
}

export async function query(id: string) {
    console.log('querying for user ', id)
    let conn
    try {
        conn = await pool.getConnection()
        await conn.query("USE lambda_users")
        const result = await conn.query(`SELECT lambda FROM users WHERE id = ${id}`)
        if (result && result[0] && result[0].lambda !== undefined) {
            return result[0].lambda
        } else {
            return 0
        }
    } catch (err) {
        console.log('error query')
        console.log(err)
        if (conn) {
            conn.release()
        }
        throw err
    } finally {
        if (conn) {
            await conn.release()
        }
    }
}

export async function queryLambda(id: string | undefined) {
    if (!id) {
        return false
    }
    try {
        return await query(id)
    } catch (err) {
        console.log(`error checking if id ${id} can post`, err)
    }
}