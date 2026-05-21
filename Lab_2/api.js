const BASE_URL = 'http://localhost:3000/api';

const ApiService = {
    async request(endpoint, options = {}) {
        const response = await fetch(`${BASE_URL}${endpoint}`, {
            headers: {
                'Content-Type': 'application/json',
            },
            ...options,
        });

        if (!response.ok) {
            throw new Error(`Помилка: ${response.status}`);
        }

        return response.status === 204 ? null : response.json();
    },

    getAll() {
        return this.request('/items');
    },

    create(data) {
        return this.request('/items', {
            method: 'POST',
            body: JSON.stringify(data),
        });
    },

    delete(id) {
        return this.request(`/items/${id}`, {
            method: 'DELETE',
        });
    },

    update(id, data) {
        return this.request(`/items/${id}`, {
            method: 'PATCH',
            body: JSON.stringify(data),
        });
    },
};

export default ApiService;
