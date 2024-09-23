import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible'
import { Button } from '@/components/ui/button'
import { ComponentProps, FC, memo, useState } from 'react'
import { CreateForm } from './CreateForm'
import { ChevronDown } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export const CollapsibleCreateForm: FC<{
  onSubmit: ComponentProps<typeof CreateForm>['onSubmit']
}> = memo(({ onSubmit }) => {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen} className="mb-4">
      <CollapsibleTrigger asChild>
        <Button variant="outline" className="w-full mb-4">
          {isOpen ? '書籍登録フォームを閉じる' : '書籍登録フォームを開く'}
          <ChevronDown
            className={`h-4 w-4 ml-2 transition-transform duration-200 ${isOpen ? 'transform rotate-180' : ''}`}
          />
        </Button>
      </CollapsibleTrigger>
      <CollapsibleContent>
        <Card className="mb-4">
          <CardHeader>
            <CardTitle>新しい書籍を作成</CardTitle>
          </CardHeader>
          <CardContent>
            <CreateForm
              onSubmit={(params) => {
                onSubmit(params)
                setIsOpen(false)
              }}
            >
              <CreateForm.TextInputField
                name="title"
                placeholder="タイトル"
                className="w-full"
              />
              <div className="flex gap-2">
                <CreateForm.NumberInputField
                  name="totalPageNumber"
                  placeholder="全ページ数"
                />
                <CreateForm.NumberInputField name="price" placeholder="価格" />
                <CreateForm.SubmitButton />
              </div>
            </CreateForm>
          </CardContent>
        </Card>
      </CollapsibleContent>
    </Collapsible>
  )
})
