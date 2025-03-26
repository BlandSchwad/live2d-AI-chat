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
import LoginButton from "./components/auth/login"
import Profile from './components/auth/profile.tsx'
import { Auth0ProviderWithNavigate } from './components/auth/provideriwthnav.tsx'

const dummyOptions = ['Home', "Chat", 'About', 'Projects', 'Music']

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    
    <BrowserRouter>
    <Auth0ProviderWithNavigate>
    
    <Header options={dummyOptions} />
    <Routes>
      <Route path='/chat' element={<Chat/>}/>
      {/* <Route path={'/home'} element={<App/>}/> */}

      <Route path='/music' element={<Music/>}/>
      <Route path='/' element={<App/>} />
    </Routes>
    
    
    {/* <App /> */}
     
    </Auth0ProviderWithNavigate>
   
    </BrowserRouter>
    

  </StrictMode>,
)
