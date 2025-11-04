import { Bus, Events } from "../controller";
import { format, parseISO } from "date-fns";
import Modal from "./modal";
import List from "../database/list";
import Project from "../database/project";
import Task from "../database/task";
import Utility from "../utility";

export default class Content {
    constructor() {
        this._html = Utility.renderHTML(`
            <section class="relative flex w-full flex-col p-6">
                <div id="content-body" class="flex items-center justify-center h-full"></div>
            </section>
        `);
        
        this.body = this._html.querySelector('#content-body');
        this.project = Project.create();
        this.task = Task.create();
        this.list = List.create();
        this.bind();
    }

    mount(area) {
        area.appendChild(this._html);
        return this;
    }

    static create() {
        return new Content();
    }

    async bind() {
        this.renderContent();
        Bus.addEventListener(Events.TASK_SUCCESS, (e) => this.renderContent(e.detail.id));
        Bus.addEventListener(Events.PROJECT_DELETE, (e) => this.renderContent(e.detail.id));
        Bus.addEventListener(Events.PROJECT_CURRENT, (e) => this.renderContent(e.detail.id));
        Bus.addEventListener(Events.LIST_CREATE, (e) => this.renderContent(e.detail.id));
        Bus.addEventListener(Events.LIST_TOGGLE, (e) => this.renderContent(e.detail.id));
        Bus.addEventListener(Events.LIST_DELETE, (e) => this.renderContent(e.detail.id));
    }

    async renderContent(pid) {
        if (!pid) pid = await this.project.get();
        const id = (await this.project.list()).find(p => p.id === pid);
        if (!id) return this.default();
        
        this.body.className = 'flex flex-col';
        this.body.replaceChildren();

        const container = document.createElement('div');
        container.className = 'flex flex-col';

        const title = document.createElement('h1');
        title.className = 'text-5xl truncate';
        title.textContent = id.name;

        const btnCreate = Utility.renderHTML(`
            <div class="pointer-events-none">
                <button class="pointer-events-auto inline-flex items-center group cursor-pointer">
                    <svg xmlns="http://www.w3.org/2000/svg" class="size-5 me-1 shrink-0 group-hover:fill-sky-500" viewBox="0 0 24 24" fill="currentColor">
                    <path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd"/>
                    </svg>
                    <span class="group-hover:text-sky-800">Create a new task</span>
                </button>
            </div>
        `);
        btnCreate.addEventListener('click', () => this.modalTask(pid));

        const hr = document.createElement('hr');
        hr.className = 'border-slate-800 mt-2 mb-5';

        const column = document.createElement('div');
        column.className = 'columns-4 gap-2';

        const tasks = await this.task.load(pid);
        for (const t of tasks) {
            column.appendChild(this.renderCard(pid, t));
        }

        [title, btnCreate, hr, column].forEach(child => container.appendChild(child));
        this.body.appendChild(container);
    }

    modalTask(pid) {
        const modal = Modal.create();
        const body = Utility.renderHTML(`
            <input id="task-title" class="bg-slate-800 border border-slate-700 text-sm block w-full p-2.5 outline-none" placeholder="JavaScript Classes">
        `);
        const button = Utility.renderHTML(`
            <button type="button" class="bg-sky-600 hover:bg-sky-700 px-3 py-2">Create</button>
        `);
        button.addEventListener('click', async() => {
            const title = body.value;
            if (!pid && !title) return;

            const data = await this.task.add({ pid, title });
            Bus.dispatchEvent(new CustomEvent(Events.TASK_SUCCESS, { detail: { id: data.pid } }));

            modal.clear();
        });

        modal.set('Create a new task', body, button).show();
    }

