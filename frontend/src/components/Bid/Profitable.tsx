import { ReactNode } from 'react'
import { IBid } from 'helpers/mappers'

const Profitable = ({ bid, balance, children }: { bid: IBid, balance: number, children: ReactNode }) => {

  const isProfitable: boolean = bid && bid.claimPrice && balance > bid.claimPrice ? true : false

  if (!isProfitable) return null

  return (
    <>
      {children}
    </>
  );
}

export default Profitable;