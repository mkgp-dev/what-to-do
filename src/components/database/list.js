import Storage from "./storage";
import Task from "./task";

export default class List {
    constructor() {
        this.storage = Storage.create();
        this.task = Task.create();
    }

    static create() {
        return new List();
    }

    async add(tid, { title, description, priority, due }) {
        const task = await this.task.list();
        const index = task.findIndex(t => t.id === tid);
        if (index < 0) return null;

        const data = {
            id: this.storage.uuid(),
            title: String(title).trim(),
            description: String(description).trim(),
            priority,
            due,
            status: false
        };

        if (!data.title && !data.description) return null;

        task[index].lists.push(data);
        await this.storage.save(this.storage.keys.tsk, task);

        return data;
    }

    async toggle(tid, lid, bool) {
        const task = await this.task.list();
        const index = task.findIndex(t => t.id === tid);
        if (index < 0) return null;

        const list = task[index].lists.findIndex(l => l.id === lid);
        if (list < 0) return null;

        const flag = bool ? bool : !task[index].lists[list].status;
        task[index].lists[list].status = flag;
        await this.storage.save(this.storage.keys.tsk, task);

        return task[index].lists[list];
    }

    async remove(tid, lid) {
        const task = await this.task.list();
        const index = task.findIndex(t => t.id === tid);
        if (index < 0) return null;

        task[index].lists = task[index].lists.filter(l => l.id !== lid);
        await this.storage.save(this.storage.keys.tsk, task);
    }
}