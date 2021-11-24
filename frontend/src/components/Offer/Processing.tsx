import { useContext, useState, useEffect, Dispatch } from 'react'
import { useParams } from 'react-router-dom'
import {
  FullWidthContainer,
  Head,
  HeadOne,
  Red,
  Green
} from './layout'

import { BounceLoader } from "react-spinners";
import { NearContext, INearProps } from 'helpers/near'

const OfferProcessing = () => {
  const { offer, beneficiar } = useParams<{ offer: string, beneficiar: string }>();
  const { near, setNear }: { near: INearProps | null, setNear: Dispatch<INearProps | null> } = useContext(NearContext)
  const [processingStatus, setProcessingStatus] = useState<string>('start')


  const currentUrl = new URL(window.location.href);
  const accessibleAccount = currentUrl.searchParams.get('access')
  const wrongAccount = accessibleAccount && offer !== accessibleAccount

  const makeOffer = async () => {
    if (!near || wrongAccount) return
    try {
      await near.api.deleteAllKeys(offer)
      await near.api.addMarketKeyToAccount(offer)
      await near.api.offer(offer, beneficiar)
      await near.api.createContract(offer)
      await near.api.lockContract(offer)
      await near.api.deleteAllKeys(offer, true)
    } catch (e) {
      console.error(e)
      setProcessingStatus('failed')
      return
    }
    setProcessingStatus('success')
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.delete('access')
    window.history.replaceState({}, document.title, currentUrl.toString())

    if (near.signedAccountId === offer) {
      near.api.signOut()
      setNear({
        ...near,
        signedIn: false,
        signedAccountId: null
      })
    }
  }

  useEffect(() => {
    makeOffer()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [near?.connected])

  if (!near) return null

  let processing = (
    <>
      <div>
        <BounceLoader color="#ffffff" css={`display: block; margin: 0 auto 30px;`} />
      </div>
      <HeadOne>
        Do not refresh or close the page<br />
        It may take up to 5 minutes to complete
      </HeadOne>
    </>
  )


  if (wrongAccount) {
    near.api.deleteKeyFromLocalStorage(offer)
    processing =
      <HeadOne>
        <Red>You try to offer wrong account</Red>
      </HeadOne>
  }

  if (processingStatus === 'failed') {
    processing = 
      <HeadOne>
        <Red>Process has been failed</Red>
      </HeadOne>
  }

  if (processingStatus === 'success') {
    processing = 
      <HeadOne>
        <Green>Process successful finished</Green>
      </HeadOne>
  }

  return (
    <FullWidthContainer>
      <Head>
        Offer processing
      </Head>
      {processing}
    </FullWidthContainer>
  );
}

export default OfferProcessing;