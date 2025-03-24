import { useEffect, useState } from "react";
import {Button} from './ui/button'
async function searchYoutube (input: string) {
    const YOUTUBE_API_KEY = 'AIzaSyDObKQlACPk0IEMViSrwr1Vma_crLcZE_w'
    const url = `https://www.googleapis.com/youtube/v3/search?key=${YOUTUBE_API_KEY}&type=video&part=snippet&q=${input}`;
    let response = await fetch(url)
    let data = await response.json()
    console.log(data)
    return data
  }


  export default function CoverSong() {
    const [searchData, setSearchData] = useState()
    const [input, setInput] = useState('')

    async function handleSubmit(e : event ) {
        e.preventDefault()
        let result = await searchYoutube(input) 
        setSearchData(result)
      }

    function handleInputChage(e: ChangeEvent) { 
        setInput(e.target.value)
    }

    async function handleCoverClick(id : string) {
        console.log(id)
        let response = await fetch('http://localhost:8000/psql/cover/' + id)
        if (response.ok)
            console.log(response.status)
        return
    }
    return (
        <>
         <form onSubmit={handleSubmit}>
            <input value={input} onChange={handleInputChage}/>
            <Button type="submit">Search</Button>
         </form>
         {searchData && (
             <div>
                {searchData.items.map(({id, snippet}) => {
                    
                    return (
                        <>
                            <div key={snippet.title}>
                                <div>
                                    {snippet.title}
                                </div>
                                <img src={snippet.thumbnails.default.url} height={snippet.thumbnails.default.height} width={snippet.thumbnails.default.width}/>    
                                <Button onClick={ async () => {
                                    await handleCoverClick(id.videoId)


                                }}>Cover</Button>
                            </div>
                        </>
                    )
                })}

             </div>

         )}
        
        </>
    )


  }