import { createContext, Dispatch, SetStateAction } from 'react'
import { Book } from '../types'

type BookContextProps = Book
export const BookContext = createContext<BookContextProps>({
  id: '',
  price: 0,
  title: '',
  totalPageNumber: 0,
  createdAt: '',
})

export const BookDispatchContext = createContext<{
  setBook: Dispatch<SetStateAction<Book>>
}>({
  setBook: () => {},
})
