import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { EyeOff, Trash2 } from 'lucide-react'
import {
  createContext,
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'

type BookProgressContext = {
  bookId: string
  totalProgress: number
  totalPricePerProgress: number
  initialFromPageNumber: number
  entries: {
    id: string
    fromPageNumber: number
    toPageNumber: number
    isEnabled: boolean
    createdAt: string
  }[]
}
export const BookProgressContext = createContext<BookProgressContext>({
  bookId: '',
  totalProgress: 0,
  totalPricePerProgress: 0,
  entries: [],
  initialFromPageNumber: 0,
})

export interface BookProgressComponent
  extends FC<PropsWithChildren<BookProgressProps>> {
  Header: FC<PropsWithChildren>
  TotalProgress: FC
  TotalPricePerProgress: FC
  Content: FC<PropsWithChildren>
  Records: FC<{
    onChangeStatus: (props: {
      id: string
      bookId: string
      isEnabled: boolean
    }) => void
    onDelete: (props: { id: string; bookId: string }) => void
  }>
}

type BookProgressProps = {
  bookId: string
  price: number
  totalPageNumber: number
  entries: {
    id: string
    fromPageNumber: number
    toPageNumber: number
    isEnabled: boolean
    createdAt: string
  }[]
}
export const BookProgress: BookProgressComponent = ({
  price,
  totalPageNumber,
  children,
  ...props
}) => {
  const totalProgress = useMemo(() => {
    const totalPageCountRead = props.entries
      .filter((p) => p.isEnabled)
      .reduce((sum, p) => sum + (p.toPageNumber - p.fromPageNumber + 1), 1)
    return (totalPageCountRead / totalPageNumber) * 100
  }, [props.entries, totalPageNumber])
  const totalPricePerProgress = useMemo(() => {
    const totalPageCountRead = props.entries
      .filter((p) => p.isEnabled)
      .reduce((sum, p) => sum + (p.toPageNumber - p.fromPageNumber + 1), 1)
    return totalPageCountRead
      ? (price / totalPageNumber) * totalPageCountRead
      : 0
  }, [props.entries, price, totalPageNumber])
  const initialFromPageNumber = useMemo(() => {
    if (props.entries.length === 0) return 1
    return props.entries[props.entries.length - 1].toPageNumber + 1
  }, [props.entries])
  const value = useMemo(
    () => ({
      ...props,
      totalProgress,
      totalPricePerProgress,
      initialFromPageNumber,
    }),
    [initialFromPageNumber, props, totalPricePerProgress, totalProgress]
  )
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

BookProgress.Records = function Component({ onChangeStatus, onDelete }) {
  const { entries: initialEntries, bookId } = useContext(BookProgressContext)
  const [entries, setEntries] = useState(initialEntries)

  const handleChangeProgressStatus = useCallback(
    (id: string, isEnabled: boolean) => {
      const toggledIsEnabled = !isEnabled
      setEntries((entries) =>
        entries.map((entry) =>
          entry.id === id ? { ...entry, isEnabled: toggledIsEnabled } : entry
        )
      )
      onChangeStatus({ id, bookId, isEnabled: toggledIsEnabled })
    },
    [bookId, onChangeStatus]
  )
  const handleDeleteProgress = useCallback(
    (id: string) => {
      setEntries((entries) => entries.filter((entry) => entry.id !== id))
      onDelete({ id, bookId })
    },
    [bookId, onDelete]
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
