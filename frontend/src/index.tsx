import {StrictMode, FC, useEffect, useState} from 'react'
import {render} from 'react-dom'
import {App} from 'components/App'
import { NearContext, connectNear, INearProps } from 'helpers/near'

const NearApp: FC = () => {
  let [near, setNear] = useState<INearProps | null>(null);

  useEffect(() => {
    async function connect() {
      if (window.location.hash.indexOf('offer-processing') >= 0) {
        const currentUrl = new URL(window.location.href);
        const accountId = currentUrl.searchParams.get('account_id')
        if (accountId) {
          currentUrl.searchParams.delete('public_key');
          currentUrl.searchParams.delete('all_keys');
          currentUrl.searchParams.delete('account_id');
          currentUrl.searchParams.set('access', accountId)
          window.history.replaceState({}, document.title, currentUrl.toString());
        }
      }

      const near: INearProps = await connectNear()
      const accountId = await near.api.get_account_id()
      setNear({
        ...near,
        signedIn: !!accountId,
        signedAccountId: accountId,
      })
    }

    connect();
  }, []);

  return (
    <StrictMode>
      <NearContext.Provider value={{ near, setNear }}>
        <App />
      </NearContext.Provider>
    </StrictMode>
  )
}

render(
  <NearApp />,
  document.getElementById('root')
)
