import WaveSurfer from 'wavesurfer.js'
import { useRef, useState, useEffect } from 'react'
import {useWavesurfer} from '@wavesurfer/react'
import { useCallback } from 'react'

export default function Player({vocals, backing}) {
    const containerRef = useRef(null)
    const {wavesurfer, isPlaying, currentTime} = useWavesurfer({
        container: containerRef,
        height: 100,
        waveColor: "rgb(200,0,200)",
        progressColor: "rgb(100,0,100)",
        media: vocals
    })

    const onPlayPause = useCallback(() => {
        wavesurfer && wavesurfer.playPause()
    }, [wavesurfer])

    const onTimeUpdate = useCallback(() => {

    })

    return (
        <>
        <div ref={containerRef} />

        </>
    )

}

