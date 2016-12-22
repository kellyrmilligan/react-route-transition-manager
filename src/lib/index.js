import React, { Component, PropTypes } from 'react'
import reactRouterFetch from 'react-router-fetch'
import ReactDOM, { unstable_renderSubtreeIntoContainer as renderSubtreeIntoContainer } from 'react-dom'

const FetchingIndicatorWrapper = ({ Indicator, shouldShow, ...rest }) => (
  <div>
    {shouldShow && React.cloneElement(Indicator, { shouldShow, ...rest })}
  </div>
)

export default class TransitionManager extends Component {

  static propTypes = {
    onFetchStart: PropTypes.func,
    onFetchEnd: PropTypes.func,
    onError: PropTypes.func,
    fetchInitial: PropTypes.bool,
    showIndicatorOnInitial: PropTypes.bool,
    FetchingIndicator: PropTypes.element,
    ErrorIndicator: PropTypes.element,
    SplashScreen: PropTypes.element
  }

  state = {
    isAppFetching: false,
    error: false,
    payload: null
  }

  componentWillMount () {
    const { fetchInitial } = this.props
    if (fetchInitial) this.fetchRoutes(this.props)
  }

  componentDidMount () {
    const { fetchInitial, showIndicatorOnInitial } = this.props
    this.node = document.createElement('div')
    document.body.appendChild(this.node)
    if (this.state.isAppFetching && fetchInitial && showIndicatorOnInitial) this.renderLoading(true)
  }

  componentWillReceiveProps (nextProps) {
    const current = `${this.props.location.pathname}${this.props.location.search}`
    const next = `${nextProps.location.pathname}${nextProps.location.search}`
    if (current === next) {
      return
    }
    this.fetchRoutes(nextProps)
    this.renderLoading(true)
  }

  shouldComponentUpdate (nextProps, nextState) {
    return !nextState.isAppFetching
  }

  componentWillUpdate (nextProps, nextState) {
    const { onError } = nextProps
    const { error, payload } = nextState
    if (error && onError) onError(payload)
  }

  componentWillUnmount () {
    if (this.node) {
      ReactDOM.unmountComponentAtNode(this.node)
      document.body.removeChild(this.node)
    }
    this.portal = null
    this.node = null
  }

  renderLoading (shoudShow) {
    const { FetchingIndicator } = this.props
    if (shoudShow) {
      document.body.classList.add('TransitionManager-body-is-fetching')
      if (FetchingIndicator) this.portal = renderSubtreeIntoContainer(this, <FetchingIndicatorWrapper Indicator={FetchingIndicator} shouldShow={shoudShow} {...this.props} />, this.node)
    } else {
      document.body.classList.remove('TransitionManager-body-is-fetching')
      if (FetchingIndicator) this.portal = renderSubtreeIntoContainer(this, <FetchingIndicatorWrapper Indicator={FetchingIndicator} shouldShow={shoudShow} {...this.props} />, this.node)
    }
  }

  fetchRoutes (nextProps) {
    const { onFetchStart, onFetchEnd } = this.props
    if (onFetchStart) onFetchStart()
    this.setState({
      isAppFetching: !this.state.isAppFetching
    }, () => {
      reactRouterFetch({
        components: nextProps.routes.map((route) => route.component),
        params: nextProps.params,
        location: nextProps.location
      }, false)
        .then(() => {
          this.setState({
            isAppFetching: !this.state.isAppFetching
          }, () => {
            this.renderLoading(false)
            if (onFetchEnd) onFetchEnd()
          })
        },
        (err) => {
          this.setState({
            isAppFetching: !this.state.isAppFetching,
            error: true,
            payload: err
          }, () => {
            this.renderLoading(false)
            if (onFetchEnd) onFetchEnd(err)
          })
        })
    })
  }

  render () {
    const { ErrorIndicator, SplashScreen, fetchInitial } = this.props
    const { error, isAppFetching } = this.state

    if (error) {
      return (
        <div>
          {React.cloneElement(ErrorIndicator, {...this.props})}
        </div>
      )
    }
    if (fetchInitial && isAppFetching && SplashScreen) {
      return (
        <div>
          {SplashScreen}
        </div>
      )
    }
    return (
      <div>
        {this.props.children}
      </div>
    )
  }

}
