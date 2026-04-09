import React from 'react'
import ReactDOM from 'react-dom/client'
import { MantineProvider, createTheme } from '@mantine/core'
import App from './App.jsx'
import '@mantine/core/styles.css'

const theme = createTheme({
  fontFamily: 'Nunito, sans-serif',
  primaryColor: 'violet', 
  defaultRadius: 'lg',
})

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <MantineProvider theme={theme}>
      <App />
    </MantineProvider>
  </React.StrictMode>,
)