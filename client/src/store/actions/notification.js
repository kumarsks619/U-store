import * as actionTypes from '../actionTypes'
import axiosInstance from '../../utils/axiosInstance'
import { handleCache } from '../../utils/handleCache'
import { alertAdd } from './ui'
import * as api from '../../utils/constants/api'

// to batch subscribe/unsubscribe logged in user's concerned topics to get live updates
export const notificationLoginAndLogoutAction =
    (action) => async (dispatch, getState) => {
        const { user } = getState().userLogin

        const topicsArray = [
            ...user.userInfo.products.map((product) =>
                product._id ? product._id : product
            ),
            ...user.userInfo.following.map((product) =>
                product._id ? product._id : product
            ),
            ...user.userInfo.bids.map((bid) => (bid.product ? bid.product : bid._id)),
        ]

        if (topicsArray.length > 0) {
            try {
                dispatch({
                    type: actionTypes.NOTIFICATION_LOGIN_AND_LOGOUT_ACTION_REQUEST,
                })

                await axiosInstance.post(api.NOTIFICATION_LOGIN_AND_LOGOUT_ACTION(action))

                dispatch({
                    type: actionTypes.NOTIFICATION_LOGIN_AND_LOGOUT_ACTION_SUCCESS,
                })
            } catch (err) {
                const errorMsg =
                    err.response && err.response.data.message
                        ? err.response.data.message
                        : err.message

                dispatch({
                    type: actionTypes.NOTIFICATION_LOGIN_AND_LOGOUT_ACTION_FAIL,
                    payload: errorMsg,
                })

                dispatch(alertAdd(errorMsg, 'error'))
            }
        }
    }

// to fetch all the saved notifications of the logged in user from the database
export const notificationGetSaved = () => async (dispatch, getState) => {
    const { lastFetch } = getState().notificationGetSaved

    if (!handleCache(lastFetch)) {
        try {
            dispatch({
                type: actionTypes.NOTIFICATION_GET_SAVED_REQUEST,
            })

            const { data } = await axiosInstance.get(api.NOTIFICATION_GET_SAVED)

            dispatch({
                type: actionTypes.NOTIFICATION_GET_SAVED_SUCCESS,
                payload: data,
            })
        } catch (err) {
            const errorMsg =
                err.response && err.response.data.message
                    ? err.response.data.message
                    : err.message

            dispatch({
                type: actionTypes.NOTIFICATION_GET_SAVED_FAIL,
                payload: errorMsg,
            })

            dispatch(alertAdd(errorMsg, 'error'))
        }
    }
}

// to delete a notification
export const notificationDelete = (notificationID) => async (dispatch) => {
    try {
        dispatch({
            type: actionTypes.NOTIFICATION_DELETE_REQUEST,
        })

        await axiosInstance.delete(api.NOTIFICATION_DELETE(notificationID))

        // TODO: store updates

        dispatch({
            type: actionTypes.NOTIFICATION_DELETE_SUCCESS,
        })
    } catch (err) {
        const errorMsg =
            err.response && err.response.data.message
                ? err.response.data.message
                : err.message

        dispatch({
            type: actionTypes.NOTIFICATION_DELETE_FAIL,
            payload: errorMsg,
        })

        dispatch(alertAdd(errorMsg, 'error'))
    }
}

// to delete a notification
export const notificationUpdateRead = (notificationID) => async (dispatch) => {
    try {
        await axiosInstance.patch(api.NOTIFICATION_READ(notificationID))

        // TODO: store updates
    } catch (err) {
        const errorMsg =
            err.response && err.response.data.message
                ? err.response.data.message
                : err.message

        dispatch(alertAdd(errorMsg, 'error'))
    }
}
