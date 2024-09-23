import { ReadingManager } from './components/reading-manager'
import { ThemeProvider } from './components/ThemeProvider'

function App() {
  return (
    <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
      <ReadingManager />
    </ThemeProvider>
  )
}

export default App
