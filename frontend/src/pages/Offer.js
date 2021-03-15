import React from 'react'

function OfferPage (props) {
    async function offerBid (e) {
        e.preventDefault()
        await props._near.contract.offer({ profile_id: document.getElementById('offer_input').value }, '200000000000000', String(parseInt(0.45 * 1e9)) + '000000000000000')
    }

    return (
        <div class="container my-auto">
            <h1 class="text-center">Offer your account</h1>
            <h2 class="text-center">
                Here you can offer your account to the Market.
                Choose an account to transfer all rewards after claiming your account.
            </h2>

            <form onSubmit={(e) => offerBid(e)}>
                <div className="d-flex align-items-center justify-content-center">
                    <div className="form-group" style={{width:'400px','max-width': '400px', 'margin': '25px'}}>
                        <label htmlFor="exampleInputEmail1">Offer my account in favor of</label>
                        <div className='near-suffix'>
                        <input type="text" className="form-control mt-2" id="offer_input"
                               placeholder="Example: satoshi"/>
                        </div>
                        <small id="emailHelp" className="form-text text-muted">All rewards will be transferred to this account</small>
                        <br/>
                        <button className="btn btn-primary mt-5 w-100">Offer</button>
                    </div>
                </div>
            </form>
        </div>
    )
}

export default OfferPage
