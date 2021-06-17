import React, { useEffect } from 'react'
import { useDispatch, useSelector } from 'react-redux'

import ProductCardBid from '../../../components/Main/ProductCardBid'
import BlockHeader from '../../../components/utils/BlockHeader'
import { userFetchBids } from '../../../store/actions/user'
import Loader from '../../../components/utils/Loader'
import './Bids.css'

const Bids = () => {
    const dispatch = useDispatch()

    const { loading, success } = useSelector((state) => state.userBids)
    const { success: userSuccess, user } = useSelector((state) => state.userLogin)

    useEffect(() => {
        if (userSuccess) dispatch(userFetchBids())
    }, [dispatch, userSuccess])

    return (
        <div className="bids">
            <div className="bids__headerWrapper">
                <BlockHeader title={'My Bids'} />
            </div>
            <div className="bids__bidsWrapper">
                {!loading && success && user && user.userInfo ? (
                    user.userInfo.bids.length === 0 ? (
                        <p>Bid on products and get your requisites.</p>
                    ) : (
                        <>
                            <div className="bids__left">
                                {user.userInfo.bids.map((product, index) =>
                                    index % 2 === 0 ? (
                                        <ProductCardBid
                                            key={product._id}
                                            product={product}
                                        />
                                    ) : null
                                )}
                            </div>
                            <div className="bids__right">
                                {user.userInfo.bids.map((product, index) =>
                                    index % 2 !== 0 ? (
                                        <ProductCardBid
                                            key={product._id}
                                            product={product}
                                        />
                                    ) : null
                                )}
                            </div>
                        </>
                    )
                ) : (
                    <div className="bids__loader">
                        <Loader />
                    </div>
                )}
            </div>
        </div>
    )
}

export default Bids
