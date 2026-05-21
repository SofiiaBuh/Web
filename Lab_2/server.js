const express = require('express');
const cors = require('cors');
const path = require('path');

const PORT = 3000;

const app = express();

app.use(cors());
app.use(express.json());

app.use(express.static(__dirname));

app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'index.html'));
});

let items = [
    { id: 1, title: 'Вивчити JS', completed: true },
    { id: 2, title: 'Налаштувати Linter', completed: true },
    { id: 3, title: 'Написати тести для React', completed: false },
    { id: 4, title: 'Вивчити websocket', completed: false },
];

app.get('/api/items', (req, res) => {
    res.json(items);
});

app.patch('/api/items/:id', (req, res) => {
    const { id } = req.params;
    const item = items.find((i) => i.id === parseInt(id, 10));
    if (item) {
        item.completed = req.body.completed;
        res.json(item);
    } else {
        res.status(404).send();
    }
});

app.post('/api/items', (req, res) => {
    const newItem = {
        id: Date.now(),
        title: req.body.title,
        completed: false,
    };
    items.push(newItem);
    res.status(201).json(newItem);
});

app.delete('/api/items/:id', (req, res) => {
    const { id } = req.params;
    items = items.filter((item) => item.id !== parseInt(id, 10));
    res.status(204).send();
});

app.listen(PORT, () => {});
