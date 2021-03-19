import './Landing.scss'
import React from 'react'
import { Image } from 'react-bootstrap'
import BackgroundImage from '../images/lines.png'
import FoundersImage from '../images/founders.svg'
import BelieversImage from '../images/believers.svg'
import ClaimersImage from '../images/claimers.svg'
import { Link } from 'react-router-dom'

function LandingPage (props) {
  var background = { backgroundSize: 'cover', backgroundRepeat: 'no-repeat', position: 'absolute', opacity: 0.4 }
  var image = { width: '64px' }
  return (
    <div
      className='container my-auto'
    >

      <div style={{ margin: '5%' }} />
      <Image
        style={background} responsive fluid
        src={BackgroundImage}
      />
      <div className='container content'>
        <div className='row justify-content-evenly'>
          <div className='col-2' />

          <div className='col-6'>
            <h0>// The easiest way to get a cool account name :)</h0>
            <div style={{ margin: '15%' }} />
          </div>
        </div>
      </div>
      <div className='text-center'>
        <h3>
                           For whom NEAR Accounts Marketplace has been built?
        </h3>
      </div>
      <div style={{ margin: '5%' }} />
      <section class='features-icons text-center det-ails'>
        <div class='container'>
          <div class='row'>
            <div class='col-lg-4'>
              <div class='features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3'>
                <div class='features-icons-icon d-flex  icon-bra-ails'>
                  <i class='icon-screen-desktop m-auto text-primary icon-ails' />
                </div>
                <div className='position-relative py-5'>
                  <div className='top-50 start-50  py-3 px-3 translate-middle' style={{ borderRadius: '50%', position: 'absolute', backgroundColor: '#616E5C' }}>
                    <Image
                      class='position-absolute'
                      responsive fluid
                      src={FoundersImage}
                      style={image}
                    />
                  </div>
                </div>
                <h3 className='py-3'>Founders</h3>
                <h2 className='gray'>Find brilliant account names and place them onto the market for rewards</h2>
              </div>
            </div>
            <div class='col-lg-4'>
              <div class='features-icons-item mx-auto mb-5 mb-lg-0 mb-lg-3'>
                <div class='features-icons-icon d-flex  icon-bra-ails'>
                  <i class='icon-layers m-auto text-primary icon-ails' />
                </div>
                <div className='position-relative py-5'>
                  <div className='top-50 start-50  py-3 px-3 translate-middle' style={{ borderRadius: '50%', position: 'absolute', backgroundColor: '#616E5C' }}>
                    <Image
                      class='position-absolute'
                      responsive fluid
                      src={BelieversImage}
                      style={image}
                    />
                  </div>
                </div>
                <h3 className='py-3'>Believers</h3>
                <h2 className='gray'>Participate in finding fair price, earn for your faithful evaluation and wisdom</h2>
              </div>
            </div>
            <div class='col-lg-4'>
              <div class='features-icons-item mx-auto mb-0 mb-lg-3'>
                <div class='features-icons-icon d-flex  icon-bra-ails'>
                  <i class='icon-check m-auto text-primary icon-ails' />
                </div>
                <div className='position-relative py-5'>
                  <div className='top-50 start-50  py-3 px-3 translate-middle' style={{ borderRadius: '50%', position: 'absolute', backgroundColor: '#616E5C' }}>
                    <Image
                      class='position-absolute'
                      responsive fluid
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
      <div class='container'>
        <div class='row'>
          <div class='col-1' />
          <div class='col-lg-4'>
            <h1 className='pt-3'>// There are two basic operations you can do at the Marketplace </h1>
            <div className='text-center'>
              <Link className='btn btn-lg btn-secondary mt-3' to='/rules'>Dive into rules</Link>
            </div>
          </div>
          <div class='col-lg-6'>
            <div class='row align-items-center my-5'>
              <div class='col-3'>
                <h3>Bet:</h3>
              </div>
              <div class='col py-3'>
                <h5 className='gray'>if you're sure the account name is undervalued and will be claimed later for higher price &mdash; grab up to 50% profit </h5>
              </div>
            </div>
            <div class='row align-items-center'>
              <div class='col-3'>
                <h3>Claim:</h3>
              </div>
              <div class='col py-3'>
                <h5 className='gray'>if you want to obtain the account name for yourself and no one will overbid you in the next 72 hours </h5>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div style={{ margin: '15%' }} />
      <div class='container text-center'>
        <h1>// Interested?</h1>
        <Link className='btn btn-lg btn-success mt-3' to='/market'>Jump to the market!</Link>
      </div>
      <h0 />
    </div>
  )
}

export default LandingPage
