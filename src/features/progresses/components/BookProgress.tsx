import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { EyeOff, Trash2 } from 'lucide-react'
import {
  FC,
  PropsWithChildren,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react'
import { BookProgress as BookProgressType } from '../types'
import {
  deleteBookProgressFromStorage,
  updateBookProgressToStorage,
} from '../storage'
import { BookProgressContext, BookProgressDispatchContext } from '../context'

export interface BookProgressComponent
  extends FC<PropsWithChildren<BookProgressProps>> {
  Header: FC<PropsWithChildren>
  TotalProgress: FC
  TotalPricePerProgress: FC
  Content: FC<PropsWithChildren>
  Records: FC<{
    onConfirmDelete: (props: {
      id: string
      bookId: string
      createdAt: string
      onSubmit: () => void
    }) => void
  }>
  Record: FC<
    BookProgressType & {
      counter: number
      onChangeStatus: (params: { id: string; isEnabled: boolean }) => void
      onDelete: (params: { id: string; createdAt: string }) => void
    }
  >
}

type BookProgressProps = {
  bookId: string
  price: number
  totalPageNumber: number
  initialValues: BookProgressType[]
}
export const BookProgress: BookProgressComponent = ({
  initialValues,
  price,
  totalPageNumber,
  children,
  ...props
}) => {
  const [entries, setEntries] = useState(initialValues)

  const totalProgress = useMemo(() => {
    const totalPageCountRead = entries
      .filter((p) => p.isEnabled)
      .reduce((sum, p) => sum + (p.toPageNumber - p.fromPageNumber + 1), 0)
    const total = (totalPageCountRead / totalPageNumber) * 100
    return Math.floor(total * 10) / 10
  }, [entries, totalPageNumber])

  const totalPricePerProgress = useMemo(() => {
    const totalPageCountRead = entries
      .filter((p) => p.isEnabled)
      .reduce((sum, p) => sum + (p.toPageNumber - p.fromPageNumber + 1), 0)
    const total = totalPageCountRead
      ? (price / totalPageNumber) * totalPageCountRead
      : 0
    return Math.floor(total)
  }, [entries, price, totalPageNumber])

  const initialFromPageNumber = useMemo(() => {
    return entries.length === 0
      ? 1
      : Number(entries[entries.length - 1].toPageNumber) + 1
  }, [entries])

  const dispatch = useMemo(() => ({ setEntries }), [])
  const value = useMemo(
    () => ({
      totalProgress,
      totalPricePerProgress,
      initialFromPageNumber,
      entries,
      ...props,
    }),
    [
      entries,
      initialFromPageNumber,
      props,
      totalPricePerProgress,
      totalProgress,
    ]
  )
  return (
    <BookProgressDispatchContext.Provider value={dispatch}>
      <BookProgressContext.Provider value={value}>
        {children}
      </BookProgressContext.Provider>
    </BookProgressDispatchContext.Provider>
  )
}

BookProgress.Header = function Component({ children }) {
  return useMemo(() => <div>{children}</div>, [children])
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
  return useMemo(
    () => (
      <div>
        <h4 className="font-semibold mb-2">読書進捗</h4>
        {children}
      </div>
    ),
    [children]
  )
}

BookProgress.Records = function Component({ onConfirmDelete }) {
  const { entries, bookId } = useContext(BookProgressContext)
  const { setEntries } = useContext(BookProgressDispatchContext)

  const handleChangeStatus = useCallback(
    ({ id, isEnabled }: { id: string; isEnabled: boolean }) => {
      const toggledIsEnabled = !isEnabled
      setEntries((entries) =>
        entries.map((entry) =>
          entry.id === id ? { ...entry, isEnabled: toggledIsEnabled } : entry
        )
      )
      updateBookProgressToStorage({ id, bookId, isEnabled: toggledIsEnabled })
    },
    [bookId, setEntries]
  )
  const handleDelete = useCallback(
    ({ id, createdAt }: { id: string; createdAt: string }) => {
      onConfirmDelete({
        id,
        bookId,
        createdAt,
        onSubmit: () => {
          setEntries((entries) => entries.filter((entry) => entry.id !== id))
          deleteBookProgressFromStorage({ id, bookId })
        },
      })
    },
    [bookId, onConfirmDelete, setEntries]
  )

  return (
    <>
      {entries.map((entry, index) => (
        <BookProgress.Record
          {...entry}
          key={entry.id}
          counter={index + 1}
          onChangeStatus={handleChangeStatus}
          onDelete={handleDelete}
        />
      ))}
    </>
  )
}

BookProgress.Record = function Component({
  id,
  fromPageNumber,
  toPageNumber,
  isEnabled,
  createdAt,
  counter,
  onChangeStatus,
  onDelete,
}) {
  return useMemo(
    () => (
      <div
        className={`flex justify-between items-center mb-2 p-2 rounded-md hover:bg-muted/80 transition-colors ${isEnabled ? 'bg-muted/50 text-muted-foreground' : 'bg-muted'}`}
      >
        <div className="flex items-center space-x-4">
          <span className="font-medium text-base">{counter}.</span>
          <span>
            {fromPageNumber} - {toPageNumber}ページ
          </span>
          <span className="text-base text-muted-foreground">
            ({toPageNumber - fromPageNumber + 1}ページ)
          </span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="text-base text-muted-foreground">{createdAt}</span>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onChangeStatus({ id, isEnabled })}
          >
            <EyeOff className="h-4 w-4" />
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onDelete({ id, createdAt })}
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    ),
    [
      counter,
      createdAt,
      fromPageNumber,
      id,
      isEnabled,
      onChangeStatus,
      onDelete,
      toPageNumber,
    ]
  )
}
