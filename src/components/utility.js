import Layout from "./layout/layout.all";

export default class Utility {
    static loadHTML() {
        const app = document.getElementById('app');
        app.appendChild(Layout());
    } 

    static renderHTML(h) {
        const template = document.createElement('template');
        template.innerHTML = h.trim();
        return template.content.firstElementChild;
    }
}