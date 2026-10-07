import { zodResolver } from '@hookform/resolvers/zod'
import { PackageX } from 'lucide-react'
import { Controller, useForm } from 'react-hook-form'
import { Link, useNavigate, useParams } from 'react-router'
import { toast } from 'sonner'

import { Button } from '@/components/ui/Button'
import { buttonClass } from '@/components/ui/styles'
import { EmptyState, ErrorState, Spinner } from '@/components/ui/feedback'
import { InputField, SelectField, TextareaField } from '@/components/ui/Field'
import { useCategories } from '@/features/products/hooks'
import { errorMessage } from '@/lib/errors'
import { useDocumentTitle } from '@/lib/useDocumentTitle'

import type { AdminProduct } from '../api'
import { ImagesEditor } from '../components/ImagesEditor'
import { useAdminProduct, useSaveProduct } from '../hooks'
import {
  emptyProductForm,
  type ProductFormValues,
  productFormSchema,
  slugify,
  toFormValues,
  toInput,
} from '../productSchema'

/** `/admin/products/new` creates; `/admin/products/:id` edits. */
export default function ProductFormPage() {
  const { id } = useParams()
  const isNew = !id || id === 'new'
  const { data: product, error, isPending, refetch } = useAdminProduct(isNew ? null : id)
  useDocumentTitle(isNew ? 'New product · Admin' : 'Edit product · Admin')

  if (isNew) return <ProductForm product={null} />
  if (error) return <ErrorState error={error} onRetry={() => refetch()} />
  if (isPending) return <Spinner />
  if (!product) {
    return (
      <EmptyState
        icon={<PackageX className="size-6" />}
        title="Product not found"
        action={
          <Link to="/admin/products" className={buttonClass('secondary')}>
            Back to products
          </Link>
        }
      />
    )
  }
  return <ProductForm key={product.id} product={product} />
}

function ProductForm({ product }: { product: AdminProduct | null }) {
  const navigate = useNavigate()
  const save = useSaveProduct()
  const { data: categories = [] } = useCategories()
  const {
    register,
    handleSubmit,
    control,
    setValue,
    getValues,
    formState: { errors, isSubmitting, dirtyFields },
  } = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema),
    defaultValues: product ? toFormValues(product) : emptyProductForm,
  })

  const nameField = register('name')
  const slugField = register('slug')

  const onSubmit = async (values: ProductFormValues) => {
    try {
      await save.mutateAsync({ id: product?.id ?? null, input: toInput(values) })
      toast.success(product ? 'Product updated' : 'Product created')
      navigate('/admin/products')
    } catch (e) {
      toast.error(errorMessage(e))
    }
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6">
      <div className="flex flex-col gap-1">
        <Link to="/admin/products" className="text-sm text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100">
          ← Products
        </Link>
        <h1 className="text-2xl font-bold tracking-tight">
          {product ? `Edit “${product.name}”` : 'New product'}
        </h1>
      </div>

      <form onSubmit={handleSubmit(onSubmit)} noValidate className="flex flex-col gap-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField
            label="Name"
            error={errors.name?.message}
            {...nameField}
            onChange={(e) => {
              // Keep the slug in sync for new products until it's edited by hand.
              if (!product && !dirtyFields.slug) {
                setValue('slug', slugify(e.target.value), { shouldValidate: Boolean(errors.slug) })
              }
              return nameField.onChange(e)
            }}
          />
          <InputField
            label="Slug"
            hint="Used in the product URL."
            error={errors.slug?.message}
            {...slugField}
            onBlur={(e) => {
              setValue('slug', slugify(e.target.value || getValues('name')), { shouldDirty: true })
              return slugField.onBlur(e)
            }}
          />
        </div>
        <TextareaField
          label="Description"
          error={errors.description?.message}
          {...register('description')}
        />
        <div className="grid gap-5 sm:grid-cols-2">
          <InputField label="Brand" error={errors.brand?.message} {...register('brand')} />
          <SelectField label="Category" error={errors.categoryId?.message} {...register('categoryId')}>
            <option value="">No category</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </SelectField>
        </div>
        <div className="grid gap-5 sm:grid-cols-3">
          <InputField
            label="Price ($)"
            inputMode="decimal"
            placeholder="19.99"
            error={errors.price?.message}
            {...register('price')}
          />
          <InputField
            label="Compare-at price ($)"
            inputMode="decimal"
            hint="Optional, shows a discount."
            error={errors.compareAt?.message}
            {...register('compareAt')}
          />
          <InputField
            label="Stock"
            inputMode="numeric"
            error={errors.stock?.message}
            {...register('stock')}
          />
        </div>
        <Controller
          control={control}
          name="images"
          render={({ field, fieldState }) => (
            <ImagesEditor
              value={field.value}
              onChange={field.onChange}
              error={fieldState.error?.message}
              disabled={isSubmitting}
            />
          )}
        />
        <label className="flex items-center gap-3 text-sm">
          <input type="checkbox" className="size-4 accent-brand-600" {...register('active')} />
          Visible in the store
        </label>
        <div className="flex justify-end gap-3 border-t border-zinc-200 pt-5 dark:border-zinc-800">
          <Link to="/admin/products" className={buttonClass('secondary')}>
            Cancel
          </Link>
          <Button type="submit" loading={isSubmitting}>
            {product ? 'Save changes' : 'Create product'}
          </Button>
        </div>
      </form>
    </div>
  )
}
