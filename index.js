import express from "express";
import fetch from "node-fetch";
import redis from 'redis';

const PORT = process.env.PORT || 5000;
const REDIS_PORT = process.env.PORT || 6379;

const client = redis.createClient({
    host: '127.0.0.1',
    port: REDIS_PORT
});

await client.connect();

client.on('error', (err) => console.log('Redis Client Error', err));

// await client.set('name', 'linh');
// const value = await client.get('name');

const app = express();

const setRedis = (key, value) => {
    client.set(JSON.stringify(key), JSON.stringify(value));
}

async function getRepos(req, res, next) {
    try {
        console.log('Fetching Data ...');

        const { username } = req.params;

        const response = await fetch(`https://api.github.com/users/${username}`);

        const userInfo = await response.json();

        setRedis(userInfo.id, {
            'name': userInfo.name,
            'created_at': userInfo.created_at,
            'updated_at': userInfo.updated_at
        })

        res.send(userInfo);
    } catch (err) {
        res.status(500);
    }
}

function cacheMiddleware(req, res, next) {
    const { username } = req.params;

    // client.get(username, (err, data) => {
    //     if (err) throw err;
    //
    //     if (data !== null) {
    //         res.send(data);
    //     } else {
    //         next();
    //     }
    // })
}

app.get('/repos/:username', getRepos);

app.listen(5000, () => {
    console.log(`App listening on port ${PORT}`);
});