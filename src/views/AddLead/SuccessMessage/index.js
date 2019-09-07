import PropTypes from 'prop-types';
import React from 'react';
import Icon from '#rscg/Icon';

import styles from './styles.scss';

const leadSubmitSuccessMessage = 'Lead submitted successfully';
const addEntryButtonTitle = 'Add entry';

const SuccessMessage = ({ targetUrl }) => (
    <div className={styles.submitSuccess}>
        <Icon
            className={styles.icon}
            name="checkmarkCircle"
        />
        <div className={styles.message}>
            { leadSubmitSuccessMessage }
        </div>
        {!!targetUrl && (
            <a
                rel="noopener noreferrer"
                target="_blank"
                className={styles.addEntryLink}
                href={targetUrl}
            >
                { addEntryButtonTitle }
            </a>
        )}
    </div>
);
SuccessMessage.propTypes = {
    targetUrl: PropTypes.string.isRequired,
};
SuccessMessage.defaultProps = {
};

export default SuccessMessage;
