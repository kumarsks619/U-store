import React, { useEffect } from 'react'
import { useSelector, useDispatch } from 'react-redux'
import { MegaphoneIcon, XIcon } from '@primer/octicons-react'

import ButtonComp from '../../../../utils/ButtonComp'
import FormLoader from '../../../../utils/FormLoader'
import { bidPriceUpdate, bidPlace } from '../../../../../store/actions/bid'
import { alertAdd } from '../../../../../store/actions/alert'
import './BidEditInput.css'

const BidEditInput = ({
    isOpen,
    setIsOpen,
    bidVal,
    setBidVal,
    product,
    bidID,
    isNew = false,
}) => {
    const dispatch = useDispatch()

    const { loading: loadingBidEdit, success: successBidEdit } = useSelector(
        (state) => state.bidPriceUpdate
    )
    const { loading: loadingBidPlace, success: successBidPlace } = useSelector(
        (state) => state.bidPlace
    )

    // function to edit an existing bid
    const handleBidEdit = () => {
        if (Number(bidVal) < 0 || bidVal === '') {
            dispatch(alertAdd('Place a suitable bid!', 'error'))
        } else {
            dispatch(bidPriceUpdate(product._id, bidID, Number(bidVal)))
        }
    }

    // to close the input after bid is edited successfully
    useEffect(() => {
        if (successBidEdit) {
            setIsOpen(false)
        }
    }, [successBidEdit, setIsOpen])

    // function to place a new bid
    const handleBidPlace = () => {
        if (Number(bidVal) >= 0 && bidVal !== '') {
            dispatch(bidPlace(product, Number(bidVal)))
        } else {
            dispatch(alertAdd('Raise a suitable amount!', 'error'))
        }
    }

    // to close the input after a new bid is placed successfully
    useEffect(() => {
        if (successBidPlace) {
            setIsOpen(false)
        }
    }, [successBidPlace, setIsOpen])

    return (
        <div className={isOpen ? 'bidEditInput open' : 'bidEditInput'}>
            <div className="bidEditInput__wrapper">
                <MegaphoneIcon size={20} />
                <input
                    type="number"
                    placeholder={isNew ? 'Place new bid' : 'Adjust your bid'}
                    value={bidVal}
                    onChange={(e) => setBidVal(e.target.value)}
                />
                <ButtonComp
                    typeClass={'primary'}
                    handleOnClick={isNew ? handleBidPlace : handleBidEdit}
                    modifyClass={'insideInputButton'}
                    text={isNew ? 'Place' : 'Update'}
                />
            </div>
            <ButtonComp
                typeClass={'secondary'}
                handleOnClick={() => setIsOpen(false)}
                modifyClass={'iconButton'}
            >
                <XIcon size={18} />
            </ButtonComp>

            <FormLoader
                loading={loadingBidEdit || loadingBidPlace}
                modifyClass={'bidEditLoader'}
                loaderSizeClass={'small'}
            />
        </div>
    )
}

export default BidEditInput
