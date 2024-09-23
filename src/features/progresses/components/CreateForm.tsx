import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { FC, PropsWithChildren, useContext, useEffect } from 'react'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'
import { addBookProgressToStorage } from '../storage'
import { BookProgressContext, BookProgressDispatchContext } from '../context'

interface CreateFormComponent extends FC<PropsWithChildren> {
  FromPageInputField: FC
  ToPageInputField: FC
  SubmitButton: FC
}

type FormData = {
  fromPageNumber: number
  toPageNumber: number
  bookId: string
}
export const CreateForm: CreateFormComponent = ({ children }) => {
  const { initialFromPageNumber, bookId } = useContext(BookProgressContext)
  const { setEntries } = useContext(BookProgressDispatchContext)
  const methods = useForm<FormData>({
    defaultValues: {
      fromPageNumber: initialFromPageNumber,
      toPageNumber: initialFromPageNumber,
      bookId,
    },
  })

  useEffect(() => {
    methods.reset({
      fromPageNumber: initialFromPageNumber,
      toPageNumber: initialFromPageNumber,
      bookId,
    })
  }, [initialFromPageNumber, bookId, methods])

  const handleSubmit = methods.handleSubmit((fields) => {
    const newEntry = {
      ...fields,
      id: window.crypto.randomUUID(),
      createdAt: new window.Date().toLocaleString(),
      isEnabled: true,
    }
    setEntries((entries) => [...entries, newEntry])
    addBookProgressToStorage(newEntry)
  })

  return (
    <FormProvider {...methods}>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <h4 className="font-semibold mb-2">読書進捗を作成</h4>
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
      <Plus className="mr-2 h-4 w-4" /> 作成
    </Button>
  )
}
