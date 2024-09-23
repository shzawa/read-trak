import { FC, PropsWithChildren, useMemo } from 'react'
import { ConditionalKeys } from 'type-fest'
import { FormProvider, useForm, useFormContext } from 'react-hook-form'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Plus } from 'lucide-react'

interface CreateFormComponent
  extends FC<
    PropsWithChildren<{
      onSubmit: (params: {
        title: string
        totalPageNumber: number
        price: number
      }) => void
    }>
  > {
  TextInputField: FC<{
    name: ConditionalKeys<FormData, string>
    placeholder: string
    className: string
  }>
  NumberInputField: FC<{
    name: ConditionalKeys<FormData, number>
    placeholder: string
  }>
  SubmitButton: FC
}

type FormData = {
  title: string
  totalPageNumber: number
  price: number
}
export const CreateForm: CreateFormComponent = ({ children, onSubmit }) => {
  const methods = useForm<FormData>()
  const handleSubmit = methods.handleSubmit((fields) => {
    onSubmit(fields)
    methods.reset()
  })

  return useMemo(
    () => (
      <FormProvider {...methods}>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4">{children}</div>
        </form>
      </FormProvider>
    ),
    [children, handleSubmit, methods]
  )
}

CreateForm.TextInputField = function Component({
  name,
  placeholder,
  className,
}) {
  const { register } = useFormContext<FormData>()
  return (
    <Input
      {...register(name)}
      type="text"
      className={className}
      placeholder={placeholder}
    />
  )
}

CreateForm.NumberInputField = function Component({ name, placeholder }) {
  const { register } = useFormContext<FormData>()
  return <Input {...register(name)} type="number" placeholder={placeholder} />
}

CreateForm.SubmitButton = function Component() {
  return (
    <Button type="submit">
      <Plus className="mr-2 h-4 w-4" /> 作成
    </Button>
  )
}
