import Storage from "./storage";
import Task from "./task";

export default class Project {
    constructor() {
        this.storage = Storage.create();
        this.task = Task.create();
    }

    static create() {
        return new Project();
    }

    async list() {
        return await this.storage.load(this.storage.keys.prj);
    }

    async get() {
        return await this.storage.get(this.storage.keys.pid);
    }

    async set(id) {
        await this.storage.set(this.storage.keys.pid, id);
        return id;
    }

    async add(name) {
        const prj = await this.list();
        const data = {
            id: this.storage.uuid(),
            name: String(name).trim()
        };

        if (!data.name) return null;
        prj.push(data);
        await this.storage.save(this.storage.keys.prj, prj);

        const curr = await this.get();
        if (!curr) await this.set(data.id);

        return data;
    }

    async remove(id) {
        const prj = await this.list();
        const prev = prj.filter(p => p.id !== id);
        await this.storage.save(this.storage.keys.prj, prev);
        await this.task.delete(id);

        const curr = await this.get();
        if (curr === id) await this.set(prev[prev.length - 1]?.id);
    }
}