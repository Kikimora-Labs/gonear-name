import {useState, useContext} from 'react'

import {
  Container,
  Title,
  DetailsOne,
  Form,
  HeadOne,
  HeadTwo,
  Helper,
  Button,
  InputContainer,
  Input,
  Link,
  HelperSeed
} from './layout'
import { useTopScroll } from 'helpers/hooks'
import { useParams } from 'react-router-dom'
import useSWRImmutable from 'swr/immutable'
import { BeatLoader } from "react-spinners";
import { NearContext, INearProps, generateSeedPhrase, parseSeedPhrase } from 'helpers/near'

export const Acquire = () => {
  const { bidId } = useParams<{ bidId: string }>();
  const { near }: { near: INearProps | null } = useContext(NearContext)

  const [seedPhrase, setSeedPhrase] = useState<string>(generateSeedPhrase().seedPhrase)
  const [userPublicKey, setUserPublicKey] = useState<string | null>(null)
  const [acquireSuccess, setAcquireSuccess] = useState<boolean>(false)
  const [loadingSeedPhrase, setLoadingSeedPhrase] = useState<boolean>(false)
  useTopScroll()


  const acquireBidSeedPhrase = async () => {
    if (!near) return
    setLoadingSeedPhrase(true)
    const publicKey = parseSeedPhrase(seedPhrase, '').publicKey
    await near.api.acquire(bidId, publicKey)
    setAcquireSuccess(true)
  }


  const acquireBidPublicKey = async () => {
    if (!near || !userPublicKey) return
    setLoadingSeedPhrase(true)
    await near.api.acquire(bidId, userPublicKey)
    setAcquireSuccess(true)
  }

  const { data: profile } = useSWRImmutable(
    ['get_profile', near?.signedAccountId, bidId], 
    () => near?.api.get_profile(near.signedAccountId)
  )
  const isMineAcquisition = profile?.acquisitions.some(id => bidId === id)
  const recoverLink = near ? near.config.walletUrl + '/recover-seed-phrase' : '#'

  if (!isMineAcquisition) return (
    <Container>
      <Form>
        <Title>Acquire {bidId}</Title>
        <DetailsOne>You haven't access to that Acquisition.</DetailsOne>
      </Form>
    </Container>
  )

  if (acquireSuccess) return (
    <Container>
      <Form>
        <Title>Acquire {bidId}</Title>
        <DetailsOne>Contract instruction has been sent.</DetailsOne>
        {userPublicKey ? <></> :
          <>
            <HelperSeed>Seed phrase used:</HelperSeed>
            <InputContainer>
              <Input defaultValue={seedPhrase} readOnly={true} />
            </InputContainer>
            <HelperSeed>Go to <Link href={recoverLink} rel="noreferrer">wallet</Link> and restore your account</HelperSeed>
          </>
        }
      </Form>
    </Container>
  )

  return (
    <Container>
      <Form>
        <Title>Acquire {bidId}</Title>
        <DetailsOne>Do it easy way or like a pro?</DetailsOne>

        <HeadOne>Use a seed phrase</HeadOne>
        <Helper>Save this randomly generated seed phrase or choose your own</Helper>
        <InputContainer>
          <Input value={seedPhrase} onChange={(e: any) => setSeedPhrase(e.target.value)} />
        </InputContainer>
        {loadingSeedPhrase
          ?
          <Button><BeatLoader /></Button>
          :
          <Button onClick={acquireBidSeedPhrase}>Acquire using seed phrase</Button>
        }

        <HeadTwo>or — Transfer your public key</HeadTwo>
        <Helper>Put your base58 public key</Helper>
        <InputContainer>
          <Input value={userPublicKey || ''} onChange={(e: any) => setUserPublicKey(e.target.value)} placeholder="Example: 9bk1tm45X2hBSffmD65pA2vch862jtcz75mkRR7MXNVj" />
        </InputContainer>
        {loadingSeedPhrase 
          ?
          <Button><BeatLoader /></Button>
          : 
          <Button onClick={acquireBidPublicKey}>Acquire using new public key</Button>
        }
        
      </Form>
    </Container>
  )
}
