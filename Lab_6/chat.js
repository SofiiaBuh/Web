const ws = new WebSocket("ws://localhost:8000/ws");
const chatbox = document.getElementById("chatbox");
const input = document.getElementById("messageInput");

let username = prompt("Введіть ваше ім'я:") || "Гість";

ws.onmessage = (event) => {
    let data;
    try {
        data = JSON.parse(event.data);
    } catch (e) {
        console.error("Отримано не JSON формат:", event.data);
        return;
    }
    const messageDiv = document.createElement("div");

    if (data.type === "system") {
        const systemDiv = document.createElement("div");
        systemDiv.className = "message system";
        systemDiv.textContent = data.text;
        chatbox.appendChild(systemDiv);
    } else {
        const wrapper = document.createElement("div");
        const nameLabel = document.createElement("div");
        const bubble = document.createElement("div");

        nameLabel.className = "username-label";
        nameLabel.textContent = data.user;

        bubble.className = "message";
        bubble.textContent = data.text;

        if (data.user === username) {
            wrapper.className = "message-wrapper my-wrapper";
            bubble.classList.add("my");
            // Для своїх повідомлень можна приховати ім'я, якщо хочете
            nameLabel.style.display = "none";
        } else {
            wrapper.className = "message-wrapper other-wrapper";
            bubble.classList.add("other");
        }

        wrapper.appendChild(nameLabel);
        wrapper.appendChild(bubble);
        chatbox.appendChild(wrapper);
    }

    chatbox.scrollTop = chatbox.scrollHeight;
};

function sendMessage() {
    if (input.value.trim() !== "") {
        const messageObject = {
            type: "chat",
            user: username,
            text: input.value
        };
        ws.send(JSON.stringify(messageObject));
        input.value = "";
    }
}

input.addEventListener("keypress", (e) => {
    if (e.key === "Enter") sendMessage();
});

if (typeof module !== 'undefined' && module.exports) {
    module.exports = { sendMessage };
}