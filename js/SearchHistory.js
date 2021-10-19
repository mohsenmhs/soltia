class SearchHistory {
    #selectedResultCounter = 0
    #searchHistoryContainer

    constructor(
        searchHistoryContainerId
    ) {
        this.#searchHistoryContainer = document.getElementById(searchHistoryContainerId)
    }

    #handleSearchHistoryItemClearClick = (historyItem) => {
        historyItem.remove()
    }

    pushSearchHistoryNewItem = (result) => {
        const historyNewItem = { title: result, date: new Date(), id: this.#selectedResultCounter++ }
        this.#updateHistoryItems(historyNewItem)
    }

    clearSearchHistory = () => {
        this.#searchHistoryContainer.innerHTML = ''
    }
    #updateHistoryItems = (selectedResult) => {
        const historyItemHTML = this.#renderHistoryItem(selectedResult)
        this.#searchHistoryContainer.insertAdjacentElement('beforeend', historyItemHTML)
    }

    #renderHistoryItem = (selectedResult) => {
        const historyItem = document.createElement('li')
        historyItem.classList.add("history-item")
        historyItem.setAttribute('aria-label', selectedResult.title)

        const historyItemTitle = `<span class="history-item-title">${selectedResult.title}</span>`
        historyItem.insertAdjacentHTML('beforeend', historyItemTitle)

        const historyItemInfo = document.createElement('div')
        historyItemInfo.classList.add("history-item-info")

        const historyItemDate = `<span class="history-item-date">${this.#renderDate(selectedResult.date)}</span>`
        historyItemInfo.insertAdjacentHTML('beforeend', historyItemDate)

        const historyItemClear = document.createElement('button')
        historyItemClear.classList.add("history-item-clear")
        historyItemClear.classList.add("delete-button")
        historyItemClear.classList.add("transparent-button")
        historyItemClear.classList.add("icon-clear-button")
        historyItemClear.setAttribute('aria-label', 'Clear hisory item: ' + selectedResult.title)
        historyItemClear.setAttribute('name', 'Clear hisory item: ' + selectedResult.title)

        historyItemClear.addEventListener('click', () => this.#handleSearchHistoryItemClearClick(historyItem))
        historyItemInfo.insertAdjacentElement('beforeend', historyItemClear)

        historyItem.insertAdjacentElement('beforeend', historyItemInfo)

        return historyItem
    }

    #renderDate = (date) => {
        const YYYY_MM_DD =
            [date.getFullYear(),
            date.getMonth() + 1,
            date.getDate()].join('-')

        let hours = date.getHours()
        const AmPm = hours >= 12 ? 'PM' : 'AM'
        hours = hours > 12 ? hours - 12 : hours
        const HH_MM = [hours, date.getMinutes()].join(':')

        //Convert Date to 'YYYY-MM-DD, HH:MM PM/AM' Format
        return YYYY_MM_DD + ', ' + HH_MM + ' ' + AmPm
    }

    destroy = () => {
        this.#searchHistoryContainer = null
    }
}

export default SearchHistory