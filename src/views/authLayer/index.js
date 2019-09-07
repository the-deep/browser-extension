import React from 'react';
import { _cs } from '@togglecorp/fujs';

import Message from '#rscv/Message';

import styles from './styles.scss';

const notAuthenticatedMessage = 'You need to log in to the DEEP first';
const loadingMessage = 'Initializing...';

const informationIcon = 'ion-ios-information-outline';
const closeIcon = 'ion-ios-close-outline';

const authLayer = WrappedComponent => (props) => {
    const {
        pending,
        authenticated,
        error,
        ...otherProps
    } = props;

    if (authenticated) {
        return (<WrappedComponent {...otherProps} />);
    }

    const iconClassNames = [styles.icon];

    if (pending) {
        return (
            <Message className={styles.loadingMessage}>
                <div className={styles.message}>
                    { loadingMessage }
                </div>
            </Message>
        );
    }

    if (error !== undefined) {
        iconClassNames.push(closeIcon);
        return (
            <Message className={styles.errorMessage}>
                <div className={_cs(styles.icon, closeIcon)} />
                <div className={styles.message}>
                    { error }
                </div>
            </Message>
        );
    }

    return (
        <Message className={styles.notAuthenticatedMessage}>
            <div className={_cs(styles.icon, informationIcon)} />
            <div className={styles.message}>
                { notAuthenticatedMessage }
            </div>
        </Message>
    );
};
export default authLayer;
