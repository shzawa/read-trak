import { Book } from '../types'

const KEY = 'books'

export const getBooksFromStorage = () => {
  const books: Book[] = window.JSON.parse(
    window.localStorage.getItem(KEY) || '[]'
  )
  return books
}

export const addBookToStorage = (book: Book) => {
  const books: Book[] = window.JSON.parse(
    window.localStorage.getItem(KEY) || '[]'
  )
  window.localStorage.setItem(KEY, JSON.stringify([...books, book]))
}

export const updateBookToStorage = ({
  id,
  ...book
}: Pick<Book, 'id'> & Partial<Omit<Book, 'id'>>) => {
  const books: Book[] = window.JSON.parse(
    window.localStorage.getItem(KEY) || '[]'
  )
  const updatedBooks = books.map((b) => (b.id === id ? { ...b, ...book } : b))
  window.localStorage.setItem(KEY, JSON.stringify(updatedBooks))
}

export const deleteBookFromStorage = (id: string) => {
  const books: Book[] = window.JSON.parse(
    window.localStorage.getItem(KEY) || '[]'
  )
  const updatedBooks = books.filter((b) => b.id !== id)
  window.localStorage.setItem(KEY, JSON.stringify(updatedBooks))
}
