import { createContext, Dispatch, SetStateAction } from 'react'
import { BookProgress } from '../types'

type BookProgressContext = {
  bookId: string
  totalProgress: number
  totalPricePerProgress: number
  initialFromPageNumber: number
  entries: BookProgress[]
}
export const BookProgressContext = createContext<BookProgressContext>({
  bookId: '',
  totalProgress: 0,
  totalPricePerProgress: 0,
  entries: [],
  initialFromPageNumber: 0,
})

export const BookProgressDispatchContext = createContext<{
  setEntries: Dispatch<SetStateAction<BookProgress[]>>
}>({
  setEntries: () => {},
})
