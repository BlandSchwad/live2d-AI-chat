import { useEffect, useState } from "react";
import { Live2DModel, InternalModel } from "pixi-live2d-display-lipsyncpatch";
import { Button } from "./ui/button";
import { usePlayerLoading } from "@/models/appstore";


export default function SongList({handleSpeak, model} : {handleSpeak: (audio_link: string, model: Live2DModel) => Promise<void>,  model: Live2DModel<InternalModel> | null}) {
    const [songs, setSongs] = useState([])
    const [loading, setPlayerLoading] = usePlayerLoading();
    useEffect(() => {
        fetch('http://127.0.0.1:61234/api/covers') // Replace with your actual API endpoint
        .then(response => {
          if (!response.ok) {
            throw new Error('Network response was not ok');
          }
          return response.json();
        })
        .then(data => {
          setSongs(data); 
          setPlayerLoading(false);
        })
        .catch(error => {
          console.error('Error fetching the songs:', error);
          setPlayerLoading(false);
        });
    }, [])

    return(
        <>
            {songs[0] && songs.map((song, index) => {
              let title = song['status_message']
              let slashIndex = title.lastIndexOf('\\')
              if(song.output_url != null) {
                return (
                  
                        <div key={`cover-${index}`}> {title.slice(slashIndex + 1 )}
                          <Button 
                          onClick={() => {
                            setPlayerLoading(true)
                            if(song.output_url != 'pending') handleSpeak(`${song.output_url}/vocals.mp3`, model);
                            // handleSpeak()



                          }}>
                            Play</Button>
                            {/* <button onClick={async () => {
                              // handleLoadState(true)
                              handleSpeak(`http://localhost:8000/psql/cover/${song.id}/vocals`, model)
                              }}>Play</button> */}
                        </div>
                )}
            })}
        </>
    )

}