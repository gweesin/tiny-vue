/**
 * Copyright (c) 2022 - present TinyVue Authors.
 * Copyright (c) 2022 - present Huawei Cloud Computing Technologies Co., Ltd.
 *
 * Use of this source code is governed by an MIT-style license.
 *
 * THE OPEN SOURCE SOFTWARE IN THIS PRODUCT IS DISTRIBUTED IN THE HOPE THAT IT WILL BE USEFUL,
 * BUT WITHOUT ANY WARRANTY, WITHOUT EVEN THE IMPLIED WARRANTY OF MERCHANTABILITY OR FITNESS FOR
 * A PARTICULAR PURPOSE. SEE THE APPLICABLE LICENSES FOR MORE DETAILS.
 *
 */

import { guid } from '@opentiny/utils'
import type {
  IDropdownState,
  IDropdownApi,
  IDropdownProps,
  IDropdownRenderlessParamUtils,
  ISharedRenderlessParamHooks
} from '@/types'
import {
  watchVisible,
  watchFocusing,
  show,
  hide,
  handleClick,
  handleTriggerKeyDown,
  handleItemKeyDown,
  resetTabindex,
  removeTabindex,
  initAria,
  initEvent,
  handleMenuItemClick,
  handleMainButtonClick,
  triggerElmFocus,
  initDomOperation,
  mounted,
  beforeDistory,
  clickOutside,
  toggleFocus
} from './index'

export const api = ['state', 'handleMainButtonClick', 'hide', 'show', 'initDomOperation', 'handleClick', 'clickOutside']

export const renderless = (
  props: IDropdownProps,
  { reactive, watch, provide, onMounted, computed, onBeforeUnmount }: ISharedRenderlessParamHooks,
  { emit, parent, broadcast, vm, nextTick, mode, designConfig }: IDropdownRenderlessParamUtils
): IDropdownApi => {
  const api = {} as IDropdownApi
  const state: IDropdownState = reactive({
    visible: false,
    timeout: null,
    focusing: false,
    menuItems: [],
    menuItemsArray: [],
    triggerElm: null,
    dropdownElm: null,
    listId: `dropdown-menu-${guid()}`,
    showIcon: props.showIcon,
    showSelfIcon: props.showSelfIcon,
    designConfig,
    trigger: computed(() => {
      return props.trigger || designConfig?.props?.trigger || 'hover'
    }),
    visibleIsBoolean: computed(() => typeof props.visible === 'boolean')
  })

  provide('dropdownVm', vm)

  Object.assign(api, {
    state,
    watchVisible: watchVisible({ broadcast, emit, nextTick }),
    watchFocusing: watchFocusing(parent),
    show: show({ props, state, emit }),
    hide: hide({ api, props, state, emit }),
    mounted: mounted({ api, vm, state, broadcast, props }),
    handleClick: handleClick({ api, props, state, emit }),
    handleTriggerKeyDown: handleTriggerKeyDown({ api, state }),
    handleItemKeyDown: handleItemKeyDown({ api, props, state, emit }),
    resetTabindex: resetTabindex(api),
    removeTabindex: removeTabindex(state),
    initAria: initAria({ state, props }),
    initEvent: initEvent({ api, props, state, vm, mode }),
    handleMenuItemClick: handleMenuItemClick({ props, state, emit }),
    handleMainButtonClick: handleMainButtonClick({ api, emit }),
    triggerElmFocus: triggerElmFocus(state),
    initDomOperation: initDomOperation({ api, state, vm }),
    beforeDistory: beforeDistory({ vm, api, state }),
    clickOutside: clickOutside({ props, api }),
    toggleFocusOnTrue: toggleFocus({ state, value: true }),
    toggleFocusOnFalse: toggleFocus({ state, value: false })
  })

  if (typeof props.visible === 'boolean') {
    watch(() => props.visible, api.watchVisible)
  } else {
    watch(() => state.visible, api.watchVisible)
  }
  watch(() => state.focusing, api.watchFocusing)

  onMounted(api.mounted)
  onBeforeUnmount(api.beforeDistory)

  return api
}
