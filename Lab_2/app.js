import ApiService from './api.js';

const state = {
    items: [],
};

const showError = (message) => {
    const container = document.getElementById('error-container');
    if (container) {
        container.textContent = message;
        setTimeout(() => {
            container.textContent = '';
        }, 5000);
    }
};

const render = () => {
    const list = document.getElementById('itemList');
    list.innerHTML = '';

    state.items.forEach((item) => {
        const li = document.createElement('li');
        li.className = 'item-container';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.checked = item.completed;
        checkbox.className = 'item-checkbox';

        const span = document.createElement('span');
        span.textContent = item.title;
        if (item.completed) {
            span.className = 'completed-text';
        }

        checkbox.onchange = async () => {
            const updated = await ApiService.update(item.id, { completed: checkbox.checked });
            const index = state.items.findIndex((i) => i.id === item.id);
            if (index !== -1) {
                state.items[index].completed = updated.completed;
            }
            render();
        };

        const deleteBtn = document.createElement('button');
        deleteBtn.innerHTML = '&#128465;';
        deleteBtn.className = 'delete-btn';
        deleteBtn.onclick = async () => {
            try {
                await ApiService.delete(item.id);
                state.items = state.items.filter((i) => i.id !== item.id);
                render();
            } catch (err) {
                showError('Помилка при видаленні елемента.');
            }
        };

        li.appendChild(checkbox);
        li.appendChild(span);
        li.appendChild(deleteBtn);
        list.appendChild(li);
    });
};

const init = async () => {
    try {
        state.items = await ApiService.getAll();
        render();
    } catch (error) {
        showError('Не вдалося завантажити дані. Перевірте з’єднання з сервером.');
    }

    document.getElementById('addButton').onclick = async () => {
        const input = document.getElementById('itemInput');
        if (!input.value) return;

        const newItem = await ApiService.create({ title: input.value });
        state.items.push(newItem);
        input.value = '';
        render();
    };
};

init();
