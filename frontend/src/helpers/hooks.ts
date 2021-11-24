import {useEffect} from 'react'

export const useTopScroll = () => {
  useEffect(() => {
    window.scrollTo(0, 0)
  }, [])
}
