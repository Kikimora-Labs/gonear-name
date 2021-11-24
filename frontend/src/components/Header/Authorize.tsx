import { Dispatch } from 'react'
import { useToProfile } from 'helpers/routes'
import { 
  Auth,
  UserName,
  LogOut,
} from './layout'
import { 
  INearProps } from 'helpers/near'

const Authorize = ({ near, setNear }: { near: INearProps | null, setNear: Dispatch<INearProps | null> }) => {
  const toProfile = useToProfile()
  
  if (!near) return null;

  const { api, signedIn, signedAccountId } = near
  
  const handleSignIn = async () => {
    api.signIn()
  }

  const handleSignOut = async () => {
    api.signOut()
    setNear({
      ...near,
      signedIn: false, 
      signedAccountId: null
    })
  }

  if (signedIn) {
    return (
      <Auth open={false}>
        <UserName onClick={toProfile}>{signedAccountId}</UserName>
        <LogOut onClick={handleSignOut} />
      </Auth>
    )
  }

  return (
    <Auth open={false}>
      <UserName onClick={handleSignIn}>Sign In</UserName>
    </Auth>
  )

}
export default Authorize

