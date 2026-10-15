import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { Input } from '../../../components/ui/Input'
import { Textarea } from '../../../components/ui/Textarea'
import { useToast } from '../../../components/ui/Toast'
import type { AdminCategory } from '../../../types/api'
import { useCreateCategory, useUpdateCategory } from '../hooks'

const categorySchema = z.object({
  name: z.string().trim().min(1, { error: 'Name is required' }).max(60, { error: 'At most 60 characters' }),
  description: z.string().trim().max(300, { error: 'At most 300 characters' }),
})

type CategoryValues = z.infer<typeof categorySchema>

interface CategoryFormDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  /** Set for edit; absent for create. */
  category?: AdminCategory
}

export function CategoryFormDialog({ open, onOpenChange, category }: CategoryFormDialogProps) {
  const { toast } = useToast()
  const create = useCreateCategory()
  const update = useUpdateCategory(category?.id ?? '')
  const mutation = category ? update : create

  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<CategoryValues>({
    resolver: zodResolver(categorySchema),
    values: { name: category?.name ?? '', description: category?.description ?? '' },
  })

  const close = () => {
    reset()
    onOpenChange(false)
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await mutation.mutateAsync({
        name: values.name,
        // The contract has no "clear description" semantics; omit when empty.
        ...(values.description ? { description: values.description } : {}),
      })
      toast(category ? 'Category updated' : 'Category created')
      close()
    } catch (error) {
      const apiError = error as { code?: string; message?: string }
      if (apiError.code === 'CONFLICT') {
        setError('name', { message: 'A category with this name exists' })
      } else {
        toast(apiError.message ?? 'Something went wrong', 'error')
      }
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title={category ? 'Edit category' : 'New category'}
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <div>
          <label htmlFor="category-name" className="mb-1 block text-sm font-medium text-text">
            Name
          </label>
          <Input
            id="category-name"
            maxLength={60}
            invalid={errors.name !== undefined}
            disabled={isSubmitting}
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="category-description" className="mb-1 block text-sm font-medium text-text">
            Description <span className="font-normal text-text-muted">(optional)</span>
          </label>
          <Textarea
            id="category-description"
            rows={3}
            maxLength={300}
            invalid={errors.description !== undefined}
            disabled={isSubmitting}
            {...register('description')}
          />
          {errors.description && (
            <p className="mt-1 text-xs text-danger">{errors.description.message}</p>
          )}
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            {category ? 'Save changes' : 'Create category'}
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
