/**
 * WP Chatbot - Frontend JavaScript
 */
;(($) => {
  // Check if jQuery is loaded
  if (typeof jQuery === "undefined") {
    console.error("jQuery is not loaded. Please ensure jQuery is properly enqueued.")
    return
  }

  // Check if wpChatbotSettings is defined
  if (typeof wpChatbotSettings === "undefined") {
    console.error("wpChatbotSettings is not defined. Please ensure it is properly passed from PHP.")
    return
  }

  // SVG Icons
  const ICONS = {
    SEND: '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>',
    MESSAGE:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 11.5a8.38 8.38 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.38 8.38 0 0 1-3.8-.9L3 21l1.9-5.7a8.38 8.38 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.38 8.38 0 0 1 3.8-.9h.5a8.48 8.48 0 0 1 8 8v.5z"></path></svg>',
    CLOSE:
      '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>',
  }

  // Chatbot Class
  class WPChatbot {
    constructor(options) {
      this.options = options
      this.container = document.getElementById("wp-chatbot-container")
      this.isExpanded = false
      this.isLoading = false
      this.messages = []
      this.isNewUser = true
      this.hasSeenWelcome = false

      this.init()
    }

    init() {
      // Kiểm tra xem người dùng đã truy cập trước đó chưa
      if (localStorage.getItem("wp_chatbot_visited")) {
        this.isNewUser = false
        this.hasSeenWelcome = true
      }

      // Tạo HTML cho chatbot
      this.render()

      // Gắn các sự kiện
      this.attachEvents()

      // Áp dụng màu sắc tùy chỉnh
      this.applyCustomColors()
    }

    render() {
      // Tạo HTML cho chatbot
      const html = `
                <div class="chat-widget">
                    <div class="chat-header">
                        <h3 class="chat-title">Hỗ trợ khách hàng</h3>
                        <button class="close-button" aria-label="Đóng chat">
                            ${ICONS.CLOSE}
                        </button>
                    </div>
                    
                    <div class="messages-area">
                        <div class="messages-list"></div>
                    </div>
                    
                    <div class="input-area">
                        <form class="input-form">
                            <input type="text" class="input-field" placeholder="Nhập câu hỏi của bạn..." />
                            <button type="submit" class="send-button" disabled>
                                ${ICONS.SEND}
                            </button>
                        </form>
                    </div>
                </div>
                
                <button class="chat-button" aria-label="Mở chat hỗ trợ khách hàng">
                    <div class="button-content">
                        <div class="button-icon">${ICONS.MESSAGE}</div>
                        <span class="button-text">CSKH</span>
                    </div>
                </button>
            `

      // Thêm HTML vào container
      this.container.innerHTML = html

      // Lưu các tham chiếu đến các phần tử DOM
      this.chatWidget = this.container.querySelector(".chat-widget")
      this.chatButton = this.container.querySelector(".chat-button")
      this.closeButton = this.container.querySelector(".close-button")
      this.messagesList = this.container.querySelector(".messages-list")
      this.inputForm = this.container.querySelector(".input-form")
      this.inputField = this.container.querySelector(".input-field")
      this.sendButton = this.container.querySelector(".send-button")

      // Thêm badge thông báo cho người dùng mới
      if (this.isNewUser) {
        const badge = document.createElement("div")
        badge.className = "notification-badge"
        badge.textContent = "1"
        this.chatButton.appendChild(badge)
      }
    }

    attachEvents() {
      // Sự kiện mở/đóng chatbot
      this.chatButton.addEventListener("click", () => this.toggleChat())
      this.closeButton.addEventListener("click", () => this.toggleChat())

      // Sự kiện gửi tin nhắn
      this.inputForm.addEventListener("submit", (e) => {
        e.preventDefault()
        this.sendMessage()
      })

      // Sự kiện nhập liệu
      this.inputField.addEventListener("input", () => {
        this.sendButton.disabled = !this.inputField.value.trim()
      })

      // Sự kiện click bên ngoài để đóng chat trên mobile
      document.addEventListener("mousedown", (e) => {
        if (
          this.isExpanded &&
          !this.chatWidget.contains(e.target) &&
          !this.chatButton.contains(e.target) &&
          window.innerWidth < 768
        ) {
          this.toggleChat()
        }
      })
    }

    toggleChat() {
      this.isExpanded = !this.isExpanded

      if (this.isExpanded) {
        this.chatWidget.classList.add("expanded")
        this.chatButton.classList.add("hidden")

        // Focus vào input
        setTimeout(() => {
          this.inputField.focus()
        }, 300)

        // Hiển thị tin nhắn chào mừng cho người dùng mới
        if (this.isNewUser && !this.hasSeenWelcome) {
          localStorage.setItem("wp_chatbot_visited", "true")
          this.isNewUser = false
          this.hasSeenWelcome = true

          // Thêm tin nhắn chào mừng
          this.addMessage({
            id: Date.now().toString(),
            text: this.options.welcome_message,
            sender: "bot",
          })
        }
      } else {
        this.chatWidget.classList.remove("expanded")
        this.chatButton.classList.remove("hidden")
      }
    }

    sendMessage() {
      const text = this.inputField.value.trim()
      if (!text) return

      // Thêm tin nhắn của người dùng
      const userMessage = {
        id: Date.now().toString(),
        text: text,
        sender: "user",
      }

      this.addMessage(userMessage)
      this.inputField.value = ""
      this.sendButton.disabled = true

      // Hiển thị trạng thái đang tải
      this.isLoading = true
      this.showLoadingIndicator()

      // Gửi tin nhắn đến webhook
      this.sendToWebhook(text)
        .then((response) => {
          // Thêm tin nhắn từ bot
          const botMessage = {
            id: (Date.now() + 1).toString(),
            text:
              Array.isArray(response) && response[0]?.output
                ? response[0].output.trim()
                : "Xin lỗi, tôi không thể trả lời câu hỏi này.",
            sender: "bot",
          }

          this.addMessage(botMessage)
        })
        .catch((error) => {
          console.error("Error:", error)

          // Thêm tin nhắn lỗi
          const errorMessage = {
            id: (Date.now() + 1).toString(),
            text: "Xin lỗi, đã xảy ra lỗi khi xử lý yêu cầu của bạn.",
            sender: "bot",
          }

          this.addMessage(errorMessage)
        })
        .finally(() => {
          // Ẩn trạng thái đang tải
          this.isLoading = false
          this.hideLoadingIndicator()
        })
    }

    sendToWebhook(question) {
      return fetch(this.options.webhook_url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ question: question }),
      }).then((response) => {
        if (!response.ok) {
          throw new Error("Network response was not ok")
        }
        return response.json()
      })
    }

    addMessage(message) {
      // Thêm tin nhắn vào mảng
      this.messages.push(message)

      // Tạo phần tử tin nhắn
      const messageEl = document.createElement("div")
      messageEl.className = `message-wrapper ${message.sender === "user" ? "user-message" : "bot-message"}`

      const messageContent = document.createElement("div")
      messageContent.className = `message ${message.sender}`

      const messageText = document.createElement("div")
      messageText.className = "message-content"

      // Xử lý xuống dòng trong tin nhắn
      message.text.split("\n").forEach((line) => {
        const lineEl = document.createElement("span")
        lineEl.className = "message-line"
        lineEl.textContent = line || " "
        messageText.appendChild(lineEl)
      })

      messageContent.appendChild(messageText)
      messageEl.appendChild(messageContent)

      // Thêm vào danh sách tin nhắn
      this.messagesList.appendChild(messageEl)

      // Cuộn xuống dưới cùng
      this.scrollToBottom()

      // Cập nhật badge thông báo
      this.updateNotificationBadge()
    }

    showLoadingIndicator() {
      const loadingEl = document.createElement("div")
      loadingEl.className = "message-wrapper bot-message"
      loadingEl.id = "loading-indicator"

      loadingEl.innerHTML = `
                <div class="message bot">
                    <div class="message-content">
                        <div class="loading-indicator">
                            <span>Đang trả lời</span>
                            <span class="loading-dots">
                                <span class="dot">.</span>
                                <span class="dot">.</span>
                                <span class="dot">.</span>
                            </span>
                        </div>
                    </div>
                </div>
            `

      this.messagesList.appendChild(loadingEl)
      this.scrollToBottom()
    }

    hideLoadingIndicator() {
      const loadingEl = document.getElementById("loading-indicator")
      if (loadingEl) {
        loadingEl.remove()
      }
    }

    scrollToBottom() {
      this.messagesList.scrollTop = this.messagesList.scrollHeight
    }

    updateNotificationBadge() {
      // Xóa badge cũ nếu có
      const oldBadge = this.chatButton.querySelector(".notification-badge")
      if (oldBadge) {
        oldBadge.remove()
      }

      // Nếu có tin nhắn từ bot và chat đang đóng, hiển thị badge
      if (!this.isExpanded && this.messages.some((m) => m.sender === "bot")) {
        const badge = document.createElement("div")
        badge.className = "notification-badge"
        badge.textContent = this.messages.filter((m) => m.sender === "bot").length
        this.chatButton.appendChild(badge)
      }
    }

    applyCustomColors() {
      // Áp dụng màu sắc tùy chỉnh
      const primaryColor = this.options.primary_color

      // Tạo style element
      const style = document.createElement("style")
      style.textContent = `
                .chat-header {
                    background-color: ${primaryColor};
                }
                .message.user {
                    background-color: ${primaryColor};
                }
                .send-button {
                    background-color: ${primaryColor};
                }
                .chat-button {
                    background-color: ${primaryColor};
                }
                .input-field:focus {
                    border-color: ${primaryColor};
                    box-shadow: 0 0 0 1px ${primaryColor};
                }
            `

      // Thêm style vào head
      document.head.appendChild(style)
    }
  }

  // Khởi tạo chatbot khi trang đã tải xong
  $(document).ready(() => {
    if (typeof wpChatbotSettings !== "undefined") {
      new WPChatbot(wpChatbotSettings)
    } else {
      console.error("wpChatbotSettings is not defined.")
    }
  })
})(jQuery)
