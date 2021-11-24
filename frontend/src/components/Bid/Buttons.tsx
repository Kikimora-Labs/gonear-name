import { useState, useEffect } from 'react';
import { BetBtn, ClaimBtn, FinalizeBtn } from './BidActions'
import { INearProps } from 'helpers/near'
import { IBid } from 'helpers/mappers'

const Buttons = ({ bidInfo, near }: { bidInfo: IBid, near: INearProps }) => {
  const [nowTime, setNowTime] = useState<number>(Date.now())

  useEffect(() => {
    if (bidInfo.claimedBy && !bidInfo.isOnAcquisition) {
      const interval = setInterval(() => {
        const _now = Date.now()
        setNowTime(_now);
      }, 1000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const secondsToFinalize = bidInfo.claimedTime ? Math.floor((nowTime - bidInfo.claimedTime) / 1000) - near.config.claimPeriod : -1

  if (bidInfo.isOnAcquisition || secondsToFinalize >= 0)
    return (
      <FinalizeBtn bidInfo={bidInfo} near={near} />
    )

  return (
    <>
      <ClaimBtn bidInfo={bidInfo} near={near} nowTime={nowTime} />
      <BetBtn bidInfo={bidInfo} near={near} nowTime={nowTime} />
    </>
  );
}

export default Buttons;