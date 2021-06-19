import './Landing.scss'

import React from 'react'
import { Image } from 'react-bootstrap'
import { Link } from 'react-router-dom'

import BackgroundImage from '../images/lines.png'
import Croco from '../images/croco.png'
import Croco2 from '../images/croco2.png'
import FoundersImage from '../images/founders.svg'
import BelieversImage from '../images/believers.svg'
import ClaimersImage from '../images/claimers.svg'
import { qq, NEAR } from '../components/Helpers'

function LandingPage (props) {
  var background = { backgroundSize: 'cover', backgroundRepeat: 'no-repeat', position: 'absolute', opacity: 0.4 }
  var backgroundCroco = { opacity: 0.7 }
  var backgroundCroco2 = { backgroundSize: 'cover', backgroundRepeat: 'no-repeat', position: 'absolute', opacity: 0.4, width: '25%', left: '20%', top: '33%' }
  var image = { width: '64px' }
  return (
    <div
      className='container g-0'
    >
      <Image
        style={background} fluid
        src={BackgroundImage}
      />
      <Image
        style={backgroundCroco2} fluid
        src={Croco2}
      />
      <div style={{ margin: '5%' }} />
      <div className='container content'>
        <div className='row justify-content-evenly'>
          <div className='col-2' />

          <div className='col-6'>
            <div className='huge'>{qq} The easiest way to get a cool account name :)</div>
            <div style={{ margin: '15%' }} />
          </div>
        </div>
      </div>
      <div className='text-center'>
        <h6 className='gray'>Non-profitable project for NEAR ecosystem</h6>
        <h3>For whom NEAR Accounts Marketplace has been built?</h3>
      </div>
      <div style={{ margin: '5%' }} />
      <section className='features-icons text-center det-ails'>
        <div className='container'>
          <div className='row'>
            <div className='col-lg-4'>
              <div className='features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3'>
                <div className='position-relative py-5'>
                  <div className='top-50 start-50  py-3 px-3 translate-middle' style={{ borderRadius: '50%', position: 'absolute', backgroundColor: '#616E5C' }}>
                    <Image
                      class='position-absolute'
                      fluid
                      src={FoundersImage}
                      style={image}
                    />
                  </div>
                </div>
                <h3 className='py-3'>Founders</h3>
                <h2 className='gray'>Find brilliant account names and place them onto the market for rewards</h2>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3'>
                <div className='position-relative py-5'>
                  <div className='top-50 start-50  py-3 px-3 translate-middle' style={{ borderRadius: '50%', position: 'absolute', backgroundColor: '#616E5C' }}>
                    <Image
                      class='position-absolute'
                      fluid
                      src={BelieversImage}
                      style={image}
                    />
                  </div>
                </div>
                <h3 className='py-3'>Believers</h3>
                <h2 className='gray'>Participate in finding fair price, earn for your faithful evaluation and wisdom</h2>
              </div>
            </div>
            <div className='col-lg-4'>
              <div className='features-icons-item mx-auto mb-0 mb-lg-3'>
                <div className='position-relative py-5'>
                  <div className='top-50 start-50  py-3 px-3 translate-middle' style={{ borderRadius: '50%', position: 'absolute', backgroundColor: '#616E5C' }}>
                    <Image
                      class='position-absolute'
                      fluid
                      src={ClaimersImage}
                      style={image}
                    />
                  </div>
                </div>
                <h3 className='py-3'>Claimers</h3>
                <h2 className='gray'>Obtain perfect account names for inner usage, personal collection or further resale</h2>
              </div>
            </div>
          </div>
        </div>
      </section>
      <div style={{ margin: '5%' }} />
      <div className='text-center'>
        <h3>{qq} Account<a className='navigate' href='https://explorer.near.org/transactions/384XdCNfpgzSRXTFKGSkBeSf5EPNuc5GJxnaRkE89JCi'><samp className='mx-2'>near.near</samp></a>has been successfully claimed for {NEAR}138</h3>
        <h6 className='gray'>How else the market can surprise us?</h6>
      </div>
      <div style={{ margin: '5%' }} />
      <hr />
      <div className='container'>
        <div className='row'>
          <div className='col-1' />
          <div className='col-lg-4'>
            <h1>{qq} Two basic operations on the account names of the Marketplace </h1>
            <div className='text-center'>
              <Link className='btn btn-lg btn-secondary mt-4' to='/rules'>Dive into rules</Link>
            </div>
          </div>
          <div className='col-lg-6'>
            <div className='row align-items-center my-5'>
              <div className='col-3'>
                <h3>Bet:</h3>
              </div>
              <div className='col py-3'>
                <h5 className='gray'>if you guess the account name is undervalued and will be claimed for higher price &mdash; it brings you up to 50% profit </h5>
              </div>
            </div>
            <div className='row align-items-center'>
              <div className='col-3'>
                <h3>Claim:</h3>
              </div>
              <div className='col py-3'>
                <h5 className='gray'>if you want to obtain the account name for yourself and no one will overbid you in the next 72 hours </h5>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ margin: '5%' }} />
      <hr />
      <div style={{ margin: '5%' }} />
      <section className='features-icons text-center det-ails'>
        <div className='container'>
          <div className='row'>
            <div className='col-lg-6'>
              <div className='features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3'>
                <h3 className='py-3'>Watch live contract review</h3>
                <div className='embed-responsive embed-responsive-16by9'>
                  <iframe className='embed-responsive-item' allow='fullscreen;' src='https://www.youtube.com/embed/6OhkQOab-Is?rel=0' allowfullscreen />
                </div>
              </div>
            </div>
            <div className='col-lg-6'>
              <h3 className='pt-3'>Articles</h3>
              <div className='mb-3'>by 4NTS guild</div>
              <div className='mb-3'>
                <a className='navigate' href='https://medium.com/nearprotocol/a-long-awaited-near-account-marketplace-has-arrived-9dab3ca9db17'><h6>A Long Awaited NEAR Account Marketplace Has Arrived</h6></a>
              </div>
              <div className='mb-3'>
                <a className='navigate' href='https://medium.com/nearprotocol/near-account-marketplace-ama-with-alexander-kouprin-1c52bbf9521d'><h6>NEAR Account Marketplace AMA with Alexander Kouprin</h6></a>
              </div>
              <h3 className='pt-3'>Source code</h3>
              <div className='mb-3'>
                <a className='navigate' href='https://github.com/kouprin/accounts-marketplace'><h6>Available at GitHub</h6></a>
              </div>
            </div>
          </div>
        </div>
      </section>

      <div style={{ margin: '5%' }} />
      <hr />
      <div style={{ margin: '5%' }} />
      <div className='container text-center' style={{ paddingTop: '10vh', paddingBottom: '50vh' }}>
        <h1>{qq} Interested?</h1>
        <div className='row justify-content-evenly align-items-center'>
          <div className='col-1' />
          <div className='col-3 pt-5'>
            <Image
              style={backgroundCroco} fluid
              src={Croco}
            />
            <h5>Gimme that account!</h5>
          </div>
          <div className='col-3 pb-5'>
            <Link className='btn btn-lg btn-success mt-3' to='/bets'>Jump to the market</Link>
          </div>
          <div className='col-1' />
        </div>
      </div>
    </div>
  )
}

export default LandingPage
