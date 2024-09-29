import { useCallback, useEffect, useState } from 'react'
import { ReadingManager } from './components/reading-manager'
import { ThemeProvider } from './components/ThemeProvider'
import { Session } from '@supabase/supabase-js'
import { Auth } from '@supabase/auth-ui-react'
import { ThemeSupa } from '@supabase/auth-ui-shared'
import { supabase } from './lib/supabase'

function App() {
  const [session, setSession] = useState<Session | null>(null)

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session)
    })

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session)
    })

    return () => subscription.unsubscribe()
  }, [])

  const handleSignOut = useCallback(async () => {
    await supabase.auth.signOut()
    setSession(null)
  }, [])

  return (
    <Auth.UserContextProvider supabaseClient={supabase}>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        {!session ? (
          <Auth
            supabaseClient={supabase}
            appearance={{ theme: ThemeSupa }}
            providers={['google']}
            onlyThirdPartyProviders
          />
        ) : (
          <>
            <Header onSignOut={handleSignOut} />
            <ReadingManager />
          </>
        )}
      </ThemeProvider>
    </Auth.UserContextProvider>
  )
}

export default App

const Header = ({ onSignOut }: { onSignOut: () => void }) => {
  return (
    <div>
      <button onClick={onSignOut}>Sign Out</button>
    </div>
  )
}
