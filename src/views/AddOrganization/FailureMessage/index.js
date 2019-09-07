import PropTypes from 'prop-types';
import React from 'react';
import Icon from '#rscg/Icon';

import styles from './styles.scss';

const leadSubmitFailureMessage = 'Failed to save the lead';
const defaultErrorMessage = 'Some error occured!';

const FailureMessage = ({ errorDescription }) => (
    <div className={styles.submitFailure}>
        <Icon
            className={styles.icon}
            name="closeCircle"
        />
        <div className={styles.message}>
            { leadSubmitFailureMessage }
        </div>
        <div className={styles.description}>
            { errorDescription }
        </div>
    </div>
);
FailureMessage.propTypes = {
    errorDescription: PropTypes.string,
};
FailureMessage.defaultProps = {
    errorDescription: defaultErrorMessage,
};

export default FailureMessage;
