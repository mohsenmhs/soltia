// Creates a props object with overridden toString function. toString returns an attributes
// string in the format: `key1="value1" key2="value2"` for easy use in an HTML string.
class Props {
  constructor(index, selectedIndex, baseClass) {
    this.id = `${baseClass}-result-${index}`
    this.class = `${baseClass}-result`
    this['data-result-index'] = index
    this.role = 'option'
    if (index === selectedIndex) {
      this['aria-selected'] = 'true'
    }
  }

  toString() {
    return Object.keys(this).reduce(
      (str, key) => `${str} ${key}="${this[key]}"`,
      ''
    )
  }
}

class Autocomplete {
  value = ''
  searchCounter = 0
  results = []
  selectedIndex = -1
  baseClass = 'autocomplete'
  position = "below"
  idCounter = 0
  expanded = false

  constructor(
    root,
    search,
    getResultValue,
    onSubmit,
    searchDelay
  ) {
    this.search = search
    this.getResultValue = getResultValue;
    this.onSubmit = onSubmit;
    this.root = document.getElementById(root);
    this.input = this.root.querySelector('input');
    this.resultList = this.root.querySelector('ul');
    this.searchDelay = searchDelay | 500
    this.initialize()

  }

  // Set up aria attributes and events
  initialize = () => {

    this.input.setAttribute('role', 'combobox')
    this.input.setAttribute('aria-expanded', 'false')

    this.resultList.setAttribute('role', 'listbox')
    this.resultList.style.position = 'absolute'
    this.resultList.style.zIndex = '1'
    this.resultList.style.width = '100%'
    this.resultList.style.boxSizing = 'border-box'

    // Generate ID for results list if it doesn't have one
    if (!this.resultList.id) {
      this.resultList.id = `${this.baseClass}-result-list-${++this.idCounter}`
    }
    this.input.setAttribute('aria-owns', this.resultList.id)


    this.input.addEventListener('input', this.handleInput)
    this.input.addEventListener('keydown', this.handleKeyDown)
    this.input.addEventListener('focus', this.handleFocus)
    this.input.addEventListener('blur', this.handleBlur)
    this.resultList.addEventListener(
      'mousedown',
      this.handleResultMouseDown
    )
    this.resultList.addEventListener('click', this.handleResultClick)

    const queryClear = document.createElement('button')
    queryClear.classList.add("query-clear")
    queryClear.classList.add("delete-button")
    queryClear.classList.add("transparent-button")
    queryClear.addEventListener('click', () => {
      this.hideResults()
      this.setValue()
      this.updateStyle()
    })
    this.root.insertAdjacentElement('beforeend', queryClear)

    this.updateStyle()
  }


  handleInput = event => {
    clearTimeout(this.searchDelayTimeout)

    this.handleLoading()
    const { value } = event.target
    this.value = value
    this.searchDelayTimeout = setTimeout(() => { this.updateResults(this.value) }, this.searchDelay)

  }

  handleKeyDown = event => {
    const { key } = event

    switch (key) {
      case 'Up': // IE/Edge
      case 'Down': // IE/Edge
      case 'ArrowUp':
      case 'ArrowDown': {
        const selectedIndex =
          key === 'ArrowUp' || key === 'Up'
            ? this.selectedIndex - 1
            : this.selectedIndex + 1
        event.preventDefault()
        this.handleArrows(selectedIndex)
        break
      }
      case 'Tab': {
        this.selectResult()
        break
      }
      case 'Enter': {
        const selectedResult = this.results[this.selectedIndex]
        this.selectResult()
        this.onSubmit(selectedResult)
        break
      }
      case 'Esc': // IE/Edge
      case 'Escape': {
        this.hideResults()
        this.setValue()
        break
      }
      default:
        return
    }
  }

  handleFocus = event => {
    ///Handle focus
    if(this.results.length === 0)
      this.handleInput(event)
  }

  handleBlur = () => {
    ///Handle blur
    console.log('handleBlur')

  }

  // The mousedown event fires before the blur event. Calling preventDefault() when
  // the results list is clicked will prevent it from taking focus, firing the
  // blur event on the input element, and closing the results list before click fires.
  handleResultMouseDown = event => {
    event.preventDefault()
  }

  handleResultClick = event => {
    const { target } = event
    const result = target.closest('[data-result-index]')
    if (result) {
      this.selectedIndex = parseInt(result.dataset.resultIndex, 10)
      const selectedResult = this.results[this.selectedIndex]
      this.selectResult()
      this.onSubmit(selectedResult)
    }
  }

