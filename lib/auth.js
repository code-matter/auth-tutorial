import { Lucia } from 'lucia'
import { BetterSqlite3Adapter } from '@lucia-auth/adapter-sqlite'
import db from './db'
import { cookies } from 'next/headers'

const adapter = new BetterSqlite3Adapter(db, {
    user: 'users',
    session: 'sessions',
})

const lucia = new Lucia(adapter, {
    sessionCookie: {
        expires: false,
        attributes: {
            secure: process.env.NODE_ENV === 'production',
        },
    },
})

export const createAuthSession = async userId => {
    const session = await lucia.createSession(userId, {})
    const sessionCookie = lucia.createSessionCookie(session.id)
    cookies().set(
        sessionCookie.name,
        sessionCookie.value,
        sessionCookie.attributes
    )
}

export const verifyAuth = async () => {
    const sessionCookie = cookies().get(lucia.sessionCookieName)
    if (!sessionCookie) {
        return {
            user: null,
            session: null,
        }
    }

    const sessionId = sessionCookie.value
    if (!sessionId) {
        return {
            user: null,
            session: null,
        }
    }

    const isValid = await lucia.validateSession(sessionId)
    try {
        let sessionCookie
        if (isValid.session && isValid.session.fresh) {
            sessionCookie = lucia.createSession(isValid.session.id)
        }
        if (!isValid.session) {
            sessionCookie = lucia.createBlankSessionCookie()
        }
        cookies().set(
            sessionCookie.name,
            sessionCookie.value,
            sessionCookie.attributes
        )
    } catch (error) {}

    return isValid
}