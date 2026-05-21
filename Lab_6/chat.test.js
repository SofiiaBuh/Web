describe('Тестування фронтенд-додатку WebSocket Chat', () => {
    let mockWsInstance;
    let mockPrompt;
    let sendMessageFn;

    beforeEach(() => {
        jest.resetModules();

        document.body.innerHTML = `
            <div id="chat-container">
                <div id="chatbox"></div>
                <div id="input-area">
                    <input type="text" id="messageInput" placeholder="Напишіть повідомлення..." autocomplete="off">
                    <button onclick="sendMessage()">Надіслати</button>
                </div>
            </div>
        `;

        mockPrompt = jest.fn().mockReturnValue("Тестер");
        global.prompt = mockPrompt;

        global.WebSocket = jest.fn().mockImplementation((url) => {
            mockWsInstance = {
                url: url,
                send: jest.fn(),
                onmessage: null
            };
            return mockWsInstance;
        });

        const chatModule = require('./chat.js');
        sendMessageFn = chatModule.sendMessage;

        window.sendMessage = sendMessageFn;
    });

    afterEach(() => {
        jest.clearAllMocks();
    });

    test('Має запитати ім\'я користувача та підключитися до правильного порту WebSocket', () => {
        expect(mockPrompt).toHaveBeenCalledWith("Введіть ваше ім'я:");
        expect(global.WebSocket).toHaveBeenCalledWith("ws://localhost:8000/ws");
    });

    test('Має коректно відображати системні повідомлення', () => {
        const systemPayload = JSON.stringify({ type: 'system', text: 'Новий користувач приєднався до чату' });

        mockWsInstance.onmessage({ data: systemPayload });

        const chatbox = document.getElementById('chatbox');
        const systemMsg = chatbox.querySelector('.message.system');

        expect(systemMsg).toBeTruthy();
        expect(systemMsg.textContent).toBe('Новий користувач приєднався до чату');
    });

    test('Має приховувати ім\'я користувача та додавати клас .my для власних повідомлень', () => {
        const myPayload = JSON.stringify({ type: 'chat', user: 'Тестер', text: 'Моє тестове повідомлення' });

        mockWsInstance.onmessage({ data: myPayload });

        const chatbox = document.getElementById('chatbox');
        const wrapper = chatbox.querySelector('.message-wrapper.my-wrapper');
        const bubble = wrapper.querySelector('.message.my');
        const label = wrapper.querySelector('.username-label');

        expect(wrapper).toBeTruthy();
        expect(bubble.textContent).toBe('Моє тестове повідомлення');
        expect(label.style.display).toBe('none');
    });

    test('Має відображати ім\'я та додавати клас .other для чужих повідомлень', () => {
        const otherPayload = JSON.stringify({ type: 'chat', user: 'Олег', text: 'Привіт від Олега' });

        mockWsInstance.onmessage({ data: otherPayload });

        const chatbox = document.getElementById('chatbox');
        const wrapper = chatbox.querySelector('.message-wrapper.other-wrapper');
        const bubble = wrapper.querySelector('.message.other');
        const label = wrapper.querySelector('.username-label');

        expect(wrapper).toBeTruthy();
        expect(label.textContent).toBe('Олег');
        expect(bubble.textContent).toBe('Привіт від Олега');
    });

    test('Має перехоплювати та логувати некоректний формат JSON', () => {
        const spyConsole = jest.spyOn(console, 'error').mockImplementation(() => {});

        mockWsInstance.onmessage({ data: 'Не коректний JSON рядок' });

        expect(spyConsole).toHaveBeenCalledWith("Отримано не JSON формат:", "Не коректний JSON рядок");
        spyConsole.mockRestore();
    });

    test('Має відправляти JSON-об\'єкт на сервер, якщо поле введення не порожнє', () => {
        const input = document.getElementById('messageInput');
        input.value = 'Привіт усім!';

        sendMessageFn();

        expect(mockWsInstance.send).toHaveBeenCalled();
        const sentData = JSON.parse(mockWsInstance.send.mock.calls[0][0]);

        expect(sentData).toEqual({
            type: 'chat',
            user: 'Тестер',
            text: 'Привіт усім!'
        });
        expect(input.value).toBe('');
    });

    test('Не має відправляти повідомлення, якщо в полі введення лише пробіли', () => {
        const input = document.getElementById('messageInput');
        input.value = '    ';

        sendMessageFn();

        expect(mockWsInstance.send).not.toHaveBeenCalled();
    });

    test('Має викликати надсилання повідомлення при натисканні клавіші Enter', () => {
        const input = document.getElementById('messageInput');
        input.value = 'Повідомлення через Enter';

        const enterEvent = new KeyboardEvent('keypress', { key: 'Enter' });
        input.dispatchEvent(enterEvent);

        expect(mockWsInstance.send).toHaveBeenCalled();
        expect(input.value).toBe('');
    });

    test('Не має викликати надсилання повідомлення при натисканні інших клавіш (наприклад, Пробіл)', () => {
        const input = document.getElementById('messageInput');
        input.value = 'Якийсь текст';

        const spaceEvent = new KeyboardEvent('keypress', { key: ' ' });
        input.dispatchEvent(spaceEvent);

        expect(mockWsInstance.send).not.toHaveBeenCalled();
        expect(input.value).toBe('Якийсь текст');
    });
});