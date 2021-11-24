import { useState, useRef, useContext, FormEvent } from 'react'

import {
  Container,
  Main,
  Title,
  DetailsOne,
  DetailsTwo,
  Form,
  HeadOne,
  HeadTwo,
  Helper,
  Button,
  InputContainer,
  Input,
  InputSuffix
} from './layout'
import { useTopScroll } from 'helpers/hooks'

import { NearContext, INearProps } from 'helpers/near'

const Offer = () => {
  const [offer, setOffer] = useState('')
  const [beneficiar, setBeneficiar] = useState('')
  const form = useRef<HTMLFormElement | null>()
  const beneficiarInput = useRef<HTMLInputElement | null>()


  const { near }: { near: INearProps | null } = useContext(NearContext)

  const submitForm = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!near || !form?.current) return
    if (!form.current.reportValidity()) return

    if (offer === beneficiar) {
      alert('Accounts must be different')
      return
    }

    const balance = await near.api.get_balance(offerAccountId)
    if (!balance) {
      alert('Account not exist - you have to create it first')
      return
    }
    if (balance < 2.03) {
      alert('Not enough balance - should be at least 2 NEAR available (2.05 total usually works)')
      return
    }

    await near.api.addFullAccessKey({
      account_id: offerAccountId,
      successUrl: window.location.origin + `/#/offer-processing/${offerAccountId}/${beneficiarAccountId}`,
      failureUrl: window.location.origin + '/#/offer-failure/'
    })
  }
  useTopScroll()

  if (!near) return null
  const suffix = near.config.accountSuffix
  const offerAccountId = offer + '.' + suffix
  const beneficiarAccountId = beneficiar + '.' + suffix

  return (
    <Container>
      <Main>
        <Title>Offer your <br /> account</Title>
        <DetailsOne>Here you can offer your account to the Market. Choose an account to transfer all rewards after claiming your account.</DetailsOne>
        <DetailsTwo>This is NEAR Account Marketplace. It allows you to sell, bid and buy NEAR Account names.</DetailsTwo>
      </Main>
      <Form ref={form} onSubmit={submitForm}>
        <HeadOne>Account you offer</HeadOne>
        <InputContainer>
          <Input value={offer} onChange={(e: any) => setOffer(e.target.value)} required maxLength={63} pattern={`.*(?<!\\.${suffix})$`} />
          <InputSuffix>.{suffix}</InputSuffix>
        </InputContainer>
        <Helper>All your access keys will be removed</Helper>
        <HeadTwo>Account which takes rewards</HeadTwo>
        <InputContainer>
          <Input value={beneficiar} ref={beneficiarInput} onChange={(e: any) => setBeneficiar(e.target.value)} required maxLength={63} pattern={`.*(?<!\\.${suffix})$`} />
          <InputSuffix>.{suffix}</InputSuffix>
        </InputContainer>
        <Helper>All rewards will be transferred to this account</Helper>
        <Button type="submit">Offer {offer?.length ? offerAccountId : ''}</Button>
      </Form>
    </Container>
  )
}

export default Offer