;(function () {
  var searchData = [
    { name: "Water Bottle", category: "Food and Drink", location: "Library 2nd Floor" },
    { name: "Umbrella", category: "Accessories", location: "Main Entrance" },
    { name: "Laptop", category: "Electronics", location: "Lab 3" },
    { name: "ID Card", category: "Documents", location: "Cafeteria" },
    { name: "Headphones", category: "Electronics", location: "Gym" },
    { name: "Notebook", category: "Books & Stationery", location: "Library 1st Floor" },
    { name: "Keys", category: "Keys", location: "Parking Lot" },
  ]

  var statusTimer = null

  function ready(cb) {
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", cb)
    } else {
      cb()
    }
  }

  function debounce(fn, delay) {
    var id
    return function () {
      var args = arguments
      clearTimeout(id)
      id = setTimeout(function () {
        fn.apply(null, args)
      }, delay)
    }
  }

  function showStatus(message, type) {
    var banner = document.getElementById("form-status")
    if (!banner) return
    banner.textContent = message
    banner.classList.remove("success", "error", "info")
    banner.classList.add(type || "info")
    banner.classList.add("show")
    clearTimeout(statusTimer)
    statusTimer = setTimeout(function () {
      banner.classList.remove("show", "success", "error", "info")
    }, 4500)
  }


  function setupSearch() {
    var input = document.getElementById("top-search")
    var results = document.getElementById("search-results")
    var icon = document.querySelector(".iconamoon-search")
    if (!input || !results) return

    function clearResults() {
      results.innerHTML = ""
      results.classList.remove("active")
    }

    function render(items) {
      results.innerHTML = ""
      if (!items.length) {
        var empty = document.createElement("div")
        empty.className = "search-result-row"
        var label = document.createElement("span")
        label.textContent = "No items found"
        var meta = document.createElement("small")
        meta.textContent = "Try another keyword"
        empty.appendChild(label)
        empty.appendChild(meta)
        results.appendChild(empty)
        results.classList.add("active")
        return
      }

      items.forEach(function (item) {
        var row = document.createElement("div")
        row.className = "search-result-row"
        var name = document.createElement("span")
        name.textContent = item.name
        var meta = document.createElement("small")
        meta.textContent = item.category + " • " + item.location
        row.appendChild(name)
        row.appendChild(meta)
        row.addEventListener("click", function () {
          input.value = item.name
          clearResults()
          showStatus("Loaded past report for " + item.name + ".", "info")
        })
        results.appendChild(row)
      })
      results.classList.add("active")
    }

    function runSearch(query) {
      var term = query.trim().toLowerCase()
      if (!term) {
        clearResults()
        return
      }
      var matches = searchData.filter(function (entry) {
        return (
          entry.name.toLowerCase().indexOf(term) > -1 ||
          entry.category.toLowerCase().indexOf(term) > -1 ||
          entry.location.toLowerCase().indexOf(term) > -1
        )
      })
      render(matches)
    }

    var debounced = debounce(runSearch, 200)

    input.addEventListener("input", function () {
      debounced(input.value)
    })

    input.addEventListener("focus", function () {
      if (input.value) {
        runSearch(input.value)
      }
    })

    input.addEventListener("blur", function () {
      setTimeout(clearResults, 150)
    })

    input.addEventListener("keydown", function (event) {
      if (event.key === "Enter") {
        event.preventDefault()
        runSearch(input.value)
      }
    })

    if (icon) {
      icon.addEventListener("click", function () {
        runSearch(input.value)
      })
    }
  }

  function setupForm() {
    var form = document.getElementById("found-item-form")
    if (!form) return

    var cancelBtn = document.getElementById("cancel-btn")
    var addQuestionBtn = document.getElementById("add-question-btn")
    var questionList = document.getElementById("question-list")
    var uploadZone = document.querySelector(".upload-zone")
    var uploadInput = document.getElementById("item-photo")
    var dateIcon = document.querySelector(".mdi-calendar")
    var contactInput = document.getElementById("contact")

    function updatePlaceholders() {
      Array.from(questionList.children).forEach(function (row, index) {
        var questionField = row.querySelector('input[name="securityQuestion[]"]')
        if (questionField) {
          questionField.placeholder = "Question " + (index + 1)
        }
      })
    }

    function updateRemoveButtons() {
      var buttons = questionList.querySelectorAll(".remove-question")
      buttons.forEach(function (btn, index) {
        if (index === 0) {
          btn.classList.add("hidden")
          btn.disabled = true
        } else {
          btn.classList.remove("hidden")
          btn.disabled = false
        }
      })
    }

    function addQuestionRow() {
      var row = document.createElement("div")
      row.className = "question-row"

      var questionInput = document.createElement("input")
      questionInput.type = "text"
      questionInput.name = "securityQuestion[]"
      questionInput.placeholder = "Question"
      questionInput.autocomplete = "off"

      var answerInput = document.createElement("input")
      answerInput.type = "text"
      answerInput.name = "securityAnswer[]"
      answerInput.placeholder = "Answer"
      answerInput.autocomplete = "off"

      var removeBtn = document.createElement("button")
      removeBtn.type = "button"
      removeBtn.className = "remove-question"
      removeBtn.textContent = "Remove"
      removeBtn.addEventListener("click", function () {
        questionList.removeChild(row)
        updateRemoveButtons()
        updatePlaceholders()
      })

      row.appendChild(questionInput)
      row.appendChild(answerInput)
      row.appendChild(removeBtn)
      questionList.appendChild(row)
      updatePlaceholders()
      updateRemoveButtons()
    }

    function resetQuestions() {
      questionList.innerHTML = ""
      addQuestionRow()
    }

    function attachUploadHandlers() {
      if (!uploadZone || !uploadInput) return
      var text = uploadZone.querySelector(".upload-text")

      function updateLabel() {
        if (!text) return
        if (uploadInput.files && uploadInput.files.length) {
          text.textContent = uploadInput.files[0].name
        } else {
          text.textContent = "Click to upload or drag and drop"
        }
      }

      uploadInput.addEventListener("change", updateLabel)

      ;["dragenter", "dragover"].forEach(function (evt) {
        uploadZone.addEventListener(evt, function (event) {
          event.preventDefault()
          uploadZone.classList.add("dragover")
        })
      })

      ;["dragleave", "drop"].forEach(function (evt) {
        uploadZone.addEventListener(evt, function (event) {
          event.preventDefault()
          uploadZone.classList.remove("dragover")
        })
      })

      uploadZone.addEventListener("drop", function (event) {
        if (!event.dataTransfer || !event.dataTransfer.files.length) return
        if (typeof DataTransfer !== "undefined") {
          var dataTransfer = new DataTransfer()
          Array.from(event.dataTransfer.files).forEach(function (file) {
            dataTransfer.items.add(file)
          })
          uploadInput.files = dataTransfer.files
        } else {
          showStatus("Drag-and-drop upload is not supported in this browser.", "info")
        }
        updateLabel()
      })
    }

    function isValidContact(value) {
      var emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
      var phonePattern = /^\+?[0-9\s().-]{7,}$/
      return emailPattern.test(value) || phonePattern.test(value)
    }

    resetQuestions()
    attachUploadHandlers()

    form.addEventListener("reset", function () {
      if (!uploadZone) return
      var label = uploadZone.querySelector(".upload-text")
      if (label) {
        label.textContent = "Click to upload or drag and drop"
      }
    })

    if (cancelBtn) {
      cancelBtn.addEventListener("click", function () {
        form.reset()
        resetQuestions()
        showStatus("Form cleared.", "info")
      })
    }

    if (addQuestionBtn) {
      addQuestionBtn.addEventListener("click", function () {
        addQuestionRow()
        showStatus("Added another security question.", "info")
      })
    }

    if (dateIcon) {
      dateIcon.addEventListener("click", function () {
        var dateField = document.getElementById("date-found")
        if (dateField) {
          if (typeof dateField.showPicker === "function") {
            dateField.showPicker()
          } else {
            dateField.focus()
          }
        }
      })
    }

    form.addEventListener("submit", function (event) {
      event.preventDefault()
      if (!form.checkValidity()) {
        form.reportValidity()
        showStatus("Please fill in the required fields.", "error")
        return
      }

      if (contactInput && contactInput.value && !isValidContact(contactInput.value.trim())) {
        contactInput.focus()
        showStatus("Enter a valid email or phone number.", "error")
        return
      }

      var formData = new FormData(form)
      var payload = {}
      formData.forEach(function (value, key) {
        if (key === "securityQuestion[]" || key === "securityAnswer[]") return
        payload[key] = value
      })

      var questions = formData.getAll("securityQuestion[]")
      var answers = formData.getAll("securityAnswer[]")
      payload.securityQuestions = []

      questions.forEach(function (question, index) {
        var q = (question || "").trim()
        var a = (answers[index] || "").trim()
        if (q || a) {
          payload.securityQuestions.push({
            question: q,
            answer: a,
          })
        }
      })

      try {
        localStorage.setItem("last-found-item", JSON.stringify(payload))
      } catch (error) {
        console.warn("Unable to store form data locally:", error)
      }

      showStatus("Found item submitted successfully!", "success")
      form.reset()
      resetQuestions()
    })
  }

  ready(function () {
    setupSearch()
    setupForm()
  })
})()
