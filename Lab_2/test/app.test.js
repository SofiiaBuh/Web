describe('App Comprehensive UI Tests', () => {
    beforeEach(() => {
        global.fetch = jest.fn();

        document.body.innerHTML = `
            <input type="text" id="itemInput" />
            <button id="addButton">Додати</button>
            <ul id="itemList"></ul>
            <div id="error-container"></div>
        `;
        jest.resetModules();
        jest.clearAllMocks();
    });

    const loadApp = async () => {
        await new Promise((resolve) => {
            jest.isolateModules(async () => {
                await import('../app.js');
                resolve();
            });
        });
        await new Promise(process.nextTick);
    };

    test('Має успішно ініціалізувати додаток та виводити список справ', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue([{ id: 1, title: 'Перша задача', completed: false }]),
        });

        await loadApp();

        const itemList = document.getElementById('itemList');
        expect(itemList.children.length).toBe(1);
        expect(itemList.querySelector('span').textContent).toBe('Перша задача');
    });

    test('Має додавати нове завдання через кнопку', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue([]),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 201,
                json: jest.fn().mockResolvedValue({ id: 2, title: 'Нова задача', completed: false }),
            });

        await loadApp();

        const input = document.getElementById('itemInput');
        const addButton = document.getElementById('addButton');

        input.value = 'Нова задача';
        addButton.click();

        await new Promise(process.nextTick);

        const itemList = document.getElementById('itemList');
        expect(itemList.children.length).toBe(1);
        expect(input.value).toBe('');
    });

    test('Не має додавати завдання, якщо інпут порожній', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue([]),
        });

        await loadApp();

        const addButton = document.getElementById('addButton');
        addButton.click();

        expect(global.fetch).toHaveBeenCalledTimes(1);
    });

    test('Має змінювати стан completed при зміні чекбокса', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue([{ id: 1, title: 'Задача', completed: false }]),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue({ id: 1, title: 'Задача', completed: true }),
            });

        await loadApp();

        const checkbox = document.querySelector('.item-checkbox');
        checkbox.checked = true;
        checkbox.dispatchEvent(new Event('change'));

        await new Promise(process.nextTick);

        const span = document.querySelector('span');
        expect(span.className).toBe('completed-text');
    });

    test('Має видаляти елемент зі списку при кліку на кнопку кошика', async () => {
        global.fetch
            .mockResolvedValueOnce({
                ok: true,
                status: 200,
                json: jest.fn().mockResolvedValue([{ id: 1, title: 'Задача на видалення', completed: false }]),
            })
            .mockResolvedValueOnce({
                ok: true,
                status: 204,
            });

        await loadApp();

        const deleteBtn = document.querySelector('.delete-btn');
        deleteBtn.click();

        await new Promise(process.nextTick);

        const itemList = document.getElementById('itemList');
        expect(itemList.children.length).toBe(0);
    });

    test('Має відображати помилку в UI, якщо сервер недоступний при ініціалізації', async () => {
        global.fetch.mockRejectedValue(new Error('Network Error'));

        await loadApp();

        const errorContainer = document.getElementById('error-container');
        expect(errorContainer.textContent).toContain('Не вдалося завантажити дані');
    });
});