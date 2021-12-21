import {useState, useEffect} from 'react'
import {useLocation, useHistory} from 'react-router-dom'

export interface CheckState {
  isMarket: boolean;
  isOffer: boolean;
  isRules: boolean;
  isProfile: boolean;
}

const checkState: CheckState = {
  isMarket: false,
  isOffer: false,
  isRules: false,
  isProfile: false
}

const market = ['/', '/market']

export const useRouteCheck = (): CheckState => {
  const [check, setCheck] = useState<CheckState>(checkState)
  const location = useLocation()
  
  useEffect(() => {
    const {pathname} = location
    const state: CheckState = {
      isMarket: market.includes(pathname) || pathname.indexOf('/bid') >= 0,
      isOffer: pathname.indexOf('/offer') >= 0,
      isRules: pathname === '/rules',
      isProfile: pathname === '/profile'
    }
    setCheck(state)
  }, [location])
  return check
}

const hideScroll = (open: boolean) =>
  document.body.style.overflowY = open ? 'hidden' : 'auto'

export const useOpen = (): [boolean, (_: boolean) => void] => {
  const [open, setOpen] = useState<boolean>(false)

  useEffect(() => {
    hideScroll(open)
  }, [open])
  return [open, setOpen]
}

export const useToBid = (bidId: string) => {
  const history = useHistory()
  
  return () => {
    history.push(`/bid/${bidId}`)
  }
}

export const useToProfile = (accountId?: string) => {
  const history = useHistory()
  
  return () => {
    if (accountId) {
      history.push(`/profile/${accountId}`)
    } else {
      history.push(`/profile`)
    }
    
  }
}


export const useToAcquire = (bidId: string) => {
  const history = useHistory()

  return () => {
    history.push(`/acquire/${bidId}`)
  }
}

export const useToMarket = () => {
  const history = useHistory()
  
  return () => {
    history.push(`/`)
  }
}
