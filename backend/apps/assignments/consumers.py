import json
from channels.generic.websocket import AsyncWebsocketConsumer

class AssignmentConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # We allow anyone to connect to the assignments group
        self.room_group_name = 'assignments'
        
        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()

    async def disconnect(self, close_code):
        # Leave room group
        await self.channel_layer.group_discard(
            self.room_group_name,
            self.channel_name
        )

    # Receive message from room group
    async def assignment_accepted(self, event):
        assignment_id = event['assignment_id']
        writer_id = event.get('writer_id')

        # Send message to WebSocket
        await self.send(text_data=json.dumps({
            'type': 'assignment_accepted',
            'assignment_id': assignment_id,
            'writer_id': writer_id
        }))

    async def assignment_cancelled(self, event):
        assignment_id = event['assignment_id']
        writer_id = event.get('writer_id')

        await self.send(text_data=json.dumps({
            'type': 'assignment_cancelled',
            'assignment_id': assignment_id,
            'writer_id': writer_id
        }))

    async def assignment_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'assignment_created',
            'assignment_id': event.get('assignment_id'),
            'visibility': event.get('visibility'),
            'preferredHandwritingStyles': event.get('preferredHandwritingStyles', [])
        }))

    async def direct_assignment_created(self, event):
        await self.send(text_data=json.dumps({
            'type': 'direct_assignment_created',
            'assignment_id': event.get('assignment_id'),
            'writer_id': event.get('writer_id')
        }))

    async def direct_assignment_accepted(self, event):
        await self.send(text_data=json.dumps({
            'type': 'direct_assignment_accepted',
            'assignment_id': event.get('assignment_id'),
            'writer_id': event.get('writer_id')
        }))

    async def direct_assignment_rejected(self, event):
        await self.send(text_data=json.dumps({
            'type': 'direct_assignment_rejected',
            'assignment_id': event.get('assignment_id'),
            'writer_id': event.get('writer_id')
        }))
