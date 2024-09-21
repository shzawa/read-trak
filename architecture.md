# データ構造を整理する

## データベースだと...

- 本
  - 本ID
  - タイトル
  - 全ページ数
  - 価格
  - 登録日付

- 読書進捗
  - 読書進捗ID
  - 本ID
  - 開始ページ
  - 終了ページ
  - 公開フラグ
  - 登録日付

## フロントだと...

```ts
type Book = {
  id: string
  title: string
  totalPageNumber: number
  price: number
  createdAt: string
}
type Books = {[bookId: string]: Book}

type Progress = {
  id: string
  fromPageNumber: number
  toPageNumber: number
  isEnabled: boolean
  createdAt: string
}
type Progresses = {[bookId: string]: {[progressId: string]: Progress}}
```

### コンポーネントの構成を考える

- ページ進行度、消化価格はFE側で計算できる
  - ページ進行度の計算に必要なもの
    - 全ページ数 - Book
    - 公開中の読書進捗の合計ページ数 - Progress
  - 消化価格の計算に必要なもの
    - 全ページ数 - Book
    - 価格 - Book
    - 公開中の読書進捗の合計ページ数 - Progress

- Bookコンポーネントで必要なパラメータ
  - 本ID: string
  - タイトル: string
  - 価格: number
  - 全ページ数: number
  - ページ進行度 (親で計算): number
  - 消化価格 (親で計算): number

- ProgressRecordコンポーネントで必要なパラメータ
  - 読書進捗ID: string
  - 本ID: string
  - 開始ページ: number
  - 終了ページ: number
  - ページ経過(Progressで計算): number
  - 登録日付: string
  - 公開状態: boolean

Compound Pattern での表現

```tsx
<Book>
  <Book.Header>
    <Book.Title></Book.Title>
    <Book.DeleteButton></Book.DeleteButton>
  </Book.Header>
  <Book.Content>
    <Book.TotalPageCountAndPrice></Book.TotalPageCountAndPrice>
    <BookProgress>
      <BookProgress.Header>
        <BookProgress.TotalProgress></BookProgress.TotalProgress>
        <BookProgress.TotalPricePerProgress></BookProgress.TotalPricePerProgress>
        <CreateForm>
          <CreateForm.FromPageInputField />
          <CreateForm.ToPageInputField />
          <CreateForm.SubmitButton />
        </CreateForm>
      </Progress.Header>
      <BookProgress.Content>
        <BookProgress.Records />
      </BookProgress.Content>
    </Progress>
  </Book.Content>
</Book>
```
### ミューテーション設計

- Page (Books)
  - LocalStorage の管理
  - Books の取得。初回レンダリング時のみ
    - Books
    - Records
  - Books の変更
    - Book の削除
- Records
  - Records の取得。初回レンダリング時のみ
  - Records の変更
    - Record の有効ステータス変更
    - Record の削除

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


# やりたいこと

- データが増えてもパフォーマンスが落ちないUIの構築
- 見通しのよいコンポーネント設計 & 使い回しやすくそれでいて事故が起きにくい型定義設計
  - 命名など細部にこだわりながら、検証しながら
- feature ディレクトリパターンの検証
  - 依存関係を整理しながら
- Compound Pattern の検証
- Record 型のデータ構造の有用性の検証