    renderCard(pid, task) {
        const card = Utility.renderHTML(`
            <div class="bg-slate-900/60 border border-slate-800 p-2 mb-2 break-inside-avoid">
                <div class="flex items-center justify-between mb-2">
                    <h3 class="font-medium text-lg m-0">${task.title}</h3>
                    <div class="flex gap-1">
                        <button type="button" class="hover:text-sky-500 bg-transparent" data-action="add-list" aria-label="Add list">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fill-rule="evenodd" d="M12 3.75a.75.75 0 0 1 .75.75v6.75h6.75a.75.75 0 0 1 0 1.5h-6.75v6.75a.75.75 0 0 1-1.5 0v-6.75H4.5a.75.75 0 0 1 0-1.5h6.75V4.5a.75.75 0 0 1 .75-.75Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                        <button type="button" class="hover:text-rose-500 bg-transparent" data-action="delete-task" aria-label="Delete task">
                            <svg xmlns="http://www.w3.org/2000/svg" class="size-5" viewBox="0 0 24 24" fill="currentColor">
                            <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </div>
                <div class="flex flex-col gap-1" data-role="lists"></div>
            </div>
        `);

        card.querySelector('[data-action="add-list"]').addEventListener('click', () => this.modalList({ pid, tid: task.id }));
        card.querySelector('[data-action="delete-task"]').addEventListener('click', async() => {
            await this.task.remove(task.id);
            Bus.dispatchEvent(new CustomEvent(Events.TASK_SUCCESS, { detail: { id: pid } }));
        });

        const lists = card.querySelector('[data-role="lists"]');
        for (const li of task.lists) {
            const bool = li.status
                ? { border: 'border-l-gray-500', check: 'checked:bg-gray-500 checked:border-gray-500', text: 'text-gray-500' }
                : li.priority === 'High'
                    ? { border: 'border-l-rose-500', check: 'checked:bg-rose-500 checked:border-rose-500', text: '' }
                    : li.priority === 'Medium'
                        ? { border: 'border-l-amber-500', check: 'checked:bg-amber-500 checked:border-amber-500', text: '' }
                        : { border: 'border-l-emerald-500', check: 'checked:bg-emerald-500 checked:border-emerald-500', text: '' };

            const label = Utility.renderHTML(`
                <label class="flex items-center gap-3 p-3 bg-slate-950/50 border-l-4 ${bool.border} select-none">
                    <input type="checkbox" ${li.status ? 'checked="true"' : ''} class="appearance-none h-4 w-4 rounded-full border-2 border-slate-400 ${bool.check} after:content-[''] after:h-2.5 after:w-2.5 after:rounded-full after:bg-white after:scale-0 after:transition-transform checked:after:scale-100" />
                    <div class="flex flex-col">
                        <span class="font-medium ${bool.text}">${li.title}</span>
                        <span class="-mt-1 ${bool.text}">${li.description}</span>
                        <span class="text-sm ${bool.text}">${format(parseISO(li.due), 'MMMM d, yyyy')}</span>
                    </div>
                    <button type="button" class="ml-auto text-slate-400 hover:text-rose-500" data-action="delete-list" aria-label="Delete list">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 1 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd" />
                        </svg>
                    </button>
                </label>
            `);

            label.querySelector('input[type="checkbox"]').addEventListener('change', async(e) => {
                await this.list.toggle(task.id, li.id, e.target.checked);
                Bus.dispatchEvent(new CustomEvent(Events.LIST_TOGGLE, { detail: { id: pid } }));
            });

            label.querySelector('[data-action="delete-list"]').addEventListener('click', async() => {
                await this.list.remove(task.id, li.id);
                Bus.dispatchEvent(new CustomEvent(Events.LIST_DELETE, { detail: { id: pid } }));
            });


            lists.appendChild(label);
        }

        return card;
    }

    modalList({ pid, tid }) {
        const modal = Modal.create();
        const body = Utility.renderHTML(`
            <div class="space-y-3">
                <div class="grid grid-cols-2 gap-2">
                    <div>
                        <label class="block text-sm mb-1">Title</label>
                        <input id="list-title" class="bg-slate-800 border border-slate-700 text-sm block w-full p-2.5 outline-none" placeholder="Add Modal">
                    </div>
                    <div>
                        <label class="block text-sm mb-1">Due Date</label>
                        <input id="list-due" type="date" class="bg-slate-800 border border-slate-700 text-sm block w-full p-2.5 outline-none">
                    </div>
                </div>
                <div>
                    <label class="block text-sm mb-1">Description</label>
                    <textarea id="list-description" class="bg-slate-800 border border-slate-700 text-sm block w-full p-2.5 outline-none resize-none" rows="3" placeholder="We need a global class that should accommodate any needed modal prompts"></textarea>
                </div>
                <div>
                    <span class="block mb-2 text-sm font-medium">Priority</span>
                    <div class="inline-flex items-center gap-3">
                        <input type="radio" name="list-priority" value="Low" checked class="appearance-none h-6 w-6 rounded-full border-2 border-slate-400 checked:bg-emerald-500 checked:border-emerald-500">
                        <input type="radio" name="list-priority" value="Medium" class="appearance-none h-6 w-6 rounded-full border-2 border-slate-400 checked:bg-amber-500 checked:border-amber-500">
                        <input type="radio" name="list-priority" value="High" class="appearance-none h-6 w-6 rounded-full border-2 border-slate-400 checked:bg-rose-500 checked:border-rose-500">
                    </div>
                </div>
            </div>
        `);
        const button = Utility.renderHTML(`
            <button type="button" class="bg-sky-600 hover:bg-sky-700 px-3 py-2">Create</button>
        `);
        button.addEventListener('click', async() => {
            const title = body.querySelector('#list-title').value || 'Please add a title';
            const description = body.querySelector('#list-description').value || 'Add some description';
            const due = body.querySelector('#list-due').value || new Date().toISOString().split('T')[0];
            const priority = body.querySelector('input[name="list-priority"]:checked')?.value || 'Low';

            await this.list.add(tid, { title, description, priority, due });
            Bus.dispatchEvent(new CustomEvent(Events.LIST_CREATE, { detail: { id: pid } }));

            modal.clear();
        });

        modal.set('Add a new list', body, button).show();
    }

    default() {
        this.body.className = 'flex items-center justify-center h-full';
        this.body.replaceChildren(Utility.renderHTML(`
            <div class="max-w-xl">
                <h1 class="m-0 text-4xl font-light">What to do?</h1>
                <p class="text-slate-600">Create a new project to start adding tasks.</p>
            </div>
        `));
    }
}