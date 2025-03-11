import { create } from "zustand";
import { persist } from "zustand/middleware";
import { useShallow } from "zustand/shallow";

type AppStore = {
  backendEndpoint: string;
  setBackendEndpoint: (backendEndpoint: string) => void;
  useBackendLLM: boolean;
  setUseBackendLLM: (useBackendLLM: boolean) => void;
  useBackendTTS: boolean;
  setUseBackendTTS: (useBackendTTS: boolean) => void;
  useWebLLM: boolean;
  setUseWebLLM: (useWebLLM: boolean) => void;
  openaiEndpoint: string;
  setOpenaiEndpoint: (openaiEndpoint: string) => void;
  openaiApikey: string;
  setOpenaiApikey: (openaiApikey: string) => void;
  openaiModelName: string;
  setOpenaiModelName: (openaiModelName: string) => void;
};

const useAppStore = create<AppStore>()(
  persist(
    (_set, _get) => ({
      backendEndpoint: "http://localhost:61234",
      setBackendEndpoint: (backendEndpoint: string) => _set({ backendEndpoint }),
      useBackendLLM: false,
      setUseBackendLLM: (useBackendLLM: boolean) => _set({ useBackendLLM }),
      useBackendTTS: false,
      setUseBackendTTS: (useBackendTTS: boolean) => _set({ useBackendTTS }),
      useWebLLM: true,
      setUseWebLLM: (useWebLLM: boolean) => _set({ useWebLLM }),
      openaiEndpoint: "http://localhost:11434/v1",
      setOpenaiEndpoint: (openaiEndpoint: string) => _set({ openaiEndpoint }),
      openaiApikey: "",
      setOpenaiApikey: (openaiApikey: string) => _set({ openaiApikey }),
      openaiModelName: "llama3.1",
      setOpenaiModelName: (openaiModelName: string) => _set({ openaiModelName }),

    }),
    { name: "tts" }
  )
);

type PlayerStore = {
  loading: boolean
  setPlayerLoading:  (setUseLoading: boolean) => void;
  songAudio: HTMLAudioElement[]
  setSongAudio: (setUseSongAudio: HTMLAudioElement[]) => void;


}

const usePlayerStore = create<PlayerStore>()(
  
    (set) => ({
      loading: false,
      setPlayerLoading: (loading: boolean) => set({ loading }),
      songAudio: [],
      setSongAudio: (songAudio: HTMLAudioElement[]) => set({ songAudio }),
    }),
);


export function getPlayerLoading() {
  return usePlayerStore.getState().loading
} 


export function getBackendEndpoint() {
  return useAppStore.getState().backendEndpoint;
}

export const usePlayerLoading = (): [
boolean, (loading: boolean) => void
] => usePlayerStore(
  useShallow((state) => [state.loading, state.setPlayerLoading])
)

export function getSongAudio() {
  return usePlayerStore.getState().songAudio
}

export const useSongAudio = (): [
  HTMLAudioElement[], (songAudio: HTMLAudioElement[]) => void
] => usePlayerStore(
  useShallow((state) => [state.songAudio, state.setSongAudio])
)

export const useBackendEndpoint = (): [
  string,
  (backendEndpoint: string) => void
] =>
  useAppStore(
    useShallow((state) => [state.backendEndpoint, state.setBackendEndpoint])
  );
export const useUseBackendLLM = (): [
  boolean,
  (useBackendLLM: boolean) => void
] =>
  useAppStore(
    useShallow((state) => [state.useBackendLLM, state.setUseBackendLLM])
  );
export const useUseBackendTTS = (): [
  boolean,
  (useBackendTTS: boolean) => void
] =>
  useAppStore(
    useShallow((state) => [state.useBackendTTS, state.setUseBackendTTS])
  );
export const useUseWebLLM = (): [boolean, (useWebLLM: boolean) => void] =>
  useAppStore(useShallow((state) => [state.useWebLLM, state.setUseWebLLM]));
export const useOpenaiEndpoint = (): [
  string,
  (openaiEndpoint: string) => void
] =>
  useAppStore(
    useShallow((state) => [state.openaiEndpoint, state.setOpenaiEndpoint])
  );
export const useOpenaiApikey = (): [string, (openaiApikey: string) => void] =>
  useAppStore(
    useShallow((state) => [state.openaiApikey, state.setOpenaiApikey])
  );
export const useOpenaiModelName = (): [
  string,
  (openaiModelName: string) => void
] =>
  useAppStore(
    useShallow((state) => [state.openaiModelName, state.setOpenaiModelName])
  );

export default useAppStore;
