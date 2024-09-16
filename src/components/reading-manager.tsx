'use client'

import type React from 'react'
import { ComponentProps, useCallback, useState } from 'react'
import { Search } from 'lucide-react'
import { Input } from '@/components/ui/input'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { Book } from '@/features/books/components/Book'
import { CreateForm as CreateBookProgressForm } from '@/features/progresses/components/CreateForm'
import { BookProgress } from '@/features/progresses/components/BookProgress'
import { CreateForm as CreateBookForm } from '@/features/books/components/CreateForm'

// {[bookId: string]: { id: string, ... }}
const BOOKS_STORAGE_KEY = 'Books'
// {[bookId: string]: {[progressId: string]: { id: string, ... }}}
const BOOK_PROGRESSES_STORAGE_KEY = 'BookProgresses'

type Book = {
  id: string
  title: string
  totalPageNumber: number
  price: number
  progressEntries: BookProgress[]
  createdAt: string
}

type BookProgress = {
  id: string
  fromPageNumber: number
  toPageNumber: number
  isEnabled: boolean
  createdAt: string
}

type ConfirmDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
}) => (
  <AlertDialog open={isOpen}>
    <AlertDialogContent>
      <AlertDialogHeader>
        <AlertDialogTitle>{title}</AlertDialogTitle>
        <AlertDialogDescription>{description}</AlertDialogDescription>
      </AlertDialogHeader>
      <AlertDialogFooter>
        <AlertDialogCancel onClick={onClose}>キャンセル</AlertDialogCancel>
        <AlertDialogAction onClick={onConfirm}>編集します</AlertDialogAction>
      </AlertDialogFooter>
    </AlertDialogContent>
  </AlertDialog>
)

const getBooks = () => {
  const books: Record<string, Book> = window.JSON.parse(
    window.localStorage.getItem(BOOKS_STORAGE_KEY) || '{}'
  )
  return books
}

