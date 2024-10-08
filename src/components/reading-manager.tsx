import { ComponentProps, useCallback, useState } from 'react'
import { BookTable } from '@/features/books/components/BookTable'
import { getBooksFromStorage } from '@/features/books/storage'
import { getBookProgressesFromStorage } from '@/features/progresses/storage'
import { ConfirmDialog } from './ConfirmDialog'
import { ModeToggle } from './ModeToggle'

export function ReadingManager() {
  const books = getBooksFromStorage()
  const bookProgresses = getBookProgressesFromStorage()
  const [confirmDialog, setConfirmDialog] = useState<
    ComponentProps<typeof ConfirmDialog>
  >({
    isOpen: false,
    onConfirm: () => {},
    onClose: () => {},
    title: '',
    description: '',
  })

  const handleOpenConfirmDialog = useCallback<
    ComponentProps<typeof BookTable>['openConfirm']
  >(({ onCancel, onSubmit, ...params }) => {
    setConfirmDialog({
      ...params,
      isOpen: true,
      onConfirm: () => {
        onSubmit()
        setConfirmDialog((confirmDialog) => ({
          ...confirmDialog,
          isOpen: false,
        }))
      },
      onClose: () => {
        onCancel?.()
        setConfirmDialog((confirmDialog) => ({
          ...confirmDialog,
          isOpen: false,
        }))
      },
    })
  }, [])

  return (
    <div className="container mx-auto p-4">
      <div className="flex justify-between">
        <h1 className="text-2xl font-bold mb-4">
          <a href="/">Read Trak</a>
        </h1>
        <ModeToggle />
      </div>
      <BookTable
        initialBooks={books}
        initialBookProgresses={bookProgresses}
        openConfirm={handleOpenConfirmDialog}
      />

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
