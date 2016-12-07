/* global describe, it, expect */
import React from 'react'
import { shallow } from 'enzyme'
import TransitionManager from '../index'

describe('react-route-transition-manager', () => {
  it('be able to be rendered', () => {
    const wrapper = shallow(<TransitionManager />)
    expect(wrapper.contains(<div />)).toBe(true)
  })
  it('will render children by default', () => {
    const wrapper = shallow(
      <TransitionManager>
        <div className='app' />
      </TransitionManager>
    )
    expect(wrapper.find('.app').length).toBe(1)
  })
})
