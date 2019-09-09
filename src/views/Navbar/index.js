import PropTypes from 'prop-types';
import React from 'react';
import { _cs } from '@togglecorp/fujs';

import styles from './styles.scss';

const Navbar = ({
    title,
    className,
    rightComponent,
}) => (
    <div className={_cs(className, styles.navbar)}>
        <h2 className={styles.title}>
            { title }
        </h2>
        {rightComponent}
    </div>
);

Navbar.propTypes = {
    title: PropTypes.string.isRequired,
    className: PropTypes.string,
    rightComponent: PropTypes.node,
};

Navbar.defaultProps = {
    className: undefined,
    rightComponent: undefined,
};

export default Navbar;
