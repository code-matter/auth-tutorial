'use server'

import { createAuthSession } from '@/lib/auth'
import { hashUserPassword, verifyPassword } from '@/lib/hash'
import { createUser, getUser } from '@/lib/user'
import { redirect } from 'next/navigation'

export const signUp = async (prevState, formData) => {
    const email = formData.get('email')
    const password = formData.get('password')

    // Validation
    let errors = {}
    if (!email.includes('@')) {
        errors.email = 'Enter a valid email'
    }
    if (password.trim().length < 8) {
        errors.password = "Enter a password that's at least 8 characters"
    }
    if (Object.keys(errors).length > 0) return { errors }

    // store it in DB
    try {
        const userId = await createUser(email, hashUserPassword(password))
        await createAuthSession(userId)
        redirect('/training')
    } catch (error) {
        if (error.code === 'SQLITE_CONSTRAINT_UNIQUE') {
            return {
                errors: {
                    email: 'Email already in use. Please use a different email',
                },
            }
        }
        throw error
    }
}

export const logIn = async (prevState, formData) => {
    const email = formData.get('email')
    const password = formData.get('password')

    const user = await getUser(email)

    if (!user) {
        return { errors: { userNotFound: 'Wrong credential' } }
    }

    const isValidPassword = verifyPassword(user.password, password)
    if (!isValidPassword) {
        return { errors: { userNotFound: 'Wrong credential' } }
    }

    await createAuthSession(user.id)
    redirect('/training')
}

export const getAuthMethod = (mode, prevState, formData) => {
    if (mode === 'login') {
        return logIn(prevState, formData)
    }
    return signUp(prevState, formData)
}
