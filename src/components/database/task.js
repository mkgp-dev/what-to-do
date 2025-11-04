import Storage from "./storage";

export default class Task {
    constructor() {
        this.storage = Storage.create();
    }

    static create() {
        return new Task();
    }

    async list() {
        return await this.storage.load(this.storage.keys.tsk);
    }

    async load(pid) {
        const task = await this.list();
        return task.filter(t => t.pid === pid);
    }
    
    async add({ pid, title }) {
        const task = await this.list();
        const data = {
            id: this.storage.uuid(),
            pid,
            title: String(title).trim(),
            lists: []
        };

        if (!data.pid && !data.title) return null;
        task.push(data);
        await this.storage.save(this.storage.keys.tsk, task);

        return data;
    }

    async remove(id) {
        const task = await this.list();
        const prev = task.filter(t => t.id !== id);
        await this.storage.save(this.storage.keys.tsk, prev);
    }

    async delete(pid) {
        const task = await this.list();
        const prev = task.filter(t => t.pid !== pid);
        await this.storage.save(this.storage.keys.tsk, prev);
    }
}