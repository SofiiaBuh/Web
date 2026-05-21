import json
from aiohttp import web

connected_clients = set()

async def websocket_handler(request):
    ws = web.WebSocketResponse()
    await ws.prepare(request)

    connected_clients.add(ws)

    welcome_msg = json.dumps({
        "type": "system",
        "text": "Новий користувач приєднався до чату"
    })

    for client in connected_clients:
        await client.send_str(welcome_msg)

    try:
        async for msg in ws:
            if msg.type == web.WSMsgType.TEXT:
                for client in connected_clients:
                    await client.send_str(msg.data)
    finally:
        connected_clients.remove(ws)
        leave_payload = json.dumps({
            "type": "system",
            "text": "Користувач покинув чат"
        })
        for client in connected_clients:
            await client.send_str(leave_payload)
    return ws

async def index_handler(request):
    return web.FileResponse('./index.html')

app = web.Application()
app.add_routes([
    web.get('/', index_handler),
    web.get('/ws', websocket_handler),
    web.static('/', './')
])

if __name__ == '__main__':
    print("Сервер працює: http://localhost:8000")
    web.run_app(app, port=8000)