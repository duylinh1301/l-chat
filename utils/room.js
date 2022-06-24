import moment from 'moment';

let rooms = [];

function createRoom(id, name) {
    let room = {
        'id': id,
        'name': name,
    }
    rooms.push(room)
}

function getRoom(id) {
    return rooms.filter(room => room.id  === id);
}

export {
    createRoom
};