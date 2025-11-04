import localforage from "localforage";
localforage.config({
    name: 'wtd_db',
    storeName: 'local_wtd',
    description: 'Simple Web Storage API powered by localForage'
});

export default class Storage {
    constructor() {
        this.db = localforage;

        this.keys = Object.freeze({
            prj: 'data:projects',
            pid: 'data:project_id',
            tsk: 'data:tasks'
        });
    }

    static create() {
        return new Storage();
    }

    async get(key) {
        return await this.db.getItem(key);
    }

    async set(key, value) {
        await this.db.setItem(key, value);
        return value;
    }

    async remove(key) {
        await this.db.removeItem(key);
    }

    async load(key) {
        const data = await this.db.getItem(key);
        return Array.isArray(data) ? data : [];
    }

    async save(key, array) {
        await this.db.setItem(key, Array.isArray(array) ? array : []);
        return array;
    }

    uuid() {
        return crypto.randomUUID();
    }
}