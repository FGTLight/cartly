import { zodResolver } from '@hookform/resolvers/zod'
import { MailCheck } from 'lucide-react'
import { useState } from 'react'
import { useForm } from 'react-hook-form'
import { Link, Navigate, useLocation, useNavigate } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { EmptyState } from '@/components/ui/feedback'
import { InputField } from '@/components/ui/Field'
import { errorMessage } from '@/lib/errors'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import { signUp } from '../api'
import { useAuth } from '../context'
import { AuthCard } from '../components/AuthCard'
import { type SignUpValues, signUpSchema } from '../schemas'
import { useRedirectTarget } from '../useRedirectTarget'

export default function RegisterPage() {
  useDocumentTitle('Create account')
  const { session } = useAuth()
  const navigate = useNavigate()
  const target = useRedirectTarget()
  const location = useLocation()
  const [confirmEmail, setConfirmEmail] = useState<string | null>(null)
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<SignUpValues>({ resolver: zodResolver(signUpSchema) })

  if (session && !isSubmitting) return <Navigate to={target} replace />

  if (confirmEmail) {
    return (
      <EmptyState
        icon={<MailCheck className="size-6" />}
        title="Check your inbox"
        description={`We sent a confirmation link to ${confirmEmail}. Open it, then sign in.`}
      />
    )
  }

  const onSubmit = async (values: SignUpValues) => {
    try {
      const signedIn = await signUp(values.fullName, values.email, values.password)
      if (signedIn) {
        toast.success('Account created. Welcome to Cartly!')
        navigate(target, { replace: true })
      } else {
        setConfirmEmail(values.email)
      }
    } catch (error) {
      toast.error(errorMessage(error))
    }
  }

  return (
    <AuthCard
      title="Create your account"
      subtitle="It takes less than a minute."
      footer={
        <>
          Already have an account?{' '}
          <Link
            to="/login"
            state={location.state}
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Sign in
          </Link>
        </>
      }
    >
      <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4" noValidate>
        <InputField
          label="Full name"
          autoComplete="name"
          error={errors.fullName?.message}
          {...register('fullName')}
        />
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
          autoComplete="new-password"
          hint="At least 8 characters."
          error={errors.password?.message}
          {...register('password')}
        />
        <InputField
          label="Confirm password"
          type="password"
          autoComplete="new-password"
          error={errors.confirmPassword?.message}
          {...register('confirmPassword')}
        />
        <Button type="submit" size="lg" loading={isSubmitting} className="mt-2">
          Create account
        </Button>
      </form>
    </AuthCard>
  )
}
