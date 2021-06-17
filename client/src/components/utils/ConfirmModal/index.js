import React from 'react'
import { KeyIcon } from '@primer/octicons-react'
import LinearProgress from '@material-ui/core/LinearProgress'

import ModalComp from '../ModalComp'
import ButtonComp from '../ButtonComp'
import './ConfirmModal.css'

const ConfirmModal = ({
    isOpen,
    setIsOpen,
    currentPassword,
    setCurrentPassword,
    handleOnChange,
    handleOnConfirm,
    isLoading,
    isSecure = true,
}) => {
    const handleOnCancel = () => {
        setIsOpen(false)
        if (isSecure) setCurrentPassword('')
    }

    // to submit the form functionality on pressing enter
    const handleOnKeyPress = (e) => {
        if (e.key === 'Enter' && currentPassword) {
            handleOnConfirm()
        }
    }

    return (
        <ModalComp
            isOpen={isOpen}
            handleOnClose={handleOnCancel}
            maxWidth={isSecure ? 'sm' : 'xs'}
            isLoading={isLoading}
        >
            <div className="confirmModal">
                {isLoading && <LinearProgress className="loaderLinear" />}

                <h1>Are you sure?</h1>
                {isSecure ? (
                    <>
                        <p>
                            Enter your current password to proceed. Once confirmed then it
                            can't be reverted. Proceed cautiously!
                        </p>
                        <div className="confirmModal__input">
                            <span className="icon">
                                <KeyIcon size={18} />
                            </span>
                            <input
                                autoFocus
                                required
                                type="password"
                                placeholder="Enter Password"
                                autoComplete="new-password"
                                name="currentPassword"
                                value={currentPassword}
                                onChange={handleOnChange}
                                onKeyPress={handleOnKeyPress}
                            />
                        </div>
                    </>
                ) : (
                    <p style={{ marginBottom: '10px' }}>
                        Once confirmed then it can't be reverted. Proceed cautiously!
                    </p>
                )}

                <div className="confirmModal__buttonsWrapper">
                    {isSecure ? (
                        <ButtonComp
                            typeClass={'primary'}
                            modifyClass={(isLoading || !currentPassword) && 'disabled'}
                            text={'Confirm'}
                            handleOnClick={handleOnConfirm}
                        />
                    ) : (
                        <ButtonComp
                            typeClass={'primary'}
                            modifyClass={isLoading && 'disabled'}
                            text={'Confirm'}
                            handleOnClick={handleOnConfirm}
                        />
                    )}

                    <ButtonComp
                        typeClass={'secondary'}
                        text={'Cancel'}
                        handleOnClick={handleOnCancel}
                    />
                </div>
            </div>
        </ModalComp>
    )
}

export default ConfirmModal
