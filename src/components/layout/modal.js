import Utility from "../utility";

export default class Modal {
    constructor() {
        this.html = document.getElementById('default-modal') || this._html();
        this.title = this.html.querySelector("#modal-title");
        this.body = this.html.querySelector("#modal-body");
        this.action = this.html.querySelector("#modal-action");
        this.html.querySelector("#modal-close").addEventListener('click', () => this.clear());
        this.html.addEventListener('click', (e) => e.target === this.html && this.clear());
    }

    _html() {
        const html = Utility.renderHTML(`
            <div id="default-modal" tabindex="-1" aria-hidden="true" class="hidden fixed inset-0 z-9999 justify-center items-center w-full h-full bg-slate-800/70">
                <div class="relative p-4 w-full max-w-2xl">
                <div class="relative bg-slate-900">
                    <div class="flex items-center justify-between p-4 border-b border-slate-800">
                    <h3 id="modal-title" class="text-xl font-semibold text-white"></h3>
                    <button type="button" id="modal-close" class="ms-auto inline-flex justify-center items-center cursor-pointer text-gray-400 hover:text-rose-500">
                        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                        <path fill-rule="evenodd" d="M5.47 5.47a.75.75 0 0 1 1.06 0L12 10.94l5.47-5.47a.75.75 0 1 1 1.06 1.06L13.06 12l5.47 5.47a.75.75 0 0 1-1.06 1.06L12 13.06l-5.47 5.47a.75.75 0 0 1-1.06-1.06L10.94 12 5.47 6.53a.75.75 0 0 1 0-1.06Z" clip-rule="evenodd"/>
                        </svg>
                        <span class="sr-only">Close modal</span>
                    </button>
                    </div>
                    <div id="modal-body" class="p-4"></div>
                    <div id="modal-action" class="flex items-center gap-2 p-4 border-t border-slate-800"></div>
                </div>
                </div>
            </div>
        `);

        document.body.appendChild(html);
        return html;
    }

    show() {
        this.html.classList.replace('hidden', 'flex');
    }

    clear() {
        this.html.classList.replace('flex', 'hidden');
        this.title.textContent = '';
        this.body.replaceChildren();
        this.action.replaceChildren();
    }

    static create() {
        return new Modal();
    }

    set(title, body, ...buttons) {
        this.title.textContent = title;
        this.body.replaceChildren(body);
        this.action.replaceChildren(...buttons);
        return this;
    }
}