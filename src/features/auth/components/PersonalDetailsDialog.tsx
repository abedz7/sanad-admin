import { zodResolver } from '@hookform/resolvers/zod'
import { useForm } from 'react-hook-form'
import { z } from 'zod'
import { Button } from '../../../components/ui/Button'
import { Dialog } from '../../../components/ui/Dialog'
import { Input } from '../../../components/ui/Input'
import { useToast } from '../../../components/ui/Toast'
import type { ApiError, User } from '../../../types/api'
import { updateMe } from '../api'
import { useAuth } from '../useAuth'

const detailsSchema = z.object({
  name: z.string().trim().min(1, { error: 'Name is required' }).max(80, { error: 'At most 80 characters' }),
})

type DetailsValues = z.infer<typeof detailsSchema>

interface PersonalDetailsDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  user: User
}

export function PersonalDetailsDialog({ open, onOpenChange, user }: PersonalDetailsDialogProps) {
  const { toast } = useToast()
  const { refreshUser } = useAuth()

  const {
    register,
    handleSubmit,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<DetailsValues>({
    resolver: zodResolver(detailsSchema),
    values: { name: user.name },
  })

  const close = () => {
    reset()
    onOpenChange(false)
  }

  const onSubmit = handleSubmit(async (values) => {
    try {
      await updateMe({ name: values.name })
      await refreshUser()
      toast('Name updated')
      close()
    } catch (error) {
      toast((error as ApiError).message, 'error')
    }
  })

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => (next ? onOpenChange(true) : close())}
      title="Personal details"
    >
      <form onSubmit={onSubmit} noValidate className="flex flex-col gap-3">
        <div>
          <label htmlFor="profile-name" className="mb-1 block text-sm font-medium text-text">
            Name
          </label>
          <Input
            id="profile-name"
            maxLength={80}
            invalid={errors.name !== undefined}
            disabled={isSubmitting}
            {...register('name')}
          />
          {errors.name && <p className="mt-1 text-xs text-danger">{errors.name.message}</p>}
        </div>
        <div>
          <label htmlFor="profile-email" className="mb-1 block text-sm font-medium text-text">
            Email
          </label>
          <Input id="profile-email" value={user.email} readOnly disabled />
          <p className="mt-1 text-xs text-text-muted">Email can’t be changed.</p>
        </div>
        <div className="flex items-center gap-2 text-sm text-text-muted">
          Role
          <span className="rounded-md bg-surface-2 px-1.5 py-0.5 text-xs font-medium text-text">
            {user.role}
          </span>
        </div>
        <div className="mt-1 flex justify-end gap-2">
          <Button variant="secondary" onClick={close} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button type="submit" loading={isSubmitting}>
            Save
          </Button>
        </div>
      </form>
    </Dialog>
  )
}
