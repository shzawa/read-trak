import { Button } from '@/components/ui/button'
import { CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Trash2 } from 'lucide-react'
import { Progress } from '@/components/ui/progress'
import {
  createContext,
  Dispatch,
  ReactNode,
  SetStateAction,
  useMemo,
  type ComponentProps,
  type FC,
} from 'react'

type ProgressEntry = {
  id: number
  date: string
  fromPage: number
  toPage: number
  isDisabled: boolean
}

export const BookContent: FC<
  Omit<ComponentProps<typeof BookContentInner>, 'progress'> & {
    progressEntries: ProgressEntry[]
  }
> = (props) => {
  const totalPagesRead = useMemo(
    () =>
      props.progressEntries
        .filter((p) => !p.isDisabled)
        .reduce((sum, p) => sum + (p.toPage - p.fromPage + 1), 0),
    [props.progressEntries]
  )

  const progress = useMemo(
    () => (totalPagesRead / props.totalPageCount) * 100,
    [props.totalPageCount, totalPagesRead]
  )

  const pricePerProgress = useMemo(
    () =>
      totalPagesRead
        ? (props.price / props.totalPageCount) * totalPagesRead
        : 0,
    [props.price, props.totalPageCount, totalPagesRead]
  )

  return (
    <BookContentInner
      {...props}
      progress={progress}
      pricePerProgress={pricePerProgress}
    />
  )
}

const BookContentInner: FC<{
  id: number
  title: string
  totalPageCount: number
  price: number
  progress: number
  pricePerProgress: number
  onClickDelete: (bookId: number) => void
  progressList: ReactNode
}> = ({
  id,
  title,
  totalPageCount,
  price,
  progress,
  pricePerProgress,
  onClickDelete,
  progressList,
}) => {
  return (
    <>
      <CardHeader>
        <div className="flex justify-between items-center">
          <CardTitle className="break-words">{title}</CardTitle>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onClickDelete(id)}
          >
            <Trash2 className="h-4 w-4 mr-2" /> 削除
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
          <span className="mr-2">全ページ数:</span>
          {totalPageCount}
          <span className="mx-2 hidden sm:inline">/</span>
          <span className="mr-2">価格:</span>
          {price}
        </div>
        <div className="mb-2">
          進行度: {progress}%
          <Progress value={progress} className="mt-2" />
        </div>
        <div className="mb-4">消化価格: ¥{pricePerProgress}</div>
        {progressList}
      </CardContent>
    </>
  )
}

const TabsContext = createContext<{
  selectedContent: string
  setSelectedContent: Dispatch<SetStateAction<string>>
}>({
  selectedContent: '',
  setSelectedContent: () => {},
})

type Props = {
  children: ReactNode
}

export const Tabs = ({ children }: Props) => {
  return (
    <TabsContext.Provider value={{ selectedContent, setSelectedContent }}>
      {children}
    </TabsContext.Provider>
  )
}

type TriggerProps = {
  children: ReactNode
  value: string
}

const Trigger = ({ children, value }: TriggerProps) => {
  const { setSelectedContent } = useContext(TabsContext)

  const selectContent = () => {
    setSelectedContent(value)
  }

  return <button onClick={selectContent}>{children}</button>
}

Tabs.Trigger = Trigger

type ContentProps = {
  children: ReactNode
  value: string
}

const Content = ({ children, value }: ContentProps) => {
  const { selectedContent } = useContext(TabsContext)
  return value === selectedContent && <div>{children}</div>
}

Tabs.Trigger = Trigger
Tabs.Content = Content
