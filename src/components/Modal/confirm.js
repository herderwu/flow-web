import React, { Component } from 'react'
import PropTypes from 'prop-types'

import Button from 'components/Button'
import Wrapper, { classes as WrapperClass } from './wrapper'
import classes from './confirm.scss'

const defaultClassName = {
  ...WrapperClass,
  container: {
    ...WrapperClass.container,
    base: `${WrapperClass.container.base} ${classes.confirm}`
  },
  ...classes,
}
export {
  defaultClassName as classes
}

export default class Confirm extends Component {
  static propTypes = {
    title: PropTypes.string.isRequired,

    children: PropTypes.node,
    classNames: PropTypes.object.isRequired,

    onOk: PropTypes.func.isRequired,
    onCancel: PropTypes.func.isRequired,
  }

  static defaultProps = {
    classNames: defaultClassName,
  }

  render () {
    const {
      title, children,
      classNames,
      onOk, onCancel
    } = this.props
    return <Wrapper {...this.props} modal onRequestClose={onCancel}>
      {!!children && <h3 className={classNames.header}>{title}</h3>}
      <div className={classNames.body}>
        {children || title}
      </div>
      <div className={classNames.footer}>
        <Button className='btn-default' onClick={onCancel}>
          Cancel
        </Button>
        <Button className='btn-primary' onClick={onOk}>
          Ok
        </Button>
      </div>
    </Wrapper>
  }
}
