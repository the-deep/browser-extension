import PropTypes from 'prop-types';
import React from 'react';

import styles from './styles.scss';

const propTypes = {
    className: PropTypes.string,
    rightComponent: PropTypes.func,
    title: PropTypes.string.isRequired,
};

const defaultProps = {
    className: '',
    rightComponent: undefined,
};

export default class Navbar extends React.Component {
    static propTypes = propTypes;
    static defaultProps = defaultProps;

    getClassName = () => {
        const { className } = this.props;

        const classNames = [
            className,
            styles.navbar,
        ];

        return classNames.join(' ');
    }

    render() {
        const { rightComponent: RightComponent } = this.props;
        const className = this.getClassName();

        return (
            <div className={className}>
                <h1 className={styles.title}>
                    { this.props.title }
                </h1>
                <RightComponent />
            </div>
        );
    }
}
