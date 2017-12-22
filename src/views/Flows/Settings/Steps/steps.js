import React, { Component } from 'react'
import PropTypes from 'prop-types'
import ImmutablePropTypes from 'react-immutable-proptypes'

import autoCancel from 'react-promise-cancel'

import { DragDropContext } from 'react-dnd'
import HTML5Backend from 'react-dnd-html5-backend'

import is from 'util/is'

import { connect } from 'react-redux'
import { bindActionCreators } from 'redux'
import { createSelector } from 'reselect'

import { actions } from 'redux/modules/step'
import { push } from 'react-router-redux'

import Step from './step'
import StartNode from './StartNode'
import EndNode from './EndNode'

import classes from './steps.scss'

const stepsSelector = createSelector(
  (state) => state.get('list'),
  (state) => state.get('data'),
  (list, data) => list.map((id) => data.get(id)).toList()
)

function mapStateToProps (state, props) {
  const { step } = state
  return {
    steps: stepsSelector(step)
  }
}

function mapDispatchToProps (dispatch) {
  return bindActionCreators({
    query: actions.query,
    freed: actions.freed,
    save: actions.update,
    redirect: push,
  }, dispatch)
}

export class FlowSteps extends Component {
  static propTypes = {
    flowId: PropTypes.string.isRequired,
    steps: ImmutablePropTypes.list.isRequired,
    active: PropTypes.oneOfType([PropTypes.string, PropTypes.object]),
    query: PropTypes.func.isRequired,
    save: PropTypes.func.isRequired,
    freed: PropTypes.func.isRequired,
    redirect: PropTypes.func.isRequired,
  }

  state = {
    steps: this.props.steps,
  }

  componentDidMount () {
    const { query, flowId } = this.props
    query(flowId)
  }

  componentWillReceiveProps (nextProps) {
    if (this.props.steps !== nextProps.steps) {
      this.setState({ steps: nextProps.steps })
    }
  }

  componentWillUnmount () {
    const { freed, flowId } = this.props
    freed(flowId)
  }

  handleBeginDrag = (beginIndex) => {
    /**
     * 不需要重新渲染
     */
    this.state.begin = beginIndex
  }

  handleEndDrag = () => {
    const { begin, end } = this.state
    if (begin === end) {
      return
    }
    this.save()
  }

  save () {
    const { save, flowId } = this.props
    const { steps } = this.state
    save(flowId, steps.toJS())
  }

  moveItem = (dragIndex, hoverIndex) => {
    const { steps } = this.state
    const dragItem = steps.get(dragIndex)
    const p = steps.splice(dragIndex, 1).splice(hoverIndex, 0, dragItem)
    /**
     * 使用同步赋值，防止在 endDrag 时还未进行完 setState，
     * 从而导致 steps 获取到的值不正确
     */
    this.state.steps = p
    /**
     * 通知刷新
     */
    this.setState({ end: hoverIndex })
  }

  handleActive = (event, step) => {
    event.stopPropagation()

    const { redirect, flowId } = this.props
    const name = encodeURI(step.get('name'))

    redirect(`/flows/${flowId}/settings/editor/plugin/${name}`)
  }

  render () {
    const { active } = this.props
    const { steps } = this.state
    const isPluginActive = is.string(active)

    // 不写空字符串是为了防止名字刚好没有
    const activeName = isPluginActive ? decodeURI(active) : {}

    return <div className={classes.steps}>
      <StartNode actived={!isPluginActive && !active.path} />
      {steps.map((p, i) => <Step key={p.get('name')} step={p}
        actived={p.get('name') === activeName}
        index={i} move={this.moveItem}
        onActive={this.handleActive}
        beginDrag={this.handleBeginDrag}
        endDrag={this.handleEndDrag} />)}
      <EndNode actived={!isPluginActive && active.path} />
    </div>
  }
}
export default DragDropContext(HTML5Backend)(
  connect(mapStateToProps, mapDispatchToProps)(
    autoCancel({ funcs: ['query'] })(FlowSteps)
  )
)
