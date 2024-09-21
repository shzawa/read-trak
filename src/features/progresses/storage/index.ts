import { BookProgress } from '../types'

const KEY = 'book-progresses'

export const getBookProgressesFromStorage = () => {
  const progresses: Record<string, BookProgress[]> = window.JSON.parse(
    window.localStorage.getItem(KEY) || '{}'
  )
  return progresses
}

export const addBookProgressToStorage = ({
  bookId,
  ...progress
}: BookProgress & { bookId: string }) => {
  const progressesRecords: Record<string, BookProgress[]> = window.JSON.parse(
    window.localStorage.getItem(KEY) || '{}'
  )
  const existingProgresses = progressesRecords[bookId] || []
  progressesRecords[bookId] = [...existingProgresses, progress]
  window.localStorage.setItem(KEY, JSON.stringify(progressesRecords))
}

export const updateBookProgressToStorage = ({
  id,
  bookId,
  ...progress
}: Pick<BookProgress, 'id'> &
  Partial<Omit<BookProgress, 'id'>> & { bookId: string }) => {
  const progressesRecords: Record<string, BookProgress[]> = window.JSON.parse(
    window.localStorage.getItem(KEY) || '{}'
  )
  progressesRecords[bookId] = progressesRecords[bookId].map((b) =>
    b.id === id ? { ...b, ...progress } : b
  )
  window.localStorage.setItem(KEY, JSON.stringify(progressesRecords))
}

export const deleteBookProgressFromStorage = ({
  id,
  bookId,
}: {
  id: string
  bookId: string
}) => {
  const progressesRecords: Record<string, BookProgress[]> = window.JSON.parse(
    window.localStorage.getItem(KEY) || '{}'
  )
  progressesRecords[bookId] = progressesRecords[bookId].filter(
    (p) => p.id !== id
  )
  window.localStorage.setItem(KEY, JSON.stringify(progressesRecords))
}
