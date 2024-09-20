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
import { useLocalStorage } from '@/hooks/useLocalStorage'

// { id: string, ... }[]
const BOOKS_STORAGE_KEY = 'Books'

// TODO: 共通化
// {[bookId: string]: { id: string, ... }[]}
const BOOK_PROGRESSES_STORAGE_KEY = 'BookProgresses'

type Book = {
  id: string
  title: string
  totalPageNumber: number
  price: number
  createdAt: string
}

type BookProgressType = {
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

type BookId = string
type BookProgressRecord = Record<BookId, BookProgressType[]>

export function ReadingManager() {
  const [books, setBooks] = useLocalStorage<Book[]>(BOOKS_STORAGE_KEY, [])
  const mappedBooks = books.toSorted(
    (a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  )
  const [progresses] = useLocalStorage<BookProgressRecord>(
    BOOK_PROGRESSES_STORAGE_KEY,
    {}
  )
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
  >(
    (params) => {
      console.log('asdasdasdasds')
      setBooks((books) => [
        ...books,
        {
          ...params,
          id: window.crypto.randomUUID(),
          createdAt: new window.Date().toLocaleString(),
        },
      ])
    },
    [setBooks]
  )

  const handleDeleteBook = (bookId: string) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: () => {
        setBooks((books) => books.filter((book) => book.id !== bookId))

        setConfirmDialog((c) => ({ ...c, isOpen: false }))
      },
      onClose: () => {}, // TODO: これの定義を消したい
      title: '本の削除',
      description: `この本の情報を削除してもよろしいですか？タイトル: ${books.find((book) => book.id === bookId)?.title}`,
    })
  }

  const handleEditTitle = useCallback<
    ComponentProps<typeof Book.Title>['onEdit']
  >(
    ({ id, value }) => {
      setBooks((books) =>
        books.map((b) => (b.id === id ? { ...b, title: value } : b))
      )
    },
    [setBooks]
  )

  const handleEditPrice = useCallback<
    ComponentProps<typeof Book.TotalPageNumberAndPrice>['onEditPrice']
  >(
    ({ id, value }) => {
      setBooks((books) =>
        books.map((b) => (b.id === id ? { ...b, price: value } : b))
      )
    },
    [setBooks]
  )

  const handleEditTotalPageNumber = useCallback<
    ComponentProps<typeof Book.TotalPageNumberAndPrice>['onEditTotalPageNumber']
  >(
    ({ id, value, onConfirm }) => {
      setConfirmDialog({
        isOpen: true,
        title: '全ページ数の編集',
        description: `編集すると登録された読書進捗はすべて削除されます。それでも編集しますか？現在の全ページ数: ${value}`,
        onConfirm: () => {
          onConfirm()
          setBooks((books) =>
            books.map((b) =>
              b.id === id ? { ...b, totalPageNumber: value } : b
            )
          )
          setConfirmDialog((c) => ({ ...c, isOpen: false }))
        },
        onClose: () => {},
      })
    },
    [setBooks]
  )

  const handleDeleteBookProgress = useCallback<
    ComponentProps<typeof BookProgress.Records>['onDelete']
  >(
    ({ bookId, id, onConfirm }) => {
      setConfirmDialog({
        isOpen: true,
        onConfirm: () => {
          onConfirm()
          setConfirmDialog((c) => ({ ...c, isOpen: false }))
        },
        onClose: () => {}, // TODO: これの定義を消したい
        title: '読書進捗の削除',
        description: `この読書進捗を削除してもよろしいですか？登録日時: ${progresses[bookId].find((p) => p.id === id)?.createdAt}`,
      })
    },
    [progresses]
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
              >
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
                  <BookProgress.Records onDelete={handleDeleteBookProgress} />
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