  handleArrows = selectedIndex => {
    // Loop selectedIndex back to first or last result if out of bounds
    const resultsCount = this.results.length
    this.selectedIndex =
      ((selectedIndex % resultsCount) + resultsCount) % resultsCount

    // Update results and aria attributes
    this.handleUpdate(this.results, this.selectedIndex)
  }

  selectResult = () => {
    const selectedResult = this.results[this.selectedIndex]
    if (selectedResult) {
      this.setValue(selectedResult)
    }
    this.hideResults()
  }

  updateResults = value => {
    const currentSearch = ++this.searchCounter
    this.handleLoading()
    this.search(value).then(results => {
      if (currentSearch !== this.searchCounter) {
        return
      }
      this.results = results
      this.handleLoaded()

      if (this.results.length === 0) {
        this.hideResults()
        return
      }

      this.selectedIndex = this.autoSelect ? 0 : -1
      this.handleUpdate(this.results, this.selectedIndex)
      this.showResults()
    })
  }

  showResults = () => {
    this.setAttribute('aria-expanded', true)
    this.handleShow()
  }

  hideResults = () => {
    this.selectedIndex = -1
    this.results = []
    this.setAttribute('aria-expanded', false)
    this.setAttribute('aria-activedescendant', '')
    this.handleUpdate(this.results, this.selectedIndex)
    this.handleHide()
  }

  // Make sure selected result isn't scrolled out of view
  checkSelectedResultVisible = resultsElement => {

    const selectedResultElement = resultsElement.querySelector(
      `[data-result-index="${this.selectedIndex}"]`
    )
    if (!selectedResultElement) {
      return
    }

    const resultsPosition = resultsElement.getBoundingClientRect()
    const selectedPosition = selectedResultElement.getBoundingClientRect()

    if (selectedPosition.top < resultsPosition.top) {
      // Element is above viewable area
      resultsElement.scrollTop -= resultsPosition.top - selectedPosition.top
    } else if (selectedPosition.bottom > resultsPosition.bottom) {
      // Element is below viewable area
      resultsElement.scrollTop +=
        selectedPosition.bottom - resultsPosition.bottom
    }
  }


  destroy = () => {
    this.search = null

    this.onSubmit = null

    this.root = null
    this.input = null
    this.resultList = null
    this.getResultValue = null
  }

  setAttribute = (attribute, value) => {
    this.input.setAttribute(attribute, value)
  }

  setValue = result => {
    this.input.value = result ? this.getResultValue(result) : ''
  }

  renderResult = (result, props) => {
    const tempResult = this.getResultValue(result).toLowerCase()
    return `<li ${props}>${tempResult.replaceAll(this.value.toLowerCase(), `<span>${this.value}</span>`)}</li>`
  }

  handleUpdate = (results, selectedIndex) => {
    this.resultList.innerHTML = ''
    results.forEach((result, index) => {
      const props = new Props(index, selectedIndex, this.baseClass)
      const resultHTML = this.renderResult(result, props)
      if (typeof resultHTML === 'string') {
        this.resultList.insertAdjacentHTML('beforeend', resultHTML)
      } else {
        this.resultList.insertAdjacentElement('beforeend', resultHTML)
      }
    })

    this.input.setAttribute(
      'aria-activedescendant',
      selectedIndex > -1 ? `${this.baseClass}-result-${selectedIndex}` : ''
    )

    if (this.resetPosition) {
      this.resetPosition = false
      this.updateStyle()
    }
    this.checkSelectedResultVisible(this.resultList)
  }

  handleShow = () => {
    this.expanded = true
    this.updateStyle()
  }

  handleHide = () => {
    this.expanded = false
    this.resetPosition = true
    this.updateStyle()
  }

  handleLoading = () => {
    this.loading = true
    this.updateStyle()
  }

  handleLoaded = () => {
    this.loading = false
    this.updateStyle()
  }


  updateStyle = () => {
    this.root.dataset.expanded = this.expanded
    this.root.dataset.loading = this.loading
    this.root.dataset.position = this.position
    this.root.dataset.value = this.value ? '' : 'empty'

    this.resultList.style.visibility = this.expanded ? 'visible' : 'hidden'
    this.resultList.style.pointerEvents = this.expanded ? 'auto' : 'none'
    if (this.position === 'below') {
      this.resultList.style.bottom = null
      this.resultList.style.top = '100%'
    } else {
      this.resultList.style.top = null
      this.resultList.style.bottom = '100%'
    }
  }
}

export default Autocomplete
