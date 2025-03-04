/**
 * MIT License
 *
 * Copyright (c) 2019 Xu Liangzhan
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in all
 * copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
 * SOFTWARE.
 *
 */

import { getRowid } from './common'
import { hasClass, getDomNode } from '@opentiny/utils'
import { getActualTarget } from '@opentiny/utils'
import { arrayIndexOf } from '../static'

const ATTR_NAME = 'data-rowid'
const CELL_CLS = '.tiny-grid-cell'
const ROW_CLS = '.tiny-grid-body__row'

export const isPx = (val) => val && /^\d+(px)?$/.test(val)

export const isScale = (val) => val && /^\d+%$/.test(val)

export const updateCellTitle = (event) => {
  const cellEl = event.currentTarget.querySelector(CELL_CLS)
  const content = cellEl.innerText

  if (cellEl.getAttribute('title') !== content) {
    cellEl.setAttribute('title', content)
  }
}

export const rowToVisible = ($table, row) => {
  $table.$nextTick(() => {
    const tableBodyVnode = $table.$refs.tableBody

    if (tableBodyVnode) {
      const gridbodyEl = tableBodyVnode.$el
      const trEl = gridbodyEl.querySelector(`[${ATTR_NAME}="${getRowid($table, row)}"]`)

      // 处理虚拟滚动
      if ($table.scrollYLoad) {
        // 对应行是否在表格视图外
        const isOutOfBody = () => {
          const bodyRect = $table.$el.getBoundingClientRect()
          const trRect = trEl.getBoundingClientRect()
          return trRect.top + trRect.height / 2 > bodyRect.top + bodyRect.height
        }

        if (!trEl || isOutOfBody()) {
          gridbodyEl.scrollTop = ($table.afterFullData.indexOf(row) - 1) * $table.scrollYStore.rowHeight
        }
      } else if (trEl) {
        // 非虚拟滚动且有trEl元素
        const bodyHeight = gridbodyEl.clientHeight
        const bodySrcollTop = gridbodyEl.scrollTop
        const trOffsetTop = trEl.offsetTop + (trEl.offsetParent ? trEl.offsetParent.offsetTop : 0)
        const trHeight = trEl.clientHeight

        if (trOffsetTop < bodySrcollTop || trOffsetTop > bodySrcollTop + bodyHeight) {
          // 如果跨行滚动
          gridbodyEl.scrollTop = trOffsetTop
        } else if (trOffsetTop + trHeight >= bodyHeight + bodySrcollTop) {
          gridbodyEl.scrollTop = bodySrcollTop + trHeight
        }
      }
    }
  })
}

function getFixedLeft($table, from, column, body, offset) {
  let scrollLeft = $table.elemStore['main-body-wrapper'].scrollLeft + offset

  if (!column.fixed) {
    from.fixed === 'left' && (scrollLeft = 0)
    from.fixed === 'right' && (scrollLeft = body.scrollWidth)
  }

  return scrollLeft
}

// 计算水平滚动位置（考虑存在冻结表的情况）
function computeScrollLeft($table, td) {
  const { tableBody } = $table.$refs
  const { visibleColumn } = $table
  const { scrollLeft: bodyLeft, clientWidth: bodyWidth } = tableBody.$el
  // Tiny表格冻结列采用sticky，需遍历计算整体宽度
  let leftWidth = 0
  let rightWidth = 0
  visibleColumn.forEach((column) => {
    if (column.fixed === 'left') {
      leftWidth += column.renderWidth
    } else if (column.fixed === 'right') {
      rightWidth += column.renderWidth
    }
  })
  const tdLeft = td._accumulateRenderWidth || td.offsetLeft + (td.offsetParent ? td.offsetParent.offsetLeft : 0)
  const tdWidth = td._renderWidth || td.clientWidth

  let scrollLeft

  // 列元素在主表体可视区左侧（包括被左冻结表部分遮挡的情况）
  if (tdLeft < bodyLeft + leftWidth) {
    scrollLeft = tdLeft - leftWidth
  } else if (tdLeft + tdWidth > bodyLeft + bodyWidth - rightWidth) {
    // 列元素在主表体可视区右侧（包括被右冻结表部分遮挡的情况）
    scrollLeft = tdLeft + tdWidth - bodyWidth + rightWidth
  } else {
    // 列元素在主表体可视区内
    scrollLeft = bodyLeft
  }

  return scrollLeft
}

function setBodyLeft(body, td, $table, column, move) {
  const { isLeftArrow, isRightArrow, from } = move || {}

  const bodyScollLeft = computeScrollLeft($table, td)
  $table.scrollTo(bodyScollLeft)
  $table.lastScrollLeft = bodyScollLeft
  if (from) {
    const direction = isLeftArrow ? 'left' : isRightArrow ? 'right' : null
    const fixedDom = $table.elemStore[`${direction}-body-list`]
    const mainBody = $table.elemStore['main-body-wrapper']
    const { left, right } = td.getBoundingClientRect()
    let offset = 0

    if (isLeftArrow && fixedDom) {
      const div = fixedDom.querySelector('td.fixed__column')
      const division = div ? div.getBoundingClientRect().left : fixedDom.getBoundingClientRect().right

      division > left && (offset = left - division)
    }

    if (isRightArrow && fixedDom) {
      const div = fixedDom.querySelector('td:not(.fixed__column)') || fixedDom
      const division = div.getBoundingClientRect().left

      division < right && (offset = right - division)
    }

    mainBody.scrollLeft = getFixedLeft($table, from, column, body, offset)
  }
}

