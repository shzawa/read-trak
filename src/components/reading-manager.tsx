'use client'

import type React from 'react'
import { ComponentProps, useCallback, useState } from 'react'
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
import { BookTable } from '@/features/books/components/BookTable'

// { id: string, ... }[]
// const BOOKS_STORAGE_KEY = 'Books'

// TODO: 共通化
// {[bookId: string]: { id: string, ... }[]}
// const BOOK_PROGRESSES_STORAGE_KEY = 'BookProgresses'

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

export function ReadingManager() {
  const [confirmDialog, setConfirmDialog] = useState({
    isOpen: false,
    onConfirm: () => {},
    onClose: () => {},
    title: '',
    description: '',
  })

  const handleOpenConfirmDialog = useCallback<
    ComponentProps<typeof BookTable>['openConfirm']
  >(
    ({ onCancel, onSubmit, ...params }) => {
      setConfirmDialog({
        ...params,
        isOpen: true,
        onConfirm: () => {
          onSubmit()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        },
        onClose: () => {
          onCancel?.()
          setConfirmDialog({ ...confirmDialog, isOpen: false })
        },
      })
    },
    [confirmDialog]
  )

  return (
    <div className="container mx-auto p-4">
      <BookTable
        initialBooks={[]}
        initialBookProgresses={{}}
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
