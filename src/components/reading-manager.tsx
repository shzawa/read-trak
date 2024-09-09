'use client'

import React, { useState } from 'react'
import { Search, Plus, Trash2, EyeOff } from 'lucide-react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"

type Book = {
  id: number
  title: string
  totalPages: number
  price: number
  progress: ProgressEntry[]
}

type ProgressEntry = {
  id: number
  date: string
  fromPage: number
  toPage: number
  isDisabled: boolean
}

type ConfirmDialogProps = {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  description: string
}

const ConfirmDialog: React.FC<ConfirmDialogProps> = ({ isOpen, onClose, onConfirm, title, description }) => (
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

export function ReadingManager() {
  const [books, setBooks] = useState<Book[]>([])
  const [searchTerm, setSearchTerm] = useState('')
  const [newBook, setNewBook] = useState({ title: '', totalPages: 0, price: 0 })
  const [newProgress, setNewProgress] = useState({ bookId: 0, fromPage: 0, toPage: 0 })
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, onConfirm: () => {}, title: '', description: '' })
  const [editingField, setEditingField] = useState<{ bookId: number, field: string, value: string } | null>(null)

  const addBook = () => {
    setBooks([...books, { ...newBook, id: Date.now(), progress: [] }])
    setNewBook({ title: '', totalPages: 0, price: 0 })
  }

  const deleteBook = (bookId: number) => {
    setConfirmDialog({
      isOpen: true,
      onConfirm: () => {
        setBooks(books.filter(b => b.id !== bookId))
        setConfirmDialog({ ...confirmDialog, isOpen: false })
      },
      title: '本の削除',
      description: 'この本の情報を削除してもよろしいですか？'
    })
  }

  const addProgress = (bookId: number) => {
    const book = books.find(b => b.id === bookId)
    if (book) {
      const updatedProgress = [...book.progress, { ...newProgress, bookId, id: Date.now(), date: new Date().toISOString().split('T')[0], isDisabled: false }]
      setBooks(books.map(b => b.id === bookId ? { ...b, progress: updatedProgress } : b))
      setNewProgress({ bookId: 0, fromPage: getInitialFromPage(book), toPage: 0 })
    }
  }

  const deleteProgress = (bookId: number, progressId: number, date: string) => {
    const today = new Date().toISOString().split('T')[0]
    if (date === today) {
      setBooks(books.map(b => b.id === bookId ? { ...b, progress: b.progress.filter(p => p.id !== progressId) } : b))
    } else {
      setConfirmDialog({
        isOpen: true,
        onConfirm: () => {
          setBooks(books.map(b => b.id === bookId ? { ...b, progress: b.progress.filter(p => p.id !== progressId) } : b))
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        },
        title: '進捗の削除',
        description: 'この読書進捗を削除してもよろしいですか？'
      })
    }
  }

  const toggleProgressDisabled = (bookId: number, progressId: number) => {
    setBooks(books.map(b =>
      b.id === bookId
        ? { ...b, progress: b.progress.map(p =>
            p.id === progressId ? { ...p, isDisabled: !p.isDisabled } : p
          )}
        : b
    ))
  }

  const calculateProgress = (book: Book) => {
    const totalPagesRead = book.progress
      .filter(p => !p.isDisabled)
      .reduce((sum, p) => sum + (p.toPage - p.fromPage + 1), 0)
    return (totalPagesRead / book.totalPages) * 100
  }

  const calculatePricePerProgress = (book: Book) => {
    const totalPagesRead = book.progress
      .filter(p => !p.isDisabled)
      .reduce((sum, p) => sum + (p.toPage - p.fromPage + 1), 0)
    return totalPagesRead ? (book.price / book.totalPages) * totalPagesRead : 0
  }

  const getInitialFromPage = (book: Book) => {
    const lastProgress = book.progress[book.progress.length - 1]
    return lastProgress ? lastProgress.toPage + 1 : 1
  }

  const startEditing = (bookId: number, field: string, currentValue: string | number) => {
    if (field === 'totalPages') {
      const book = books.find(b => b.id === bookId)
      if (book) {
        setConfirmDialog({
          isOpen: true,
          onConfirm: () => {
            setEditingField({ bookId, field, value: currentValue.toString() })
            setConfirmDialog({ ...confirmDialog, isOpen: false })
          },
          title: '全ページ数の編集',
          description: `編集すると登録された読書進捗はすべて削除されます。それでも編集しますか？現在の全ページ数: ${book.totalPages}`
        })
      }
    } else {
      setEditingField({ bookId, field, value: currentValue.toString() })
    }
  }

  const handleEdit = (bookId: number, field: string, value: string) => {
    setBooks(books.map(b => {
      if (b.id === bookId) {
        if (field === 'totalPages') {
          return { ...b, [field]: parseInt(value), progress: [] }
        }
        return { ...b, [field]: field === 'price' ? parseInt(value) : value }
      }
      return b
    }))
    setEditingField(null)
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (editingField) {
      setEditingField({ ...editingField, value: e.target.value })
    }
  }

  const handleInputBlur = () => {
    if (editingField) {
      handleEdit(editingField.bookId, editingField.field, editingField.value)
    }
  }

  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      handleInputBlur()
    }
  }

  const filteredBooks = books.filter(book => book.title.toLowerCase().includes(searchTerm.toLowerCase()))

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
          <div className="grid gap-4">
            <Input
              placeholder="タイトル"
              value={newBook.title}
              onChange={(e) => setNewBook({ ...newBook, title: e.target.value })}
              className="w-full"
            />
            <div className="flex gap-2">
              <Input
                type="number"
                placeholder="全ページ数"
                value={newBook.totalPages || ''}
                onChange={(e) => setNewBook({ ...newBook, totalPages: parseInt(e.target.value) })}
              />
              <Input
                type="number"
                placeholder="価格"
                value={newBook.price || ''}
                onChange={(e) => setNewBook({ ...newBook, price: parseInt(e.target.value) })}
              />
              <Button onClick={addBook}><Plus className="mr-2 h-4 w-4" /> 追加</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {filteredBooks.map(book => (
          <Card key={book.id} className="mb-4">
            <CardHeader>
              <div className="flex justify-between items-center">
                <CardTitle className="break-words">
                  {editingField?.bookId === book.id && editingField.field === 'title' ? (
                    <Input
                      value={editingField.value}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      onKeyDown={handleInputKeyDown}
                      autoFocus
                    />
                  ) : (
                    <span
                      className="cursor-pointer hover:bg-muted p-1 rounded"
                      onClick={() => startEditing(book.id, 'title', book.title)}
                    >
                      {book.title}
                    </span>
                  )}
                </CardTitle>
                <Button variant="destructive" size="sm" onClick={() => deleteBook(book.id)}>
                  <Trash2 className="h-4 w-4 mr-2" /> 削除
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <div className="mb-2 flex flex-col sm:flex-row sm:items-center">
                <span className="mr-2">全ページ数:</span>
                {editingField?.bookId === book.id && editingField.field === 'totalPages' ? (
                  <Input
                    type="number"
                    value={editingField.value}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    className="w-20"
                  />
                ) : (
                  <span
                    className="cursor-pointer hover:bg-muted p-1 rounded"
                    onClick={() => startEditing(book.id, 'totalPages', book.totalPages)}
                  >
                    {book.totalPages}
                  </span>
                )}
                <span className="mx-2 hidden sm:inline">/</span>
                <span className="mr-2">価格:</span>
                {editingField?.bookId === book.id && editingField.field === 'price' ? (
                  <Input
                    type="number"
                    value={editingField.value}
                    onChange={handleInputChange}
                    onBlur={handleInputBlur}
                    onKeyDown={handleInputKeyDown}
                    autoFocus
                    className="w-20"
                  />
                ) : (
                  <span
                    className="cursor-pointer hover:bg-muted p-1 rounded"
                    onClick={() => startEditing(book.id, 'price', book.price)}
                  >
                    ¥{book.price}
                  </span>
                )}
              </div>
              <div className="mb-2">
                進行度: {calculateProgress(book).toFixed(2)}%
                <Progress value={calculateProgress(book)} className="mt-2" />
              </div>
              <div className="mb-4">消化価格: ¥{calculatePricePerProgress(book).toFixed(2)}</div>

              <div className="mb-4">
                <h4 className="font-semibold mb-2">読書進捗を追加</h4>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    placeholder="開始ページ"
                    value={newProgress.fromPage || getInitialFromPage(book)}
                    onChange={(e) => setNewProgress({ ...newProgress, bookId: book.id, fromPage: parseInt(e.target.value) })}
                  />
                  <Input
                    type="number"
                    placeholder="終了ページ"
                    value={newProgress.toPage || ''}
                    onChange={(e) => setNewProgress({ ...newProgress, bookId: book.id, toPage: parseInt(e.target.value) })}
                  />
                  <Button onClick={() => addProgress(book.id)}><Plus className="mr-2 h-4 w-4" /> 追加</Button>
                </div>
              </div>

              <div>
                <h4 className="font-semibold mb-2">読書進捗</h4>
                {book.progress.map((p, index) => (
                  <div key={p.id} className={`flex justify-between items-center mb-2 p-2 rounded-md hover:bg-muted/80 transition-colors ${p.isDisabled ? 'bg-muted/50 text-muted-foreground' : 'bg-muted'}`}>
                    <div className="flex items-center space-x-4">
                      <span className="font-medium text-sm">{index + 1}.</span>
                      <span>{p.fromPage} -  {p.toPage}ページ</span>
                      <span className="text-sm text-muted-foreground">({p.toPage - p.fromPage + 1}ページ)</span>
                    </div>
                    <div className="flex items-center space-x-4">
                      <span className="text-sm text-muted-foreground">{p.date}</span>
                      <Button variant="ghost" size="sm" onClick={() => toggleProgressDisabled(book.id, p.id)}>
                        <EyeOff className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => deleteProgress(book.id, p.id, p.date)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ ...confirmDialog, isOpen: false })}
        onConfirm={confirmDialog.onConfirm}
        title={confirmDialog.title}
        description={confirmDialog.description}
      />
    </div>
  )
}
