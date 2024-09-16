import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { BookProgressContext } from './BookProgress'
import { FC, PropsWithChildren, useContext } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface CreateFormComponent
  extends FC<
    PropsWithChildren<{
      onSubmit: (params: {
        fromPageNumber: number
        toPageNumber: number
        bookId: string
      }) => void
    }>
  > {
  FromPageInputField: FC
  ToPageInputField: FC
  SubmitButton: FC
}

type FormData = {
  fromPageNumber: number
  toPageNumber: number
  bookId: string
}
export const CreateForm: CreateFormComponent = ({ children, onSubmit }) => {
  const { initialFromPageNumber, bookId } = useContext(BookProgressContext)
  const methods = useForm<FormData>({
    defaultValues: {
      fromPageNumber: initialFromPageNumber,
      toPageNumber: initialFromPageNumber,
      bookId,
    },
  })
  const handleSubmit = methods.handleSubmit((fields) => {
    onSubmit({
      ...fields,
      bookId,
    })
  })

  return (
    <div className="mb-4">
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit}>
          <h4 className="font-semibold mb-2">読書進捗を追加</h4>
          <div className="flex gap-2">{children}</div>
        </form>
      </FormProvider>
    </div>
  )
}

CreateForm.FromPageInputField = function Component() {
  const { register } = useFormContext<FormData>()
  return (
    <Input
      {...register('fromPageNumber')}
      type="number"
      placeholder="開始ページ"
    />
  )
}

CreateForm.ToPageInputField = function Component() {
  const { register } = useFormContext<FormData>()
  return (
    <Input
      {...register('toPageNumber')}
      type="number"
      placeholder="終了ページ"
    />
  )
}

CreateForm.SubmitButton = function Component() {
  return (
    <Button type="submit">
      <Plus className="mr-2 h-4 w-4" /> 追加
    </Button>
  )
}
