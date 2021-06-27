const asyncHandler = require('express-async-handler')

const Bid = require('../models/Bid')
const User = require('../models/User')
const Product = require('../models/Product')
const validateBidInputs = require('../validators/bid')
const { sendNotification } = require('../utils/notification')

// to place a bid on a product
const bidPlace = asyncHandler(async (req, res) => {
    const { price } = req.body
    const product = req.params.productID
    const bidOwner = req.authUser._id

    const { isValid, message } = validateBidInputs(req.body)
    if (!isValid) {
        res.status(400)
        throw new Error(message)
    }

    // checking if the User placing Bid is NOT the owner of the Product.
    const foundProduct = await Product.findById(product)
        .select('productOwner bids isActive')
        .populate('bids')

    // checking if the product is NOT deleted
    if (!foundProduct.isActive) {
        res.status(500)
        throw new Error('Sorry, the product you are trying to bid is deleted!')
    }

    // checking if the user is NOT the owner of the product
    if (String(foundProduct.productOwner) === String(bidOwner)) {
        res.status(401)
        throw new Error('Sorry, you cannot place a bid on your own product!')
    }

    // checking if the User has already placed a Bid on the Product or NOT, if already placed then the
    // Bid's status of the last Bid must be "PENDING", only then new Bid can be placed.
    foundProduct.bids.forEach((bid) => {
        if (String(bid.bidOwner) === String(bidOwner) && bid.status === 'PENDING') {
            res.status(401)
            throw new Error(
                'Your previous bid on this product is still PENDING! Wait for the owner to respond or delete this bid and place a new one.'
            )
        }
    })

    const newBid = await Bid.create({
        price,
        product,
        bidOwner,
    })

    if (newBid) {
        // pushing the new bidID to the bidOwner's bids array
        await User.updateOne(
            { _id: req.authUser._id },
            {
                $push: {
                    bids: {
                        $each: [newBid._id],
                        $position: 0,
                    },
                },
            }
        )

        // pushing the new bidID to the Product's bids array
        await Product.updateOne(
            { _id: product },
            {
                $push: {
                    bids: {
                        $each: [newBid._id],
                        $position: 0,
                    },
                },
            }
        )

        // removing productID from following, if it is present there
        await User.updateOne({ _id: bidOwner }, { $pull: { following: product } })

        // subscribe the product and send notifications to this product group
        sendNotification(product, {
            name: 'Batook Bubble',
            firstDate: '14 Jun',
            kids: '1',
        })

        res.status(200).json(newBid)
    } else {
        res.status(400)
        throw new Error('Bid details might be invalid!')
    }
})

// to delete a bid
const bidDelete = asyncHandler(async (req, res) => {
    const bidID = req.params.bidID

    const foundBid = await Bid.findById(bidID).populate('product')

    if (foundBid) {
        // checking if the logged in user is the owner of the Bid being deleted
        if (String(foundBid.bidOwner) !== String(req.authUser._id)) {
            res.status(401)
            throw new Error('You are authorized to delete your bids only!')
        }

        // only PENDING bids and bids on deleted products can be deleted
        if (foundBid.status !== 'PENDING' && foundBid.product.isActive) {
            res.status(403)
            throw new Error("Responded bids can't be deleted!")
        }

        // removing the deleted Bid's ID from the bidOwner's bids array
        await User.updateOne({ _id: req.authUser._id }, { $pull: { bids: bidID } })

        // removing the deleted Bid's ID from the Product's bids array
        await Product.updateOne({ _id: foundBid.product }, { $pull: { bids: bidID } })

        await foundBid.remove()
        res.status(200).json({
            message: 'Bid Deleted!',
        })
    } else {
        res.status(404)
        throw new Error('The bid you are trying to delete was not found!')
    }
})

// to update a bid status by the product owner
const bidStatusUpdate = asyncHandler(async (req, res) => {
    const { newBidStatus } = req.body
    const bidID = req.params.bidID

    if (!newBidStatus) {
        res.status(400)
        throw new Error('At least new bid status must be provided to update it!')
    }

    const { isValid, message } = validateBidInputs(req.body, true)
    if (!isValid) {
        res.status(400)
        throw new Error(message)
    }

    const foundBid = await Bid.findById(bidID).populate('product')

    if (foundBid) {
        // checking if the logged in user is the Product owner
        if (String(foundBid.product.productOwner) !== String(req.authUser._id)) {
            res.status(401)
            throw new Error('You can only respond to bids placed on your products!')
        }

        const updatedBid = await Bid.findOneAndUpdate(
            { _id: bidID },
            { $set: { status: newBidStatus } },
            { new: true }
        )

        if (updatedBid) {
            res.status(200).json({ message: 'Bid Status Updated!' })
        } else {
            res.status(500)
            throw new Error(
                "The bid you responded can't be updated at the moment! Try again."
            )
        }
    } else {
        res.status(404)
        throw new Error("The bid you responded can't be found!")
    }
})

// to edit a bid price by the bid owner
const bidPriceEdit = asyncHandler(async (req, res) => {
    const { price: newBidPrice } = req.body
    const bidID = req.params.bidID

    if (!newBidPrice && Number(newBidPrice) !== 0) {
        res.status(400)
        throw new Error('At least new bid price must be provided to update it!')
    }

    const { isValid, message } = validateBidInputs(req.body, true)
    if (!isValid) {
        res.status(400)
        throw new Error(message)
    }

    const foundBid = await Bid.findById(bidID)

    if (foundBid) {
        // checking if the logged in user is the Bid owner
        if (String(foundBid.bidOwner) !== String(req.authUser._id)) {
            res.status(401)
            throw new Error('You can only edit bids placed by you!')
        }

        // checking if the bid status is still "PENDING"
        if (foundBid.status !== 'PENDING') {
            res.status(400)
            throw new Error(`Place new bid, this has already been ${foundBid.status}!`)
        }

        const updatedBid = await Bid.findOneAndUpdate(
            { _id: bidID },
            { $set: { price: newBidPrice } },
            { new: true }
        )

        if (updatedBid) {
            res.status(200).json({ message: 'Bid Price Updated!' })
        } else {
            res.status(500)
            throw new Error("The bid you can't be edited at the moment! Try again.")
        }
    } else {
        res.status(404)
        throw new Error("The bid you want to edit, can't be found!")
    }
})

module.exports = {
    bidPlace,
    bidDelete,
    bidStatusUpdate,
    bidPriceEdit,
}
