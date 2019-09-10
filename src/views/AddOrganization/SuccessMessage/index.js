import React from 'react';
import Icon from '#rscg/Icon';

import styles from './styles.scss';

const organizationSuccessMessage = 'Organization created successfully';

const SuccessMessage = () => (
    <div className={styles.submitSuccess}>
        <Icon
            className={styles.icon}
            name="checkmarkCircle"
        />
        <div className={styles.message}>
            { organizationSuccessMessage }
        </div>
    </div>
);

export default SuccessMessage;
