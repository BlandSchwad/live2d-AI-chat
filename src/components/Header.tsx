import { Link } from "react-router"
import LoginButton from "./auth/login"
import LogoutButton from "./auth/logout"
import { useAuth0 } from "@auth0/auth0-react"
export default function Header({options} : {options: string[]}) {
    const {user, isAuthenticated} = useAuth0()
    return (

        <div id='header' className="flex flex-row h-12 items-center justify-evenly">
            {options.map((option, index)=> {
                return (
                    <Link key={`header-${option}`} to={`/${option}`}>{option} </Link>
                    // <div key={`header-${option}`}>{option}</div>
                    
                )
            })}
            {isAuthenticated ? <LogoutButton/>   : <LoginButton/>}

        </div>
    )
}