export const colToVisible = ($table, column, move) => {
  $table.$nextTick(() => {
    const gridbodyEl = $table.$refs.tableBody.$el
    const tdElem = gridbodyEl.querySelector(`.${column.id}`)

    if (tdElem) {
      setBodyLeft(gridbodyEl, tdElem, $table, column, move)
    } else if ($table.scrollXLoad) {
      // 如果是虚拟渲染跨行滚动
      const visibleColumn = $table.visibleColumn
      let scrollLeft = 0

      for (let index = 0; index < visibleColumn.length; index++) {
        if (visibleColumn[index] === column) {
          break
        }

        scrollLeft += visibleColumn[index].renderWidth
      }

      gridbodyEl.scrollLeft = computeScrollLeft($table, {
        _accumulateRenderWidth: scrollLeft,
        _renderWidth: column.renderWidth
      })
    }
  })
}

export const hasDataTag = (el, value) => {
  // el可能为shadow-root，shadow-root没有getAttribute方法
  if (!el || !value || !el.getAttribute) {
    return false
  }

  return (' ' + el.getAttribute('data-tag') + ' ').includes(' ' + value + ' ')
}

export const getEventTargetNode = (event, container, queryCls) => {
  let targetEl
  let target = getActualTarget(event)

  while (target && target.nodeType && target !== document) {
    if (queryCls && (hasClass(target, queryCls) || hasDataTag(target, queryCls))) {
      targetEl = target
    } else if (target === container) {
      return {
        flag: queryCls ? !!targetEl : true,
        container,
        targetElem: targetEl
      }
    }

    target = target.parentNode
  }

  return { flag: false }
}

function getNodeOffset(el, container, rest) {
  if (el) {
    const htmlEl = document.querySelector('html')
    const bodyEl = document.body
    const parentEl = el.parentNode

    rest.top += el.offsetTop
    rest.left += el.offsetLeft

    if (parentEl && parentEl !== htmlEl && parentEl !== bodyEl) {
      rest.top -= parentEl.scrollTop
      rest.left -= parentEl.scrollLeft
    }

    if (container && (el === container || el.offsetParent === container) ? 0 : el.offsetParent) {
      return getNodeOffset(el.offsetParent, container, rest)
    }
  }

  return rest
}

/**
 * 获取元素相对于 document 的位置
 */
export const getOffsetPos = (el, container) => getNodeOffset(el, container, { left: 0, top: 0 })

export const getAbsolutePos = (el) => {
  const bounding = el.getBoundingClientRect()
  const { scrollTop, scrollLeft } = getDomNode()

  return {
    top: scrollTop + bounding.top,
    left: scrollLeft + bounding.left
  }
}

/**
 * 获取单元格节点索引
 */
export const getCellNodeIndex = (cell) => {
  const trEl = cell.parentNode
  const columnIndex = arrayIndexOf(trEl.children, cell)
  const rowIndex = arrayIndexOf(trEl.parentNode.children, trEl)

  return { columnIndex, rowIndex }
}

/**
 * 获取选中单元格矩阵范围
 */
export const getRowNodes = (trList, cellNode, targetCellNode) => {
  const startColIndex = cellNode.columnIndex
  const startRowIndex = cellNode.rowIndex
  const targetColIndex = targetCellNode.columnIndex
  const targetRowIndex = targetCellNode.rowIndex
  const rows = []

  for (
    let rowIndex = Math.min(startRowIndex, targetRowIndex), rowLen = Math.max(startRowIndex, targetRowIndex);
    rowIndex <= rowLen;
    rowIndex++
  ) {
    const cells = []
    const trEl = trList[rowIndex]

    for (
      let colIndex = Math.min(startColIndex, targetColIndex), colLen = Math.max(startColIndex, targetColIndex);
      colIndex <= colLen;
      colIndex++
    ) {
      cells.push(trEl.children[colIndex])
    }

    rows.push(cells)
  }

  return rows
}

export const getCellIndexs = (cell) => {
  const trEl = cell.parentNode
  const rowid = trEl.getAttribute(ATTR_NAME)
  const columnIndex = [].indexOf.call(trEl.children, cell)
  const rowIndex = [].indexOf.call(trEl.parentNode.children, trEl)

  return { rowid, rowIndex, columnIndex }
}

export const getCell = ($table, { row, column }) =>
  new Promise((resolve) => {
    $table.$nextTick(() => {
      const bodyElem = $table.$refs[`${column.fixed || 'table'}Body`]

      resolve(
        (bodyElem || $table.$refs.tableBody).$el.querySelector(
          `${ROW_CLS}[${ATTR_NAME}="${getRowid($table, row)}"] .${column.id}`
        )
      )
    })
  })

export { getDomNode }
