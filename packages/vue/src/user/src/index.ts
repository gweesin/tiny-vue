import { $props, $prefix, $setup, defineComponent } from '@opentiny/vue-common'
import template from 'virtual-template?pc|mobile-first'

export const $constants = {
  COMPONENT_NAME: { FormItem: 'FormItem' },
  EVENT_NAME: { FormBlur: 'form.blur', FormChange: 'form.change' }
}

export const userProps = {
  ...$props,
  _constants: {
    type: Object,
    default: () => $constants
  },
  tabindex: { type: String, default: '1' },
  modelValue: {
    type: [String, Number],
    required: false
  },
  multiple: {
    type: Boolean,
    default: false
  },
  multipleLimit: {
    type: Number,
    default: 0
  },
  disabled: {
    type: Boolean,
    default: false
  },
  displayOnly: {
    type: Boolean,
    default: false
  },
  valueSplit: {
    type: String,
    default: ','
  },
  textSplit: {
    type: String,
    default: ','
  },
  valueField: {
    type: String,
    default: ''
  },
  textField: {
    type: String,
    default: ''
  },
  cache: {
    type: Boolean,
    default: true
  },
  cacheKey: {
    type: String,
    default: 'tiny-user'
  },
  delay: {
    type: Number,
    default: 600
  },
  suggestLength: {
    type: Number,
    default: 3
  },
  cacheFields: {
    type: Array,
    default: () => []
  },
  collapseTags: {
    type: Boolean,
    default: false
  },
  hoverExpand: {
    type: Boolean,
    default: false
  },
  placeholder: {
    type: String,
    default: ''
  },
  showOverflowTooltip: {
    type: Boolean,
    default: true
  },
  showTooltip: {
    type: Boolean,
    default: true
  },
  sortByFetchData: {
    type: Boolean,
    default: false
  },
  sortable: Function,
  size: String,
  fetchW3Accounts: Function,
  fetchSuggestUser: Function,
  fetchUserByUserId: Function,
  userCache: Object,
  popperClass: String,
  popperAppendToBody: {
    type: Boolean,
    default: true
  },
  tagSelectable: {
    type: Boolean,
    default: false
  },
  copyable: {
    type: Boolean,
    default: false
  },
  batch: {
    type: [Boolean, Number],
    default: 0
  },
  allowCopy: {
    type: Boolean,
    default: false
  },
  noDataText: String,
  loadingText: String,
  autoClose: Boolean,
  queryDebounce: {
    type: Number,
    default: 100
  },
  hideSelected: Boolean,
  ignoreEnter: {
    type: Boolean,
    default: true
  },
  showTips: {
    type: Boolean,
    default: true
  },
  maxWidth: {
    type: [String, Number],
    default: 200
  },
  keepFocus: {
    type: Boolean,
    default: true
  },
  changeCompat: {
    type: Boolean,
    default: false
  },
  multiLineDrag: {
    type: Boolean,
    default: false
  },
  autoSelect: {
    type: Boolean,
    default: true
  },
  dropdownHeight: {
    type: String,
    default: '70%'
  }
}

export default defineComponent({
  name: $prefix + 'User',
  props: userProps,
  setup(props, context) {
    return $setup({ props, context, template })
  }
})
