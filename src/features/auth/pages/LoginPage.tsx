import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { InputField } from '@/components/ui/Field'
import { errorMessage } from '@/lib/errors'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { signIn } from '../api'
import { useAuth } from '../context'
import { AuthCard } from '../components/AuthCard'
import { type SignInValues, signInSchema } from '../schemas'
import { useRedirectTarget } from '../useRedirectTarget'

export default function LoginPage() {
  useDocumentTitle('Sign in')
  const { session } = useAuth()
  const navigate = useNavigate()
  const target = useRedirectTarget()
  const location = useLocation()
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignInValues>({ resolver: zodResolver(signInSchema) })

  if (session && !isSubmitting) return <Navigate to={target} replace />

  const onSubmit = async (values: SignInValues) => {
    try {
      await signIn(values.email, values.password)
      toast.success('Welcome back!')
      navigate(target, { replace: true })
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <AuthCard
      title="Welcome back"
      subtitle="Sign in to check out and track your orders."
      footer={
        <>
          New to Cartly?{' '}
          <Link
            to="/register"
            state={location.state}
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Create an account
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <InputField
          label="Email"
          type="email"
          autoComplete="email"
          error={errors.email?.message}
          {...register('email')}
        />
        <InputField
          label="Password"
          type="password"
          autoComplete="current-password"
          error={errors.password?.message}
          {...register('password')}
        />
        <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
          Sign in
        </Button>
      </form>
    </AuthCard>
  )
}
