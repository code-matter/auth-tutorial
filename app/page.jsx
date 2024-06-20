import AuthForm from '@/components/auth-form'

export default async function Home({ searchParams }) {
    const { mode = 'login' } = searchParams
    return <AuthForm mode={mode} />
}
