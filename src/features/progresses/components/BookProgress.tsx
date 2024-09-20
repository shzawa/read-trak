import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { useLocalStorage } from '@/hooks/useLocalStorage'
import { EyeOff, Trash2 } from 'lucide-react'
import {
  createContext,
  Dispatch,
  FC,
  PropsWithChildren,
  SetStateAction,
  useCallback,
  useContext,
  useMemo,
} from 'react'
import { BookProgressType } from '../types'

// TODO: 共通化
// {[bookId: string]: { id: string, ... }[]}
const BOOK_PROGRESSES_STORAGE_KEY = 'BookProgresses'

type BookProgressContext = {
  bookId: string
  totalProgress: number
  totalPricePerProgress: number
  initialFromPageNumber: number
  entries: BookProgressType[]
  setEntries: Dispatch<SetStateAction<BookProgressType[]>>
}
// TODO: DispatchContextとStateContextで分けたい
export const BookProgressContext = createContext<BookProgressContext>({
  bookId: '',
  totalProgress: 0,
  totalPricePerProgress: 0,
  entries: [],
  initialFromPageNumber: 0,
  setEntries: () => void 0,
})

export interface BookProgressComponent
  extends FC<PropsWithChildren<BookProgressProps>> {
  Header: FC<PropsWithChildren>
  TotalProgress: FC
  TotalPricePerProgress: FC
  Content: FC<PropsWithChildren>
  Records: FC<{
    onDelete: (props: {
      id: string
      bookId: string
      onConfirm: () => void
    }) => void
  }>
}

// TODO: 共通化
type BookId = string
type BookProgressRecord = Record<BookId, BookProgressType[]>

type BookProgressProps = {
  bookId: string
  price: number
  totalPageNumber: number
}
export const BookProgress: BookProgressComponent = ({
  price,
  totalPageNumber,
  children,
  ...props
}) => {
  const [bookProgressRecord, setBookProgressRecord] =
    useLocalStorage<BookProgressRecord>(BOOK_PROGRESSES_STORAGE_KEY, {})
  const [entries, setEntries] = useMemo<
    [BookProgressType[], Dispatch<SetStateAction<BookProgressType[]>>]
  >(
    () => [
      bookProgressRecord[props.bookId] || [],
      (entries) => {
        setBookProgressRecord((prevRecord) => ({
          ...prevRecord,
          [props.bookId]:
            entries instanceof Function
              ? entries(prevRecord[props.bookId] || [])
              : entries,
        }))
      },
    ],
    [bookProgressRecord, props.bookId, setBookProgressRecord]
  )

  const totalProgress = useMemo(() => {
    const totalPageCountRead = entries
      .filter((p) => p.isEnabled)
      .reduce((sum, p) => sum + (p.toPageNumber - p.fromPageNumber + 1), 1)
    return (totalPageCountRead / totalPageNumber) * 100
  }, [entries, totalPageNumber])

  const totalPricePerProgress = useMemo(() => {
    const totalPageCountRead = entries
      .filter((p) => p.isEnabled)
      .reduce((sum, p) => sum + (p.toPageNumber - p.fromPageNumber + 1), 1)
    return totalPageCountRead
      ? (price / totalPageNumber) * totalPageCountRead
      : 0
  }, [entries, price, totalPageNumber])

  const initialFromPageNumber = useMemo(() => {
    if (entries.length === 0) return 1
    // FIXME: toPageNumber が number 型なのに中身は string になっている
    return Number(entries[entries.length - 1].toPageNumber) + 1
  }, [entries])

  const value = {
    ...props,
    totalProgress,
    totalPricePerProgress,
    initialFromPageNumber,
    entries,
    setEntries,
  }
  return (
    <BookProgressContext.Provider value={value}>
      <div>{children}</div>
    </BookProgressContext.Provider>
  )
}

BookProgress.Header = function Component({ children }) {
  return <div>{children}</div>
}

BookProgress.TotalProgress = function Component() {
  const { totalProgress } = useContext(BookProgressContext)
  return (
    <div className="mb-2">
      進行度: {totalProgress}%
      <Progress value={totalProgress} className="mt-2" />
    </div>
  )
}

BookProgress.TotalPricePerProgress = function Component() {
  const { totalPricePerProgress } = useContext(BookProgressContext)
  return <div className="mb-4">消化価格: ¥{totalPricePerProgress}</div>
}

BookProgress.Content = function Component({ children }) {
  return (
    <div>
      <h4 className="font-semibold mb-2">読書進捗</h4>
      {children}
    </div>
  )
}

BookProgress.Records = function Component({ onDelete }) {
  const { entries, bookId, setEntries } = useContext(BookProgressContext)

  const handleChangeProgressStatus = useCallback(
    (id: string, isEnabled: boolean) => {
      const toggledIsEnabled = !isEnabled
      setEntries((entries) =>
        entries.map((entry) =>
          entry.id === id ? { ...entry, isEnabled: toggledIsEnabled } : entry
        )
      )
    },
    [setEntries]
  )
  const handleDeleteProgress = useCallback(
    (id: string) => {
      onDelete({
        id,
        bookId,
        onConfirm: () =>
          setEntries((entries) => entries.filter((entry) => entry.id !== id)),
      })
    },
    [bookId, onDelete, setEntries]
  )

  return (
    <>
      {entries.map((e, index) => (
        <div
          key={e.id}
          className={`flex justify-between items-center mb-2 p-2 rounded-md hover:bg-muted/80 transition-colors ${e.isEnabled ? 'bg-muted/50 text-muted-foreground' : 'bg-muted'}`}
        >
          <div className="flex items-center space-x-4">
            <span className="font-medium text-sm">{index + 1}.</span>
            <span>
              {e.fromPageNumber} - {e.toPageNumber}ページ
            </span>
            <span className="text-sm text-muted-foreground">
              ({e.toPageNumber - e.fromPageNumber + 1}ページ)
            </span>
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-muted-foreground">{e.createdAt}</span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleChangeProgressStatus(e.id, e.isEnabled)}
            >
              <EyeOff className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => handleDeleteProgress(e.id)}
            >
              <Trash2 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      ))}
    </>
  )
}
