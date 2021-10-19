class Autocomplete {
  value = ''
  searchCounter = 0
  results = []
  selectedIndex = -1
  baseClass = 'autocomplete'
  expanded = false

  #DEFAULT_SEARCH_DELAY = 0.5 * 1000 /// 0.5 second delay to trigger call API for search 
  constructor({
    autoCompleteContainerId,
    search,
    getResultValue,
    onSubmit,
    searchDelay
  }
  ) {
    this.search = search
    this.getResultValue = getResultValue;
    this.onSubmit = onSubmit;
    this.autoCompleteContainer = document.getElementById(autoCompleteContainerId);
    this.input = this.autoCompleteContainer.querySelector('input');
    this.resultList = this.autoCompleteContainer.querySelector('ul');
    this.searchDelay = searchDelay || this.#DEFAULT_SEARCH_DELAY
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

    // Generate ID for results list 
    this.resultList.id = `${this.baseClass}-result-list`

    this.input.setAttribute('aria-owns', this.resultList.id)


    this.input.addEventListener('input', this.handleInput)
    this.input.addEventListener('keydown', this.handleKeyDown)
    this.input.addEventListener('focus', this.handleFocus)
    this.resultList.addEventListener('click', this.handleResultClick)

    ///Clear Query button
    const queryClearContainer = document.createElement('div')
    queryClearContainer.classList.add("query-clear-container")

    const queryClear = document.createElement('button')
    queryClear.classList.add("icon-clear-button")
    queryClear.classList.add("query-clear")
    queryClear.classList.add("delete-button")
    queryClear.classList.add("transparent-button")
    queryClear.addEventListener('click', this.handleClearQueryClick)
    queryClearContainer.appendChild(queryClear)
    this.autoCompleteContainer.insertAdjacentElement('beforeend', queryClearContainer)

    this.updateStyle()
  }


  handleInput = event => {
    ////Handle user key down delay. Do not search if the user delay is less than the "searchDelay"
    if (this.searchDelayTimeout) clearTimeout(this.searchDelayTimeout)

    const { value } = event.target
    this.value = value
    this.searchDelayTimeout = setTimeout(() => { this.updateResults(this.value) }, this.searchDelay)

    if (value) this.handleLoading()
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
        const selectedResult = this.results[this.selectedIndex]
        if (selectedResult) {
          this.onSubmit(selectedResult)
          event.preventDefault()
          this.selectResult()
        }
        break
      }
      case 'Enter': {
        const selectedResult = this.results[this.selectedIndex]
        this.selectResult()
        this.onSubmit(selectedResult ? selectedResult : this.value)
        break
      }
      case 'Esc': // IE/Edge
      case 'Escape': {
        this.hideResults()
        this.setValue()
        this.updateStyle()
        break
      }
      default:
        return
    }
  }

  handleFocus = event => {
    ///Handle focus
    if (this.results.length === 0)
      this.handleInput(event)
  }


  handleResultClick = event => {
    const { target } = event
    //A result can be found by finding the clicked element
    const result = target.closest('[data-result-index]')
    if (result) {
      this.selectedIndex = parseInt(result.dataset.resultIndex, 10)
      const selectedResult = this.results[this.selectedIndex]
      this.selectResult()
      this.onSubmit(selectedResult)
    }
  }


  handleClearQueryClick = () => {
    this.hideResults()
    this.setValue()
    this.updateStyle()
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
    this.search(value)
      .then(results => {

        //Handle results race
        if (currentSearch !== this.searchCounter) {
          return
        }
        this.results = results
        this.handleLoaded()

        if (this.results.length === 0) {
          this.hideResults()
          return
        }

        this.selectedIndex = 0
        this.handleUpdate(this.results, this.selectedIndex)
        this.showResults()
      })
      .catch(error => {
        console.error(error)
        ///notifyUserOfError(error) ///Notif User about error
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



  setValue = result => {
    this.input.value = result ? this.getResultValue(result) : ''
    this.value = this.input.value
  }

  handleUpdate = (results, selectedIndex) => {
    this.resultList.innerHTML = ''
    results.forEach((result, index) => {
      const resultHTML = this.renderResult({ result, index, selectedIndex })
      this.resultList.insertAdjacentHTML('beforeend', resultHTML)
    })

    this.input.setAttribute(
      'aria-activedescendant',
      selectedIndex > -1 ? `${this.baseClass}-result-${selectedIndex}` : ''
    )

    this.checkSelectedResultVisible(this.resultList)
  }


  renderResult = ({ result, index, selectedIndex }) => {
    const id = `${this.baseClass}-result-${index}`
    const className = `${this.baseClass}-result`
    const dataResultIndex = index
    const role = 'option'
    const ariaSelected = index === selectedIndex ? 'true' : 'false'
    return `<li id=${id} class=${className} data-result-index=${dataResultIndex} role=${role} aria-selected=${ariaSelected}>${this.boldQuery(this.getResultValue(result), this.value)}</li>`
  }

  boldQuery = (string, query) => {
    const upperCaseString = string.toUpperCase();
    const upperCaseQuery = query.toUpperCase();
    const queryIndex = upperCaseString.indexOf(upperCaseQuery);
    if (!string || queryIndex === -1) {
      return string; // No query found
    }
    const queryLength = query.length;
    return string.substr(0, queryIndex) + '<span>' + string.substr(queryIndex, queryLength) + '</span>' + this.boldQuery(string.substr(queryIndex + queryLength), query);
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

  handleShow = () => {
    this.expanded = true
    this.updateStyle()
  }

  handleHide = () => {
    this.expanded = false
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

  setAttribute = (attribute, value) => {
    this.input.setAttribute(attribute, value)
  }

  updateStyle = () => {
    this.autoCompleteContainer.dataset.expanded = this.expanded
    this.autoCompleteContainer.dataset.loading = this.loading
    this.autoCompleteContainer.dataset.value = this.value ? '' : 'empty'

    this.resultList.style.visibility = this.expanded ? 'visible' : 'hidden'
    this.resultList.style.pointerEvents = this.expanded ? 'auto' : 'none'

    this.resultList.style.top = '100%'

  }


  destroy = () => {
    this.search = null
    this.onSubmit = null
    this.autoCompleteContainer = null
    this.input = null
    this.resultList = null
    this.getResultValue = null
  }
}

export default Autocomplete
