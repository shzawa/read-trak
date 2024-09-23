import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { BookProgress } from '@/features/progresses/components/BookProgress'
import { BookProgress as BookProgressType } from '@/features/progresses/types'
import { MoreVertical, Trash2 } from 'lucide-react'
import {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import type { Book as BookType } from '../types'
import { updateBookToStorage } from '../storage'
import { BookContext, BookDispatchContext } from '../context'
import { BookProgressDispatchContext } from '@/features/progresses/context'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'

interface BookComponent extends FC<PropsWithChildren<BookType>> {
  Header: FC<PropsWithChildren>
  Title: FC
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
  DropdownMenuButton: FC<{
    onClickDelete: (params: { id: string; title: string }) => void
  }>
}

export const Book: BookComponent = ({ children, ...bookProps }) => {
  const [book, setBook] = useState<BookType>(bookProps)
  const dispatch = useMemo(() => ({ setBook }), [])

  return useMemo(
    () => (
      <BookDispatchContext.Provider value={dispatch}>
        <BookContext.Provider value={{ ...book }}>
          <Card className="mb-4">{children}</Card>
        </BookContext.Provider>
      </BookDispatchContext.Provider>
    ),
    [book, children, dispatch]
  )
}

const Header: FC<PropsWithChildren> = ({ children }) => {
  return useMemo(
    () => (
      <CardHeader>
        <div className="flex justify-between items-center">{children}</div>
      </CardHeader>
    ),
    [children]
  )
}
Book.Header = Header

Book.Title = function Component() {
  const { id, title: value } = useContext(BookContext)
  const { setBook } = useContext(BookDispatchContext)
  const [inputValue, setInputValue] = useState(value)
  const [isEditable, setIsEditable] = useState(false)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(e.target.value)
  }
  const handleInputBlur = useCallback(() => {
    setBook((prev) => ({ ...prev, title: inputValue }))
    updateBookToStorage({ id, title: inputValue })
    setIsEditable(false)
  }, [id, inputValue, setBook])
  const handleInputKeyDown = useCallback(
    (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter') {
        setBook((prev) => ({ ...prev, title: inputValue }))
        updateBookToStorage({ id, title: inputValue })
        setIsEditable(false)
      }
    },
    [id, inputValue, setBook]
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

Book.Content = function Component({ children, initialProgresses }) {
  const { id, price, totalPageNumber } = useContext(BookContext)
  return useMemo(
    () => (
      <BookProgress
        bookId={id}
        price={price}
        totalPageNumber={totalPageNumber}
        initialValues={initialProgresses}
      >
        <CardContent>{children}</CardContent>
      </BookProgress>
    ),
    [children, id, price, totalPageNumber, initialProgresses]
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
  const { setEntries } = useContext(BookProgressDispatchContext)
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
          setEntries([]) // 総ページ数が変更されたら進捗をリセット
          setBook((prev) => ({ ...prev, totalPageNumber: inputValue }))
          updateBookToStorage({ id, totalPageNumber: inputValue })
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
              updateBookToStorage({ id, totalPageNumber: inputValue })
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
  const { price: value, id } = useContext(BookContext)
  const { setBook } = useContext(BookDispatchContext)
  const [isEditable, setIsEditable] = useState(false)
  const [inputValue, setInputValue] = useState(value)

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputValue(Number(e.target.value))
  }

  const handleInputBlur = () => {
    setBook((prev) => ({ ...prev, price: inputValue }))
    updateBookToStorage({ id, price: inputValue })
    setIsEditable(false)
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      setBook((prev) => ({ ...prev, price: inputValue }))
      updateBookToStorage({ id, price: inputValue })
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

Book.DropdownMenuButton = function Component({ onClickDelete }) {
  const { id, title } = useContext(BookContext)
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm">
          <MoreVertical className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => onClickDelete({ id, title })}>
          <Trash2 className="h-4 w-4 mr-2" />
          削除
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
