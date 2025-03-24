import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar"
import { AppSidebar } from "@/components/app-sidebar"
import App from './App.tsx'
import './index.css'
import Header from './components/Header.tsx'
import {BrowserRouter, Routes, Route} from "react-router"
import Chat from './components/Chat.tsx'
import Music from './components/Music.tsx'

const dummyOptions = ['Home', "Chat", 'About', 'Projects', 'Music']
createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>

    
    <Header options={dummyOptions} />
    <Routes>
      <Route path='/chat' element={<Chat/>}/>
      <Route path='/home' element={<App/>}/>
      <Route path='/music' element={<Music/>}/>
    </Routes>


    
    {/* <App /> */}
     
    
    
    </BrowserRouter>
    
  </StrictMode>,
)
