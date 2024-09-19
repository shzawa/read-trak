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
  const { initialFromPageNumber, bookId, setEntries } =
    useContext(BookProgressContext)
  const methods = useForm<FormData>({
    defaultValues: {
      fromPageNumber: initialFromPageNumber,
      toPageNumber: initialFromPageNumber,
      bookId,
    },
  })
  const handleSubmit = methods.handleSubmit((fields) => {
    setEntries((entries) => [
      ...entries,
      {
        ...fields,
        id: window.crypto.randomUUID(), // TODO: localStorage insert時のIDとは別になっちゃってる
        createdAt: new window.Date().toLocaleString(),
        isEnabled: true,
      },
    ])
    console.log('handleSubmit!!!!')
    onSubmit({
      ...fields,
      bookId,
    })
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">読書進捗を追加</h4>
          <div className="flex gap-2">{children}</div>
        </div>
      </form>
    </FormProvider>
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
