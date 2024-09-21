import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  BookProgress,
  BookProgressContext,
} from '@/features/progresses/components/BookProgress'
import { BookProgressType } from '@/features/progresses/types'
import { Trash2 } from 'lucide-react'
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

type Book = {
  id: string
  title: string
  price: number
  totalPageNumber: number
  createdAt: string
}

const BookDispatchContext = createContext<{
  setBook: Dispatch<SetStateAction<Book>>
}>({
  setBook: () => {},
})

type BookContextProps = Book & {
  setBook: Dispatch<SetStateAction<Book>>
}
// TODO: setBook を用意して Book 内で Storage のミューテーションを完結したい
const BookContext = createContext<BookContextProps>({
  id: '',
  price: 0,
  title: '',
  totalPageNumber: 0,
  createdAt: '',
  setBook: () => {},
})

interface BookComponent extends FC<PropsWithChildren<Book>> {
  Header: FC<PropsWithChildren>
  Title: FC
  DeleteButton: FC<{
    onDelete: (params: { id: string; title: string }) => void
  }>
  Content: FC<PropsWithChildren<{ initialProgresses: BookProgressType[] }>>
  TotalPageNumberAndPrice: FC<
    PropsWithChildren<{
      onConfirmEditTotalPageNumber: (params: {
        id: string
        value: number
        onSubmit: () => void
        onCancel: () => void
      }) => void
    }>
  >
  TotalPageNumber: FC<{
    onConfirmEdit: (params: {
      id: string
      value: number
      onSubmit: () => void
      onCancel: () => void
    }) => void
  }>
  Price: FC
}

export const Book: BookComponent = ({ children, ...bookProps }) => {
  const [book, setBook] = useState<Book>(bookProps)
  const dispatch = useMemo(() => ({ setBook }), [])

  return (
    <BookDispatchContext.Provider value={dispatch}>
      <BookContext.Provider value={{ ...book, setBook }}>
        <Card className="mb-4">{children}</Card>
      </BookContext.Provider>
    </BookDispatchContext.Provider>
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

Book.Title = function Component() {
  const { title: value, setBook } = useContext(BookContext)
  const [inputValue, setInputValue] = useState(value)
  const [isEditable, setIsEditable] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }
  const handleInputBlur = useCallback(() => {
    setBook((prev) => ({ ...prev, title: inputValue }))
    // TODO: localStorageにも保存
    setIsEditable(false)
  }, [inputValue, setBook])
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setBook((prev) => ({ ...prev, title: inputValue }))
        // TODO: localStorageにも保存
        setIsEditable(false)
      }
    },
    [inputValue, setBook]
  )
  const handleClick = useCallback(() => {
    setIsEditable(true)
  }, [])

  return (
    <CardTitle className="break-words">
      {isEditable ? (
        <Input
          value={inputValue}
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

Book.DeleteButton = function Component({ onDelete }) {
  const { id, title } = useContext(BookContext)
  return (
    <Button
      variant="destructive"
      size="sm"
      onClick={() => onDelete({ id, title })}
    >
      <Trash2 className="h-4 w-4 mr-2" /> 削除
    </Button>
  )
}

Book.Content = function Component({ children, initialProgresses }) {
  const { id, price, totalPageNumber } = useContext(BookContext)
  return (
    <BookProgress
      bookId={id}
      price={price}
      totalPageNumber={totalPageNumber}
      initialValues={initialProgresses}
    >
      <CardContent>{children}</CardContent>
    </BookProgress>
  )
}

Book.TotalPageNumberAndPrice = function Component({
  onConfirmEditTotalPageNumber,
}) {
  return (
    <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
      <span className="mr-2">全ページ数:</span>
      <Book.TotalPageNumber onConfirmEdit={onConfirmEditTotalPageNumber} />
      <span className="mx-2 hidden sm:inline">/</span>
      <span className="mr-2">価格:</span>
      <Book.Price />
    </div>
  )
}

Book.TotalPageNumber = function Component({ onConfirmEdit }) {
  const { totalPageNumber: value, id } = useContext(BookContext)
  const { setBook } = useContext(BookDispatchContext)
  const { setEntries } = useContext(BookProgressContext)
  const [inputValue, setInputValue] = useState(value)
  const [isEditable, setIsEditable] = useState(false)

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      setInputValue(Number(e.target.value))
    },
    []
  )

  const handleInputBlur = useCallback(() => {
    if (inputValue !== value) {
      onConfirmEdit({
        value: inputValue,
        id,
        onSubmit: () => {
          setEntries(() => []) // 総ページ数が変更されたら進捗をリセット
          setBook((prev) => ({ ...prev, totalPageNumber: inputValue }))
          // TODO: localStorageにも保存
        },
        onCancel: () => setInputValue(value),
      })
    }
    setIsEditable(false)
  }, [inputValue, value, onConfirmEdit, id, setEntries, setBook])

  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        e.preventDefault() // confirmDialog が閉じられないようにする
        if (inputValue !== value) {
          onConfirmEdit({
            value: inputValue,
            id,
            onSubmit: () => {
              setEntries(() => []) // 総ページ数が変更されたら進捗をリセット
              setBook((prev) => ({ ...prev, totalPageNumber: inputValue }))
              // TODO: localStorageにも保存
            },
            onCancel: () => setInputValue(value),
          })
        }
        setIsEditable(false)
      }
    },
    [inputValue, value, onConfirmEdit, id, setEntries, setBook]
  )

  const handleClick = useCallback(() => {
    setIsEditable(true)
  }, [])

  return isEditable ? (
    <Input
      type="number"
      value={inputValue}
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

Book.Price = function Component() {
  const { price: value } = useContext(BookContext)
  const { setBook } = useContext(BookDispatchContext)
  const [isEditable, setIsEditable] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(e.target.value))
  }

  const handleInputBlur = () => {
    setBook((prev) => ({ ...prev, price: inputValue }))
    // TODO: localStorageにも保存
    setIsEditable(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setBook((prev) => ({ ...prev, price: inputValue }))
      // TODO: localStorageにも保存
      setIsEditable(false)
    }
  }

  const handleClick = useCallback(() => {
    setIsEditable(true)
  }, [])

  return isEditable ? (
    <Input
      type="number"
      value={inputValue}
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
