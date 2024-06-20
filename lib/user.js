import db from './db'

export const createUser = async (email, password) => {
    const res = db
        .prepare('INSERT INTO users (email, password) VALUES (?,?)')
        .run(email, password)
    return res.lastInsertRowid
}

export const getUser = async email => {
    const user = db.prepare('SELECT * FROM users WHERE email = ?').get(email)
    return user
}