export function ReadingManager() {
  const [books, setBooks] = useState<Record<string, Book>>(getBooks)
  const [searchTerm, setSearchTerm] = useState('')
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    onConfirm: () => {},
    onClose: () => {},
    title: '',
    description: '',
  })

  const handleSubmitCreateBook = useCallback<
    ComponentProps<typeof CreateBookForm>['onSubmit']
  >((params) => {
    const newId = window.crypto.randomUUID()
    const newBook = {
      ...params,
      id: newId,
      createdAt: new window.Date().toLocaleString(),
      progressEntries: [],
    }
    setBooks((books) => ({
      ...books,
      [newId]: newBook,
    }))
    const books: Record<string, Book> = window.JSON.parse(
      window.localStorage.getItem(BOOKS_STORAGE_KEY) || '{}'
    )
    books[newId] = newBook
    window.localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books))
  }, [])

  const handleDeleteBook = (bookId: string) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: () => {
        setBooks((books) => {
          delete books[bookId]
          return books
        })

        const books: Record<string, Book> = window.JSON.parse(
          window.localStorage.getItem(BOOKS_STORAGE_KEY) || '{}'
        )
        delete books[bookId]
        window.localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books))

        setConfirmDialog((c) => ({ ...c, isOpen: false }))
      },
      onClose: () => {}, // TODO: これの定義を消したい
      title: '本の削除',
      description: `この本の情報を削除してもよろしいですか？タイトル: ${books[bookId]}`,
    })
  }

  const handleEditTitle = useCallback<
    ComponentProps<typeof Book.Title>['onEdit']
  >(({ id, value }) => {
    const books: Record<string, Book> = window.JSON.parse(
      window.localStorage.getItem(BOOKS_STORAGE_KEY) || '{}'
    )
    books[id] = {
      ...books[id],
      title: value,
    }
    window.localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books))
  }, [])

  const handleEditPrice = useCallback<
    ComponentProps<typeof Book.TotalPageNumberAndPrice>['onEditPrice']
  >(({ id, value }) => {
    const books: Record<string, Book> = window.JSON.parse(
      window.localStorage.getItem(BOOKS_STORAGE_KEY) || '{}'
    )
    books[id] = {
      ...books[id],
      price: value,
    }
    window.localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books))
  }, [])

  const handleEditTotalPageNumber = useCallback<
    ComponentProps<typeof Book.TotalPageNumberAndPrice>['onEditTotalPageNumber']
  >(({ id, value, onCancel }) => {
    setConfirmDialog({
      isOpen: true,
      title: '全ページ数の編集',
      description: `編集すると登録された読書進捗はすべて削除されます。それでも編集しますか？現在の全ページ数: ${value}`,
      onConfirm: () => {
        const books: Record<string, Book> = window.JSON.parse(
          window.localStorage.getItem(BOOKS_STORAGE_KEY) || '{}'
        )
        books[id] = {
          ...books[id],
          totalPageNumber: value,
        }
        window.localStorage.setItem(BOOKS_STORAGE_KEY, JSON.stringify(books))

        setConfirmDialog((c) => ({ ...c, isOpen: false }))
      },
      onClose: onCancel,
    })
  }, [])

  const handleSubmitCreateBookProgress = useCallback<
    ComponentProps<typeof CreateBookProgressForm>['onSubmit']
  >(({ bookId, ...params }) => {
    const progresses: Record<
      string,
      Record<string, BookProgress>
    > = window.JSON.parse(
      window.localStorage.getItem(BOOK_PROGRESSES_STORAGE_KEY) || '{}'
    )
    const newId = window.crypto.randomUUID()
    progresses[bookId][newId] = {
      ...params,
      id: newId,
      createdAt: new window.Date().toLocaleString(),
      isEnabled: true,
    }
    window.localStorage.setItem(
      BOOK_PROGRESSES_STORAGE_KEY,
      JSON.stringify(progresses)
    )
  }, [])

  const handleChangeBookProgressStatus = useCallback<
    ComponentProps<typeof BookProgress.Records>['onChangeStatus']
  >(({ bookId, id, isEnabled }) => {
    const progresses: Record<
      string,
      Record<string, BookProgress>
    > = window.JSON.parse(
      window.localStorage.getItem(BOOK_PROGRESSES_STORAGE_KEY) || '{}'
    )
    progresses[bookId][id] = {
      ...progresses[bookId][id],
      isEnabled,
    }
    window.localStorage.setItem(
      BOOK_PROGRESSES_STORAGE_KEY,
      JSON.stringify(progresses)
    )
  }, [])

  const handleDeleteBookProgress = useCallback<
    ComponentProps<typeof BookProgress.Records>['onDelete']
  >(({ bookId, id }) => {
    const progresses: Record<
      string,
      Record<string, BookProgress>
    > = window.JSON.parse(
      window.localStorage.getItem(BOOK_PROGRESSES_STORAGE_KEY) || '{}'
    )

    setConfirmDialog({
      isOpen: true,
      onConfirm: () => {
        delete progresses[bookId][id]
        window.localStorage.setItem(
          BOOK_PROGRESSES_STORAGE_KEY,
          JSON.stringify(progresses)
        )

        setConfirmDialog((c) => ({ ...c, isOpen: false }))
      },
      onClose: () => {}, // TODO: これの定義を消したい
      title: '読書進捗の削除',
      description: `この読書進捗を削除してもよろしいですか？登録日時: ${progresses[bookId][id].createdAt}`,
    })
  }, [])

  // FIXME: メモ化すると削除操作が反映されなくなる
  const mappedBooks = Object.values(books).toSorted(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )

  return (
    <div className="container mx-auto p-4">
      <div className="mb-4">
        <div className="relative">
          <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="本のタイトルを検索..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-8"
          />
        </div>
      </div>

      <Card className="mb-4">
        <CardHeader>
          <CardTitle>新しい本を追加</CardTitle>
        </CardHeader>
        <CardContent>
          <CreateBookForm onSubmit={handleSubmitCreateBook}>
            <CreateBookForm.TextInputField
              name="title"
              placeholder="タイトル"
              className="w-full"
            />
            <div className="flex gap-2">
              <CreateBookForm.NumberInputField
                name="totalPageNumber"
                placeholder="全ページ数"
              />
              <CreateBookForm.NumberInputField
                name="price"
                placeholder="価格"
              />
              <CreateBookForm.SubmitButton />
            </div>
          </CreateBookForm>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {mappedBooks.map((book) => (
          <Book {...book} key={book.id}>
            <Book.Header>
              <Book.Title onEdit={handleEditTitle} />
              <Book.DeleteButton onClick={handleDeleteBook} />
            </Book.Header>
            <Book.Content>
              <Book.TotalPageNumberAndPrice
                onEditPrice={handleEditPrice}
                onEditTotalPageNumber={handleEditTotalPageNumber}
              />
              <BookProgress
                bookId={book.id}
                price={book.price}
                totalPageNumber={book.totalPageNumber}
                entries={book.progressEntries}
              >
                <BookProgress.Header>
                  <BookProgress.TotalProgress />
                  <BookProgress.TotalPricePerProgress />
                  <CreateBookProgressForm
                    onSubmit={handleSubmitCreateBookProgress}
                  >
                    <CreateBookProgressForm.FromPageInputField />
                    <CreateBookProgressForm.ToPageInputField />
                    <CreateBookProgressForm.SubmitButton />
                  </CreateBookProgressForm>
                </BookProgress.Header>
                <BookProgress.Content>
                  <BookProgress.Records
                    onChangeStatus={handleChangeBookProgressStatus}
                    onDelete={handleDeleteBookProgress}
                  />
                </BookProgress.Content>
              </BookProgress>
            </Book.Content>
          </Book>
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.onClose}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />
    </div>
  )
}
