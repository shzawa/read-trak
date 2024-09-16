import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useState,
} from 'react'

type Book = {
  id: string
  title: string
  price: number
  totalPageNumber: number
}

const BookContext = createContext<Book>({
  id: '',
  price: 0,
  title: '',
  totalPageNumber: 0,
})

interface BookComponent extends FC<PropsWithChildren<Book>> {
  Header: FC<PropsWithChildren>
  Title: FC<{ onEdit: (props: { value: string; id: string }) => void }>
  DeleteButton: FC<{ onClick: (id: string) => void }>
  Content: FC<PropsWithChildren>
  TotalPageNumberAndPrice: FC<
    PropsWithChildren<{
      onEditTotalPageNumber: (params: {
        id: string
        value: number
        onCancel: () => void
      }) => void
      onEditPrice: (params: { id: string; value: number }) => void
    }>
  >
}

export const Book: BookComponent = ({ children, ...props }) => {
  return (
    <BookContext.Provider value={props}>
      <Card className="mb-4">{children}</Card>
    </BookContext.Provider>
  )
}

const Header: FC<PropsWithChildren> = ({ children }) => {
  return (
    <CardHeader>
      <div className="flex justify-between items-center">{children}</div>
    </CardHeader>
  )
}
Book.Header = Header

Book.Title = function Component({ onEdit }) {
  const { title: initialValue, id } = useContext(BookContext)
  const [value, setValue] = useState(initialValue)
  const [isEditable, setIsEditable] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(e.target.value)
  }
  const handleInputBlur = () => {
    onEdit({ value, id })
    setIsEditable(false)
  }
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEdit({ value, id })
      setIsEditable(false)
    }
  }
  const handleClick = useCallback(() => {
    setIsEditable(true)
  }, [])

  return (
    <CardTitle className="break-words">
      <span className="cursor-pointer hover:bg-muted p-1 rounded">{value}</span>
      {isEditable ? (
        <Input
          value={value}
          onChange={handleInputChange}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          autoFocus
        />
      ) : (
        <span
          className="cursor-pointer hover:bg-muted p-1 rounded"
          onClick={handleClick}
        >
          {value}
        </span>
      )}
    </CardTitle>
  )
}

Book.DeleteButton = function Component({ onClick }) {
  const { id } = useContext(BookContext)
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => {
        onClick(id)
      }}
    >
      <Trash2 className="h-4 w-4 mr-2" /> 削除
    </Button>
  )
}

Book.Content = function Component({ children }) {
  return <CardContent>{children}</CardContent>
}

Book.TotalPageNumberAndPrice = function Component({
  onEditTotalPageNumber,
  onEditPrice,
}) {
  return (
    <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
      <span className="mr-2">全ページ数:</span>
      <TotalPageNumber onEdit={onEditTotalPageNumber} />
      <span className="mx-2 hidden sm:inline">/</span>
      <span className="mr-2">価格:</span>
      <Price onEdit={onEditPrice} />
    </div>
  )
}

const TotalPageNumber: FC<{
  onEdit: (props: { id: string; value: number; onCancel: () => void }) => void
}> = ({ onEdit }) => {
  const { totalPageNumber: initialValue, id } = useContext(BookContext)
  const [isEditable, setIsEditable] = useState(false)
  const [value, setValue] = useState(initialValue)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value))
  }

  const handleInputBlur = () => {
    if (value !== initialValue) {
      onEdit({
        value,
        id,
        onCancel: () => setValue(initialValue), // 確認ダイアログでキャンセルされたら元に戻す,
      })
    }
    setIsEditable(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      if (value !== initialValue) {
        onEdit({
          value,
          id,
          onCancel: () => setValue(initialValue), // 確認ダイアログでキャンセルされたら元に戻す,
        })
      }
      setIsEditable(false)
    }
  }

  const handleClick = useCallback(() => {
    setIsEditable(true)
  }, [])

  return isEditable ? (
    <Input
      type="number"
      value={value}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      onKeyDown={handleInputKeyDown}
      autoFocus
      className="w-20"
    />
  ) : (
    <span
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onClick={handleClick}
    >
      {value}
    </span>
  )
}

const Price: FC<{
  onEdit: (params: { id: string; value: number }) => void
}> = ({ onEdit }) => {
  const { price: initialValue, id } = useContext(BookContext)
  const [isEditable, setIsEditable] = useState(false)
  const [value, setValue] = useState(initialValue)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValue(Number(e.target.value))
  }

  const handleInputBlur = () => {
    onEdit({
      value,
      id,
    })
    setIsEditable(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      onEdit({
        value,
        id,
      })
      setIsEditable(false)
    }
  }

  const handleClick = useCallback(() => {
    setIsEditable(true)
  }, [])

  return isEditable ? (
    <Input
      type="number"
      value={value}
      onChange={handleInputChange}
      onBlur={handleInputBlur}
      onKeyDown={handleInputKeyDown}
      autoFocus
      className="w-20"
    />
  ) : (
    <span
      className="cursor-pointer hover:bg-muted p-1 rounded"
      onClick={handleClick}
    >
      ¥{value}
    </span>
  )
}
