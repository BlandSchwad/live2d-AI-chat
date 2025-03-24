import { Link } from "react-router"

export default function Header({options} : {options: string[]}) {
    return (

        <div id='header' className="flex flex-row h-12 items-center justify-evenly">
            {options.map((option, index)=> {
                return (
                    <Link key={`header-${option}`} to={`/${option}`}>{option} </Link>
                    // <div key={`header-${option}`}>{option}</div>
                )
            })}

        </div>
    )
}