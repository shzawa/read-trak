
- <BookTable />: 本の追加・削除で再レンダリングされてほしい
  - <Book />: 本情報の削除・編集で再レンダリングされてほしい
    - <Progresses />: 本情報の編集、読書進捗の追加・編集・削除で再レンダリングされてほしい

- <BookTable />
  - usesState(books)
- <Book />
  - useState(book)
- <Progresses />
  - useState(progresses)

- 初回レンダリング時
  - <BookTable />でlocalStorageから値取得
- 本追加時
  - <BookTable />でlocalStorageの値更新、stateを更新する
- 本削除時
  - <BookTable />でlocalStorageの値更新、stateを更新する
- 本編集時(タイトル、価格)
  - <Book />でlocalStorageの値更新、stateを更新する
- 本編集時(ページ数)
  - <Book />でlocalStorageの値更新、stateを更新する
    - progressesのstateを更新する
- 読書進捗追加時
  - <Progresses />でlocalStorageの値更新、stateを更新する
- 読書進捗削除時
  - <Progresses />でlocalStorageの値更新、stateを更新する
- 読書進捗編集時
  - <Progresses />でlocalStorageの値更新、stateを更新する
