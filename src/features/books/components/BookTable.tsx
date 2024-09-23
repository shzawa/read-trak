import { ComponentProps, FC, memo, useCallback, useMemo, useState } from 'react'
import { Book } from './Book'
import { BookProgress as BookProgressType } from '@/features/progresses/types'
import { BookProgress } from '@/features/progresses/components/BookProgress'
import { CreateForm as CreateBookProgressForm } from '@/features/progresses/components/CreateForm'
import { CreateForm } from '@/features/books/components/CreateForm'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Book as BookType } from '../types'
import { addBookToStorage, deleteBookFromStorage } from '../storage'
import { CollapsibleCreateForm } from './CollapsibleCreateForm'

export const BookTable: FC<{
  initialBooks: BookType[]
  initialBookProgresses: Record<string, BookProgressType[]>
  openConfirm: (params: {
    title: string
    description: string
    onSubmit: () => void
    onCancel?: () => void
  }) => void
}> = memo(({ initialBooks, initialBookProgresses, openConfirm }) => {
  const [searchTerm, setSearchTerm] = useState('')
  const [books, setBooks] = useState<BookType[]>(initialBooks)
  const sortedBooks = useMemo(
    () =>
      books
        .filter((book) =>
          // searchTerm が1文字でもあったら絞り込む
          searchTerm.length > 0 ? book.title.includes(searchTerm) : true
        )
        .toSorted(
          (a, b) =>
            new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
        ),
    [books, searchTerm]
  )

  const handleCreateBook = useCallback<
    ComponentProps<typeof CreateForm>['onSubmit']
  >(
    (params) => {
      const newBook = {
        id: window.crypto.randomUUID(),
        createdAt: new Date().toLocaleString(),
        ...params,
      }
      setBooks((prevBooks) => [...prevBooks, newBook])
      addBookToStorage(newBook)
    },
    [setBooks]
  )

  const handleDeleteBook = useCallback<
    ComponentProps<typeof Book.DropdownMenuButton>['onClickDelete']
  >(
    ({ id, title }) => {
      openConfirm({
        title: '書籍の削除',
        description: `この書籍の情報を削除してもよろしいですか？タイトル: ${title}`,
        onSubmit: () => {
          setBooks((prevBooks) => prevBooks.filter((book) => book.id !== id))
          deleteBookFromStorage(id)
        },
      })
    },
    [openConfirm]
  )

  const handleConfirmEditTotalPageNumber = useCallback<
    ComponentProps<
      typeof Book.TotalPageNumberAndPrice
    >['onConfirmEditTotalPageNumber']
  >(
    ({ onCancel, onSubmit, value }) => {
      openConfirm({
        title: '全ページ数の編集',
        description: `編集すると登録された読書進捗はすべて削除されます。それでも編集しますか？現在の全ページ数: ${value}`,
        onCancel,
        onSubmit,
      })
    },
    [openConfirm]
  )

  const handleConfirmDeleteBookProgress = useCallback<
    ComponentProps<typeof BookProgress.Records>['onConfirmDelete']
  >(
    ({ createdAt, onSubmit }) => {
      openConfirm({
        title: '読書進捗の削除',
        description: `この読書進捗を削除してもよろしいですか？登録日時: ${createdAt}`,
        onSubmit,
      })
    },
    [openConfirm]
  )

  return (
    <>
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="書籍のタイトルを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>
      <CollapsibleCreateForm onSubmit={handleCreateBook} />

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {sortedBooks.map((book) => (
          <Book {...book} key={book.id}>
            <Book.Header>
              <Book.Title />
              <Book.DropdownMenuButton onClickDelete={handleDeleteBook} />
            </Book.Header>
            <Book.Content
              initialProgresses={initialBookProgresses?.[book.id] || []}
            >
              <Book.TotalPageNumberAndPrice
                onConfirmEditTotalPageNumber={handleConfirmEditTotalPageNumber}
              />
              <BookProgress.Header>
                <BookProgress.TotalProgress />
                <BookProgress.TotalPricePerProgress />
                <CreateBookProgressForm>
                  <CreateBookProgressForm.FromPageInputField />
                  <CreateBookProgressForm.ToPageInputField />
                  <CreateBookProgressForm.SubmitButton />
                </CreateBookProgressForm>
              </BookProgress.Header>
              <BookProgress.Content>
                <BookProgress.Records
                  onConfirmDelete={handleConfirmDeleteBookProgress}
                />
              </BookProgress.Content>
            </Book.Content>
          </Book>
        ))}
      </div>
    </>
  )
})
