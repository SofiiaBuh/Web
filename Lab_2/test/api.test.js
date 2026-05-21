import ApiService from '../api.js';

describe('ApiService', () => {
    beforeEach(() => {
        global.fetch = jest.fn();
    });

    afterEach(() => {
        jest.resetAllMocks();
    });

    test('getAll має успішно отримувати елементи', async () => {
        const mockItems = [{ id: 1, title: 'Тест завдання', completed: false }];
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(mockItems),
        });

        const result = await ApiService.getAll();
        expect(result).toEqual(mockItems);
    });

    test('create має надсилати POST запит з даними', async () => {
        const newItem = { title: 'Нова задача' };
        const savedItem = { id: 123, title: 'Нова задача', completed: false };
        global.fetch.mockResolvedValue({
            ok: true,
            status: 201,
            json: jest.fn().mockResolvedValue(savedItem),
        });

        const result = await ApiService.create(newItem);
        expect(result).toEqual(savedItem);
    });

    test('delete має повертати null для статусу 204 No Content', async () => {
        global.fetch.mockResolvedValue({
            ok: true,
            status: 204,
        });

        const result = await ApiService.delete(1);
        expect(result).toBeNull();
    });

    test('update має надсилати PATCH запит', async () => {
        const updateData = { completed: true };
        const updatedItem = { id: 1, title: 'Задача', completed: true };
        global.fetch.mockResolvedValue({
            ok: true,
            status: 200,
            json: jest.fn().mockResolvedValue(updatedItem),
        });

        const result = await ApiService.update(1, updateData);
        expect(result).toEqual(updatedItem);
    });

    test('має викидати помилку, якщо статус відповіді не ok', async () => {
        global.fetch.mockResolvedValue({
            ok: false,
            status: 500,
        });

        await expect(ApiService.getAll()).rejects.toThrow('Помилка: 500');
    });
});