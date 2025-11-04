import { Bus, Events } from "../controller";
import Modal from "./modal";
import Project from "../database/project";
import Utility from "../utility";

export default class Sidebar {
    constructor() {
        this._html = Utility.renderHTML(`
            <aside class="relative shrink-0 h-screen w-72 bg-slate-900 border-r border-slate-800">
                <div class="p-2">
                    <div class="inline-flex items-center gap-2 mb-4">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-10">
                        <path d="M11.644 1.59a.75.75 0 0 1 .712 0l9.75 5.25a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.712 0l-9.75-5.25a.75.75 0 0 1 0-1.32l9.75-5.25Z" />
                        <path d="m3.265 10.602 7.668 4.129a2.25 2.25 0 0 0 2.134 0l7.668-4.13 1.37.739a.75.75 0 0 1 0 1.32l-9.75 5.25a.75.75 0 0 1-.71 0l-9.75-5.25a.75.75 0 0 1 0-1.32l1.37-.738Z" />
                        <path d="m10.933 19.231-7.668-4.13-1.37.739a.75.75 0 0 0 0 1.32l9.75 5.25c.221.12.489.12.71 0l9.75-5.25a.75.75 0 0 0 0-1.32l-1.37-.738-7.668 4.13a2.25 2.25 0 0 1-2.134-.001Z" />
                        </svg>
                        <div class="flex flex-col leading-none gap-0">
                            <span class="font-semibold text-2xl">What to do.</span>
                            <span class="text-sm -mt-1">Simple To-Do List Manager</span>
                        </div>
                    </div>
                    <div class="space-y-2">
                        <button id="create-project" class="w-full bg-sky-600 px-3 py-2 inline-flex items-center justify-center hover:bg-sky-800 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5 me-1">
                            <path fill-rule="evenodd" d="M19.5 21a3 3 0 0 0 3-3V9a3 3 0 0 0-3-3h-5.379a.75.75 0 0 1-.53-.22L11.47 3.66A2.25 2.25 0 0 0 9.879 3H4.5a3 3 0 0 0-3 3v12a3 3 0 0 0 3 3h15Zm-6.75-10.5a.75.75 0 0 0-1.5 0v2.25H9a.75.75 0 0 0 0 1.5h2.25v2.25a.75.75 0 0 0 1.5 0v-2.25H15a.75.75 0 0 0 0-1.5h-2.25V10.5Z" clip-rule="evenodd" />
                            </svg>
                            Create a new project
                        </button>
                    </div>
                    <div id="sidebar-project"></div>
                </div>
            </aside>
        `);
        
        this.project = Project.create();
        this.bind();
    }

    static create() {
        return new Sidebar();
    }

    mount(area) {
        area.appendChild(this._html);
        return this;
    }

    bind() {
        this.renderList();
        this._html.querySelector("#create-project").addEventListener('click', () => this.createModal());
        //Bus.addEventListener(Events.PROJECT_LOAD, () => this.renderList());
        Bus.addEventListener(Events.PROJECT_SUCCESS, () => this.renderList());
        Bus.addEventListener(Events.PROJECT_CURRENT, (e) => {
            this.active(e.detail.id);
            this.project.set(e.detail.id);
        });
    }

    async createModal() {
        const modal = Modal.create();
        const body = Utility.renderHTML(`
            <input id="project-name" class="bg-slate-800 border border-slate-700 text-sm block w-full p-2.5 outline-none" placeholder="To-Do List Web Application">
        `);
        const button = Utility.renderHTML(`
            <button class="bg-sky-600 hover:bg-sky-700 px-3 py-2">Create</button>
        `);
        button.addEventListener('click', async() => {
            const name = body.value;
            if (!name) return;

            const data = await this.project.add(name);
            Bus.dispatchEvent(new CustomEvent(Events.PROJECT_SUCCESS, { detail: { id: data.id } }));
            Bus.dispatchEvent(new CustomEvent(Events.PROJECT_CURRENT, { detail: { id: data.id } }));

            modal.clear();
        });
        modal.set('Create a new project', body, button).show();
    }

    async renderList() {
        const container = this._html.querySelector('#sidebar-project');
        container.replaceChildren();

        const prj = await this.project.list();
        if (!prj.length) return;

        const hr = document.createElement('hr');
        hr.className = 'my-6 border-slate-800';

        const ul = document.createElement('ul');
        ul.className = 'list-none cursor-pointer';
        ul.addEventListener('click', async(e) => {
            const li = e.target.closest('li[data-id]');
            if (!li) return;
            const id = li.dataset.id;

            const del = e.target.closest('[data-action="delete"');
            if (del) {
                await this.project.remove(id);
                const prev = await this.project.get();
                Bus.dispatchEvent(new CustomEvent(Events.PROJECT_SUCCESS));
                Bus.dispatchEvent(new CustomEvent(Events.PROJECT_DELETE, { detail: { id: prev } }));
                return;
            }

            Bus.dispatchEvent(new CustomEvent(Events.PROJECT_CURRENT, { detail: { id } }));
        });

        prj.forEach(p => {
            ul.appendChild(Utility.renderHTML(`
                <li data-id="${p.id}" class="hover:bg-slate-800 hover:text-slate-100 p-2 text-slate-400">
                    <div class="flex items-center justify-between gap-2">
                        <span class="truncate">${p.name}</span>
                        <button type="button" data-action="delete" class="bg-transparent hover:text-rose-500 shrink-0 cursor-pointer">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-5">
                            <path fill-rule="evenodd" d="M16.5 4.478v.227a48.816 48.816 0 0 1 3.878.512.75.75 0 1 1-.256 1.478l-.209-.035-1.005 13.07a3 3 0 0 1-2.991 2.77H8.084a3 3 0 0 1-2.991-2.77L4.087 6.66l-.209.035a.75.75 0 0 1-.256-1.478A48.567 48.567 0 0 1 7.5 4.705v-.227c0-1.564 1.213-2.9 2.816-2.951a52.662 52.662 0 0 1 3.369 0c1.603.051 2.815 1.387 2.815 2.951Zm-6.136-1.452a51.196 51.196 0 0 1 3.273 0C14.39 3.05 15 3.684 15 4.478v.113a49.488 49.488 0 0 0-6 0v-.113c0-.794.609-1.428 1.364-1.452Zm-.355 5.945a.75.75 0 1 0-1.5.058l.347 9a.75.75 0 1 0 1.499-.058l-.346-9Zm5.48.058a.75.75 0 1 0-1.498-.058l-.347 9a.75.75 0 0 0 1.5.058l.345-9Z" clip-rule="evenodd" />
                            </svg>
                        </button>
                    </div>
                </li>
            `))
        });

        [hr, ul].forEach(child => container.appendChild(child));

        const id = await this.project.get();
        if (id) this.active(id);
    }

    active(id) {
        this._html.querySelectorAll('li[data-id]').forEach(li => {
            const bool = li.dataset.id === id;
            li.classList.toggle("bg-slate-800", bool);
            li.classList.toggle("text-slate-100", bool);
            li.classList.toggle("text-slate-400", !bool);
        });
    }
}